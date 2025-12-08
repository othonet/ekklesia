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

    console.log('Tentativa de login na plataforma para:', email)

    const result = await authenticateUser(email, password)

    if (!result) {
      console.log('Credenciais inválidas para:', email)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem acesso à plataforma
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
      select: { isPlatformAdmin: true, active: true },
    })

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Usuário inativo' },
        { status: 403 }
      )
    }

    if (!user.isPlatformAdmin) {
      console.log('Acesso negado à plataforma para:', email)
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma podem acessar.' },
        { status: 403 }
      )
    }

    console.log('Login na plataforma bem-sucedido para:', email)

    const response = NextResponse.json({
      token: result.token,
      user: result.user,
    })

    // Apenas definir platform_token (não church_token)
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    }

    response.cookies.set('platform_token', result.token, cookieOptions)
    // Remover church_token se existir (garantir separação)
    response.cookies.delete('church_token')

    return response
  } catch (error: any) {
    console.error('Erro no login da plataforma:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}

