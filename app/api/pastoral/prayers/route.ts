import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'
import { getCorsHeaders } from '@/lib/cors'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: getCorsHeaders(request) }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')
    const urgency = searchParams.get('urgency')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where: any = {
      churchId: user.churchId,
    }

    if (memberId) {
      where.memberId = memberId
    }

    if (status) {
      where.status = status
    }

    if (urgency) {
      where.urgency = urgency
    }

    // Membros só veem próprios pedidos
    const isMember = !['ADMIN', 'PASTOR_PRESIDENTE', 'PASTOR', 'LEADER'].includes(user.role)
    if (isMember) {
      // Buscar membro pelo userId
      const member = await prisma.member.findFirst({
        where: {
          email: user.email,
          churchId: user.churchId,
        },
      })
      if (member) {
        where.memberId = member.id
      } else {
        return NextResponse.json(
          { prayers: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } },
          { headers: getCorsHeaders(request) }
        )
      }
    }

    const [prayers, total] = await Promise.all([
      prisma.prayerRequest.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.prayerRequest.count({ where }),
    ])

    // Parse prayingUsers JSON
    const prayersWithParsedUsers = prayers.map((prayer) => ({
      ...prayer,
      prayingUsers: prayer.prayingUsers ? JSON.parse(prayer.prayingUsers) : [],
    }))

    return NextResponse.json(
      {
        prayers: prayersWithParsedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar pedidos de oração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pedidos de oração' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: getCorsHeaders(request) }
      )
    }

    const body = await request.json()
    const {
      memberId,
      requestedBy,
      type,
      urgency = 'MEDIUM',
      description,
      isPrivate = false,
    } = body

    if (!requestedBy || !type) {
      return NextResponse.json(
        { error: 'Nome do solicitante e tipo são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Se memberId fornecido, verificar se pertence à igreja
    let finalMemberId = memberId || null
    if (memberId) {
      const member = await prisma.member.findFirst({
        where: {
          id: memberId,
          churchId: user.churchId,
          deletedAt: null,
        },
      })

      if (!member) {
        return NextResponse.json(
          { error: 'Membro não encontrado' },
          { status: 404, headers: getCorsHeaders(request) }
        )
      }
      finalMemberId = member.id
    } else {
      // Se não fornecido, tentar encontrar membro pelo email do usuário
      const member = await prisma.member.findFirst({
        where: {
          email: user.email,
          churchId: user.churchId,
          deletedAt: null,
        },
      })
      if (member) {
        finalMemberId = member.id
      }
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        memberId: finalMemberId,
        requestedBy,
        type,
        urgency,
        description: description || null,
        isPrivate,
        status: 'PENDING',
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // TODO: Enviar notificação para pastores/líderes

    return NextResponse.json(
      { prayer },
      { status: 201, headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar pedido de oração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar pedido de oração' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

