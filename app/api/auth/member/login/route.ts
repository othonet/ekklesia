import { NextRequest, NextResponse } from 'next/server'
import { authenticateMember } from '@/lib/auth'
import { getCorsHeaders } from '@/lib/cors'
import { hasMobileAppAccess } from '@/lib/module-permissions'
import { isSystemEnabled } from '@/lib/church-status'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)
  try {
    // Parse do body
    let body: any = {}
    try {
      body = await request.json()
      console.log('Body recebido:', { email: body.email, password: body.password ? '***' : 'ausente' })
    } catch (parseError: any) {
      console.error('Erro ao parsear body:', parseError.message)
      return NextResponse.json(
        { error: 'Erro ao processar requisição. Verifique o formato JSON.' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const { email, password } = body

    if (!email || !password) {
      console.log('Email ou senha faltando. Email:', email ? 'presente' : 'ausente', 'Password:', password ? 'presente' : 'ausente')
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Normalizar email (trim e lowercase)
    const normalizedEmail = email.trim().toLowerCase()
    console.log('Tentativa de login de membro para:', normalizedEmail)

    const result = await authenticateMember(normalizedEmail, password)

    if (!result) {
      console.log('Credenciais inválidas para membro:', normalizedEmail)
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { 
          status: 401,
          headers: corsHeaders,
        }
      )
    }

    console.log('Login bem-sucedido para membro:', email)

    // Verificar se o sistema está habilitado para a igreja
    const systemEnabled = await isSystemEnabled(result.member.churchId)
    
    if (!systemEnabled) {
      return NextResponse.json(
        {
          error: 'Sistema bloqueado. Entre em contato com o administrador da plataforma.',
          blocked: true,
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      )
    }

    // Verificar se a igreja tem acesso ao app mobile
    const hasAccess = await hasMobileAppAccess(result.member.churchId)
    
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Sua igreja não tem acesso ao aplicativo mobile. Entre em contato com o administrador.',
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      )
    }

    return NextResponse.json(
      {
        token: result.token,
        member: result.member,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Erro no login de membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
        { 
          status: 500,
          headers: corsHeaders,
        }
    )
  }
}

