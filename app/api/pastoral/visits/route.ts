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
    const pastorId = searchParams.get('pastorId')
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

    if (pastorId) {
      where.pastorId = pastorId
    }

    if (startDate || endDate) {
      where.visitDate = {}
      if (startDate) {
        where.visitDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.visitDate.lte = new Date(endDate)
      }
    }

    // Verificar permissões de privacidade
    const isPastor = ['ADMIN', 'PASTOR_PRESIDENTE', 'PASTOR'].includes(user.role)
    if (!isPastor) {
      // Líderes só veem próprias visitas
      where.pastorId = user.userId
    } else if (user.role !== 'ADMIN' && user.role !== 'PASTOR_PRESIDENTE') {
      // Pastores veem públicas e próprias, mas não confidenciais de outros
      where.OR = [
        { privacy: 'PUBLIC' },
        { privacy: 'PRIVATE', pastorId: user.userId },
        { pastorId: user.userId },
      ]
    }

    const [visits, total] = await Promise.all([
      prisma.pastoralVisit.findMany({
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
        },
        orderBy: {
          visitDate: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.pastoralVisit.count({ where }),
    ])

    return NextResponse.json(
      {
        visits,
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
    console.error('Erro ao buscar visitas pastorais:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar visitas pastorais' },
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

    // Verificar permissão
    const allowedRoles = ['ADMIN', 'PASTOR_PRESIDENTE', 'PASTOR', 'LEADER']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas pastores e líderes podem registrar visitas.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const body = await request.json()
    const {
      memberId,
      visitDate,
      visitType,
      location,
      reason,
      notes,
      actions,
      privacy = 'PUBLIC',
      nextSteps,
      followUpDate,
    } = body

    if (!memberId || !visitDate || !visitType || !reason) {
      return NextResponse.json(
        { error: 'Membro, data, tipo e motivo são obrigatórios' },
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

    const visit = await prisma.pastoralVisit.create({
      data: {
        memberId,
        visitDate: new Date(visitDate),
        visitType,
        location: location || null,
        reason,
        notes: notes || null,
        actions: actions ? JSON.stringify(actions) : null,
        privacy,
        nextSteps: nextSteps || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
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
      },
    })

    return NextResponse.json(
      { visit },
      { status: 201, headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar visita pastoral:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar visita pastoral' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

