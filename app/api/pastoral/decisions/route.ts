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
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where: any = {
      churchId: user.churchId,
    }

    if (memberId) {
      where.memberId = memberId
    }

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.decisionDate = {}
      if (startDate) {
        where.decisionDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.decisionDate.lte = new Date(endDate)
      }
    }

    const [decisions, total] = await Promise.all([
      prisma.faithDecision.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pastor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          discipler: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          decisionDate: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.faithDecision.count({ where }),
    ])

    return NextResponse.json(
      {
        decisions,
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
    console.error('Erro ao buscar decisões de fé:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar decisões de fé' },
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

    // Apenas pastores podem registrar decisões
    const allowedRoles = ['ADMIN', 'PASTOR_PRESIDENTE', 'PASTOR']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas pastores podem registrar decisões de fé.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const body = await request.json()
    const {
      memberId,
      type,
      decisionDate,
      location,
      discipleshipStatus = 'NOT_STARTED',
      disciplerId,
      nextSteps,
      notes,
    } = body

    if (!memberId || !type || !decisionDate) {
      return NextResponse.json(
        { error: 'Membro, tipo e data são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se membro pertence à igreja
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

    const decision = await prisma.faithDecision.create({
      data: {
        memberId,
        type,
        decisionDate: new Date(decisionDate),
        location: location || null,
        discipleshipStatus,
        disciplerId: disciplerId || null,
        nextSteps: nextSteps ? JSON.stringify(nextSteps) : null,
        notes: notes || null,
        pastorId: user.userId,
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
        pastor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        discipler: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...decision,
        nextSteps: decision.nextSteps ? JSON.parse(decision.nextSteps) : null,
      },
      { status: 201, headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar decisão de fé:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar decisão de fé' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

