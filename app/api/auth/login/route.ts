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

    // Apenas definir church_token (login do tenant)
    // Para acessar a plataforma, usar /platform/login
    response.cookies.set('church_token', result.token, cookieOptions)
    // Remover platform_token se existir (garantir separação)
    response.cookies.delete('platform_token')

    return response
  } catch (error: any) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}

