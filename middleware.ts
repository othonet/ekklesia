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

  // Se estiver na página de login da plataforma e tiver platform_token válido, redirecionar
  if (isPlatformLoginPage && request.cookies.get('platform_token')) {
    const platformToken = request.cookies.get('platform_token')?.value
    if (platformToken) {
      const payload = await verifyToken(platformToken)
      if (payload) {
        return NextResponse.redirect(new URL('/platform', request.url))
      }
    }
  }

  // Bloquear acesso à plataforma se não tiver platform_token
  if (isPlatformRoute || isApiPlatform) {
    if (!request.cookies.get('platform_token')) {
      console.log('Middleware: Acesso negado à plataforma - sem platform_token')
      // Redirecionar para login da plataforma
      return NextResponse.redirect(new URL('/platform/login', request.url))
    }
  }

  // Bloquear acesso ao dashboard se não tiver church_token
  if (isDashboardRoute || isApiDashboard) {
    if (!request.cookies.get('church_token')) {
      console.log('Middleware: Acesso negado ao dashboard - sem church_token')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Permitir acesso às rotas públicas:
  // - Autenticação (login do tenant)
  // - Login da plataforma
  // - APIs de membros (fazem verificação própria via JWT no header)
  // - Política de privacidade (página informativa)
  // - APIs de privacidade (para uso do app mobile)
  // - Validação de certificados
  if (isAuthPage || isPlatformLoginPage || isApiAuth || isApiMembers || isPrivacyPolicyPage || isApiPrivacy || isValidateCertificate || isApiValidate) {
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

  // Verificação de acesso já feita acima (bloqueio de acesso cruzado)

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

