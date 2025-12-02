import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const donations = await prisma.donation.findMany({
      where: { churchId: user.churchId },
      orderBy: { date: 'desc' },
      include: { 
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    })

    // Converter Decimal para número em todas as doações
    const donationsData = donations.map(donation => ({
      ...donation,
      amount: Number(donation.amount),
    }))

    return NextResponse.json(donationsData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, date, method, notes, memberId, type } = body

    if (!amount || !date) {
      return NextResponse.json(
        { error: 'Valor e data são obrigatórios' },
        { status: 400 }
      )
    }

    const donationType = type || 'OFFERING'
    const donationDescription = notes || 
      (donationType === 'TITHE' ? 'Dízimo' : 
       donationType === 'OFFERING' ? 'Oferta' : 
       'Contribuição')

    // Criar doação (mantido para compatibilidade)
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        method: method || null,
        notes: notes || null,
        type: donationType,
        memberId: memberId && memberId !== '' ? memberId : null,
        churchId: user.churchId,
      },
      include: { 
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    })

    // Criar registro em Finance como receita (unificação)
    await prisma.finance.create({
      data: {
        description: donationDescription,
        amount: parseFloat(amount),
        type: 'INCOME',
        category: donationType, // Usa o tipo de doação como categoria
        date: new Date(date),
        donationType: donationType,
        method: method || null,
        memberId: memberId && memberId !== '' ? memberId : null,
        churchId: user.churchId,
      },
    })

    // Converter Decimal para número
    const donationData = {
      ...donation,
      amount: Number(donation.amount),
    }

    return NextResponse.json(donationData, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

