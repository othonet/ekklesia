import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Obter JWT_SECRET da variável de ambiente
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.')
  }
  return new TextEncoder().encode(secret)
}

interface JWTPayload {
  userId: string
  email: string
  role: string
  churchId?: string
  isPlatformAdmin?: boolean
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch (error: any) {
    // Não logar erros de token expirado ou inválido repetidamente
    // Apenas logar se for um erro inesperado
    if (error.code !== 'ERR_JWT_EXPIRED' && error.code !== 'ERR_JWT_INVALID') {
      console.error('Erro ao verificar token no middleware:', error.message)
    }
    return null
  }
}

export async function middleware(request: NextRequest) {
  // Rotas da plataforma multitenancy (apenas para super admins)
  const isPlatformRoute = request.nextUrl.pathname.startsWith('/platform')
  const isApiPlatform = request.nextUrl.pathname.startsWith('/api/platform')
  
  // Rotas da administração da igreja
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isApiDashboard = request.nextUrl.pathname.startsWith('/api/dashboard')
  
  // Determinar qual cookie usar baseado na rota
  const cookieName = (isPlatformRoute || isApiPlatform) ? 'platform_token' : 'church_token'
  
  const token = request.cookies.get(cookieName)?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isPlatformLoginPage = request.nextUrl.pathname === '/platform/login'
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth')
  const isApiMembers = request.nextUrl.pathname.startsWith('/api/members/me') // APIs de membros (app mobile)
  const isPrivacyPolicyPage = request.nextUrl.pathname === '/privacy' // Apenas a página de política (pública)
  const isApiPrivacy = request.nextUrl.pathname.startsWith('/api/privacy') // APIs para uso do app mobile
  const isValidateCertificate = request.nextUrl.pathname.startsWith('/validate-certificate')
  const isApiValidate = request.nextUrl.pathname.startsWith('/api/certificates/validate')

  // Se estiver na página de login do tenant e tiver token válido, redirecionar
  if (isAuthPage && token) {
    const payload = await verifyToken(token)
    if (payload) {
      // Sempre redirecionar para dashboard (não permitir acesso à plataforma a partir daqui)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Permitir acesso às rotas públicas ANTES de verificar tokens:
  // - Autenticação (login do tenant)
  // - Login da plataforma
  // - APIs de membros (fazem verificação própria via JWT no header)
  // - Política de privacidade (página informativa)
  // - APIs de privacidade (para uso do app mobile)
  // - Validação de certificados
  if (isAuthPage || isPlatformLoginPage || isApiAuth || isApiMembers || isPrivacyPolicyPage || isApiPrivacy || isValidateCertificate || isApiValidate) {
    // Se estiver na página de login da plataforma e tiver platform_token válido, redirecionar
    if (isPlatformLoginPage && request.cookies.get('platform_token')) {
      const platformToken = request.cookies.get('platform_token')?.value
      if (platformToken) {
        const payload = await verifyToken(platformToken)
        if (payload) {
          // Verificar se é realmente platform admin antes de redirecionar
          if (payload.isPlatformAdmin === true) {
            return NextResponse.redirect(new URL('/platform', request.url))
          } else {
            // Se não tiver flag no token, verificar no banco
            const { isPlatformAdmin } = await import('@/lib/platform-auth')
            const isAdmin = await isPlatformAdmin(request)
            if (isAdmin) {
              return NextResponse.redirect(new URL('/platform', request.url))
            }
            // Se não for admin, limpar cookie e permitir login
            const response = NextResponse.next()
            response.cookies.delete('platform_token')
            return response
          }
        }
      }
    }
    
    // Adicionar headers CORS para APIs (especialmente para app mobile)
    if (isApiAuth || isApiMembers || isApiPrivacy) {
      const response = NextResponse.next()
      
      // CORS seguro: verificar origem permitida
      const origin = request.headers.get('origin')
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
      const isProduction = process.env.NODE_ENV === 'production'
      
      // Em produção, verificar origem permitida
      // Em desenvolvimento ou para app mobile, permitir todas (necessário para desenvolvimento local)
      if (isProduction && allowedOrigins.length > 0) {
        if (origin && allowedOrigins.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin)
        }
        // Se origem não permitida, não definir CORS (bloqueia requisição)
      } else {
        // Desenvolvimento: permitir todas as origens (necessário para app mobile e dev local)
        response.headers.set('Access-Control-Allow-Origin', '*')
      }
      
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      return response
    }
    return NextResponse.next()
  }

  // Bloquear acesso à plataforma se não tiver platform_token
  if (isPlatformRoute || isApiPlatform) {
    const platformToken = request.cookies.get('platform_token')?.value
    if (!platformToken) {
      console.log('[PLATFORM] Acesso negado - sem platform_token')
      return NextResponse.redirect(new URL('/platform/login', request.url))
    }
    
    // Verificar token e isPlatformAdmin
    const platformPayload = await verifyToken(platformToken)
    if (!platformPayload) {
      console.log('[PLATFORM] Token inválido')
      const response = NextResponse.redirect(new URL('/platform/login', request.url))
      response.cookies.delete('platform_token')
      return response
    }
    
    // Verificar se é realmente platform admin (usar flag do JWT ou consultar banco)
    // Se o token não tiver a flag isPlatformAdmin (tokens antigos), verificar no banco
    if (platformPayload.isPlatformAdmin !== true) {
      console.log('[PLATFORM] Token sem flag isPlatformAdmin, verificando no banco...', platformPayload.email)
      // Verificar no banco usando função auxiliar
      const { isPlatformAdmin } = await import('@/lib/platform-auth')
      const isAdmin = await isPlatformAdmin(request)
      if (!isAdmin) {
        console.log('[PLATFORM] Acesso negado - não é platform admin', platformPayload.email)
        return NextResponse.json(
          { error: 'Acesso negado. Apenas administradores da plataforma.' },
          { status: 403 }
        )
      }
      // Se for admin no banco, permitir acesso (token será atualizado no próximo login)
      console.log('[PLATFORM] Acesso permitido após verificação no banco', platformPayload.email)
    } else {
      console.log('[PLATFORM] Acesso permitido - isPlatformAdmin=true no token', platformPayload.email)
    }
  }

  // Bloquear acesso ao dashboard se não tiver church_token
  if (isDashboardRoute || isApiDashboard) {
    const churchToken = request.cookies.get('church_token')?.value
    if (!churchToken) {
      console.log('[TENANT] Acesso negado ao dashboard - sem church_token')
      if (isApiDashboard) {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Verificar token para rotas protegidas
  if (!token) {
    const layer = isPlatformRoute || isApiPlatform ? '[PLATFORM]' : isDashboardRoute || isApiDashboard ? '[TENANT]' : '[UNKNOWN]'
    console.log(`${layer} Token não encontrado para ${request.nextUrl.pathname} - Cookie: ${cookieName}`)
    const redirectUrl = (isPlatformRoute || isApiPlatform) ? '/platform/login' : '/login'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  const payload = await verifyToken(token)
  
  if (!payload) {
    const layer = isPlatformRoute || isApiPlatform ? '[PLATFORM]' : isDashboardRoute || isApiDashboard ? '[TENANT]' : '[UNKNOWN]'
    console.log(`${layer} Token inválido para ${request.nextUrl.pathname}`)
    // Limpar cookie inválido
    const redirectUrl = (isPlatformRoute || isApiPlatform) ? '/platform/login' : '/login'
    const response = NextResponse.redirect(new URL(redirectUrl, request.url))
    response.cookies.delete(cookieName)
    return response
  }

  // Verificação de acesso já feita acima (bloqueio de acesso cruzado)

  // Verificar permissões para rotas do dashboard baseado no role
  // Nota: Verificação detalhada será feita nas APIs e componentes
  // Aqui apenas verificamos roles básicos
  if (isDashboardRoute) {
    const allowedRoles = ['ADMIN', 'PASTOR_PRESIDENTE', 'SECRETARIO', 'TESOUREIRO', 'PASTOR', 'LEADER']
    if (!allowedRoles.includes(payload.role)) {
      console.log('[TENANT] Acesso negado - role não permitido', payload.role)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // NOTA: Verificação de módulos removida do middleware porque o Prisma Client
    // não funciona no Edge Runtime. A verificação de módulos será feita nas
    // páginas/APIs que realmente precisam, usando a função checkModuleAccess
    // ou verificando diretamente nas rotas de API.
  }

  // Logs estruturados por camada
  if (isPlatformRoute || isApiPlatform) {
    console.log('[PLATFORM]', {
      path: request.nextUrl.pathname,
      user: payload.email,
      role: payload.role,
      isPlatformAdmin: payload.isPlatformAdmin,
      timestamp: new Date().toISOString()
    })
  } else if (isDashboardRoute || isApiDashboard) {
    console.log('[TENANT]', {
      path: request.nextUrl.pathname,
      user: payload.email,
      role: payload.role,
      churchId: payload.churchId,
      timestamp: new Date().toISOString()
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

