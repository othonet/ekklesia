import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { verifyMemberToken } from './auth'

/**
 * Obtém o membro autenticado a partir do token JWT no header Authorization
 * Retorna null se token inválido ou membro não encontrado
 */
export async function getAuthenticatedMember(
  request: NextRequest
): Promise<any | null> {
  try {
    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization')
    console.log('🔍 getAuthenticatedMember - Authorization header:', authHeader ? 'Presente' : 'Ausente')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ getAuthenticatedMember - Header Authorization inválido ou ausente')
      // Tentar obter de outros lugares para debug
      const allHeaders = Object.fromEntries(request.headers.entries())
      console.log('📋 Todos os headers recebidos:', Object.keys(allHeaders))
      return null
    }

    const token = authHeader.substring(7)
    console.log('🔑 Token extraído (primeiros 20 chars):', token.substring(0, 20) + '...')
    
    const payload = verifyMemberToken(token)
    console.log('🔑 Payload do token:', payload ? 'Válido' : 'Inválido')

    if (!payload) {
      console.log('❌ Token inválido ou expirado')
      return null
    }

    // Buscar membro no banco
    const member = await prisma.member.findUnique({
      where: { id: payload.memberId },
    })

    if (!member || member.deletedAt) {
      console.log('❌ Membro não encontrado ou deletado')
      return null
    }

    console.log('✅ Membro autenticado:', member.name)
    return member
  } catch (error) {
    console.error('❌ Erro ao obter membro autenticado:', error)
    return null
  }
}

