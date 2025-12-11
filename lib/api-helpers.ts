import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, type JWTPayload } from '@/lib/auth'
import { ZodError } from 'zod'
import { isSystemEnabled } from './church-status'

export function getCurrentUser(request: NextRequest): JWTPayload | null {
  // Tentar obter token dos cookies corretos primeiro
  const token = request.cookies.get('church_token')?.value || 
                request.cookies.get('platform_token')?.value ||
                request.cookies.get('token')?.value || // Fallback para compatibilidade
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * Verifica se o sistema está habilitado para o usuário atual
 * Retorna erro se o sistema estiver bloqueado
 */
export async function checkSystemEnabled(request: NextRequest): Promise<NextResponse | null> {
  const user = getCurrentUser(request)
  
  if (!user || !user.churchId) {
    return null // Deixa outras verificações tratarem
  }

  const enabled = await isSystemEnabled(user.churchId)
  
  if (!enabled) {
    return NextResponse.json(
      { 
        error: 'Sistema bloqueado. Entre em contato com o administrador da plataforma.',
        blocked: true,
      },
      { status: 403 }
    )
  }

  return null
}

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  if (!token) {
    return {}
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Valida dados usando um schema Zod e retorna erro formatado se inválido
 */
export function validateRequest<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: NextResponse.json(
          { 
            error: firstError?.message || 'Dados inválidos',
            details: error.errors,
          },
          { status: 400 }
        ),
      }
    }
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Erro ao validar dados' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

/**
 * Cria uma resposta de sucesso padronizada
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status })
}
