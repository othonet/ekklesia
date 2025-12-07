import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Obter JWT_SECRET da variável de ambiente
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  return new TextEncoder().encode(secret)
}

interface JWTPayload {
  userId: string
  email: string
  role: string
  churchId?: string
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
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
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth')
  const isApiMembers = request.nextUrl.pathname.startsWith('/api/members/me') // APIs de membros (app mobile)
  const isPrivacyPolicyPage = request.nextUrl.pathname === '/privacy' // Apenas a página de política (pública)
  const isApiPrivacy = request.nextUrl.pathname.startsWith('/api/privacy') // APIs para uso do app mobile
  const isValidateCertificate = request.nextUrl.pathname.startsWith('/validate-certificate')
  const isApiValidate = request.nextUrl.pathname.startsWith('/api/certificates/validate')

  // Se estiver na página de login e tiver token válido, redirecionar baseado no contexto
  if (isAuthPage && token) {
    const payload = await verifyToken(token)
    if (payload) {
      // Se for admin e tiver platform_token, redirecionar para plataforma
      if (payload.role === 'ADMIN' && request.cookies.get('platform_token')) {
        return NextResponse.redirect(new URL('/platform', request.url))
      }
      // Caso contrário, redirecionar para dashboard da igreja
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Permitir acesso às rotas públicas:
  // - Autenticação
  // - APIs de membros (fazem verificação própria via JWT no header)
  // - Política de privacidade (página informativa)
  // - APIs de privacidade (para uso do app mobile)
  // - Validação de certificados
  if (isAuthPage || isApiAuth || isApiMembers || isPrivacyPolicyPage || isApiPrivacy || isValidateCertificate || isApiValidate) {
    // Adicionar headers CORS para APIs (especialmente para app mobile)
    if (isApiAuth || isApiMembers || isApiPrivacy) {
      const response = NextResponse.next()
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }
    return NextResponse.next()
  }

  // Verificar token para rotas protegidas
  if (!token) {
    console.log('Middleware: Token não encontrado para', request.nextUrl.pathname, 'Cookie:', cookieName)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)
  
  if (!payload) {
    console.log('Middleware: Token inválido para', request.nextUrl.pathname)
    // Limpar cookie inválido
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete(cookieName)
    return response
  }

  // Verificar acesso à plataforma multitenancy
  // A verificação de isPlatformAdmin será feita nas APIs (não podemos usar Prisma no edge runtime)
  // Aqui apenas verificamos se tem o platform_token (que só é definido para platform admins)
  if (isPlatformRoute || isApiPlatform) {
    // Se está tentando acessar plataforma mas não tem platform_token, redirecionar
    if (!request.cookies.get('platform_token')) {
      console.log('Middleware: Acesso negado à plataforma - sem platform_token')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // A verificação detalhada de isPlatformAdmin será feita nas APIs
  }

  // Verificar permissões para rotas do dashboard baseado no role
  // Nota: Verificação detalhada será feita nas APIs e componentes
  // Aqui apenas verificamos roles básicos
  if (isDashboardRoute) {
    const allowedRoles = ['ADMIN', 'PASTOR_PRESIDENTE', 'SECRETARIO', 'TESOUREIRO', 'PASTOR', 'LEADER']
    if (!allowedRoles.includes(payload.role)) {
      console.log('Middleware: Acesso negado - role não permitido', payload.role)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  console.log('Middleware: Token válido para', request.nextUrl.pathname, 'Usuário:', payload.email, 'Role:', payload.role, 'Cookie:', cookieName)
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

