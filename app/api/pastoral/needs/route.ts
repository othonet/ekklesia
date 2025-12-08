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

    // Membros só veem próprias necessidades
    const isMember = !['ADMIN', 'PASTOR_PRESIDENTE', 'PASTOR', 'LEADER'].includes(user.role)
    if (isMember) {
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
          { needs: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } },
          { headers: getCorsHeaders(request) }
        )
      }
    }

    const [needs, total] = await Promise.all([
      prisma.memberNeed.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          helpingMinistry: {
            select: {
              id: true,
              name: true,
            },
          },
          helpingUser: {
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
      prisma.memberNeed.count({ where }),
    ])

    return NextResponse.json(
      {
        needs,
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
    console.error('Erro ao buscar necessidades:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar necessidades' },
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
      type,
      urgency = 'MEDIUM',
      estimatedValue,
      description,
    } = body

    if (!memberId || !type) {
      return NextResponse.json(
        { error: 'Membro e tipo são obrigatórios' },
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

    const need = await prisma.memberNeed.create({
      data: {
        memberId,
        type,
        urgency,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        description: description || null,
        status: 'REQUESTED',
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
      { need },
      { status: 201, headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar necessidade:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar necessidade' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

