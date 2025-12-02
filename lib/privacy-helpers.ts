import { NextRequest } from 'next/server'
import { prisma } from './prisma'

/**
 * Busca membro usando token de privacidade
 * Retorna null se token inválido ou expirado
 */
export async function getMemberByPrivacyToken(
  request: NextRequest,
  token: string
) {
  if (!token) {
    return null
  }

  try {
    const member = await prisma.member.findFirst({
      where: {
        privacyToken: token,
        deletedAt: null,
        OR: [
          { privacyTokenExpiresAt: null },
          { privacyTokenExpiresAt: { gte: new Date() } },
        ],
      },
    })

    return member
  } catch (error) {
    console.error('Erro ao buscar membro por token de privacidade:', error)
    return null
  }
}

