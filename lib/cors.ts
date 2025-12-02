import { NextRequest } from 'next/server'

/**
 * Headers CORS configurados para produção e desenvolvimento
 * Em produção, apenas permite origens específicas
 * Em desenvolvimento, permite todas as origens (*)
 */
export function getCorsHeaders(request?: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Em produção, usar origens específicas
  // Configure ALLOWED_ORIGINS no .env com origens separadas por vírgula
  const allowedOrigins = isProduction
    ? (process.env.ALLOWED_ORIGINS?.split(',') || [])
    : ['*']

  // Obter origem da requisição
  const origin = request?.headers.get('origin') || ''

  // Determinar origem permitida
  let allowOrigin = '*'
  if (isProduction) {
    // Em produção, verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      allowOrigin = origin || allowedOrigins[0] || '*'
    } else if (allowedOrigins.length > 0) {
      // Se não estiver na lista e não for *, usar a primeira origem permitida
      allowOrigin = allowedOrigins[0]
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': isProduction ? 'true' : 'false',
    'Access-Control-Max-Age': '86400', // 24 horas
  }
}

