import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('Tentativa de login para:', email)

    const result = await authenticateUser(email, password)

    if (!result) {
      console.log('Credenciais inválidas para:', email)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('Login bem-sucedido para:', email)

    const response = NextResponse.json({
      token: result.token,
      user: result.user,
    })

    const cookieOptions = {
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    }

    // Verificar se o usuário tem acesso à plataforma
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
      select: { isPlatformAdmin: true },
    })

    // Se for platform admin, definir ambos os cookies
    if (user?.isPlatformAdmin) {
      response.cookies.set('platform_token', result.token, cookieOptions)
      response.cookies.set('church_token', result.token, cookieOptions)
    } else {
      // Para outros usuários, apenas cookie da igreja
      response.cookies.set('church_token', result.token, cookieOptions)
    }

    return response
  } catch (error: any) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}

