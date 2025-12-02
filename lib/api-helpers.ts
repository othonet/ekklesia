import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, type JWTPayload } from '@/lib/auth'
import { ZodError } from 'zod'

export function getCurrentUser(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  return verifyToken(token)
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
      ...(details && { details }),
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
