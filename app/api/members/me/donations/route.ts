import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Busca doações do membro autenticado via JWT
 * Endpoint para uso do app mobile
 */
export async function GET(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Buscar doações do membro
    const donations = await prisma.donation.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: { date: 'desc' },
      take: 100, // Limitar a 100 doações mais recentes
    })

    // Converter Decimal para número
    const donationsData = donations.map((donation) => ({
      ...donation,
      amount: donation.amount ? Number(donation.amount) : 0,
    }))

    return NextResponse.json(donationsData)
  } catch (error: any) {
    console.error('Erro ao buscar doações:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar doações' },
      { status: 500 }
    )
  }
}
