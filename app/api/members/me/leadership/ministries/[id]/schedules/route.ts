import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

/**
 * Lista escalas de um ministério (apenas para líder membro)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const corsHeaders = getCorsHeaders(request)
    
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Resolver params de forma segura
    const resolvedParams = params instanceof Promise ? await params : params
    const ministryId = resolvedParams.id

    // Verificar se o ministério existe e se o membro é líder
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: member.churchId,
        leaderId: member.id,
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado ou você não é líder deste ministério' },
        { status: 403, headers: corsHeaders }
      )
    }

    const schedules = await prisma.ministrySchedule.findMany({
      where: {
        ministryId: ministryId,
        active: true,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Apenas escalas futuras ou de hoje
        },
      },
      include: {
        assignedMembers: {
          include: {
            memberMinistry: {
              include: {
                member: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({
      schedules: schedules.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        date: s.date.toISOString(), // Converter para ISO string para garantir serialização correta
        startTime: s.startTime,
        endTime: s.endTime,
        location: s.location,
        notes: s.notes,
        assignedMembers: s.assignedMembers.map(am => ({
          id: am.memberMinistry.member.id,
          name: am.memberMinistry.member.name,
          email: am.memberMinistry.member.email,
        })),
      })),
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Erro ao buscar escalas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar escalas' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

/**
 * Cria uma nova escala para o ministério (apenas para líder membro)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const corsHeaders = getCorsHeaders(request)
    
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Resolver params de forma segura
    const resolvedParams = params instanceof Promise ? await params : params
    const ministryId = resolvedParams.id
    const body = await request.json()
    const { title, description, date, startTime, endTime, location, notes, assignedMemberIds } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Título e data são obrigatórios' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verificar se o ministério existe e se o membro é líder
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: member.churchId,
        leaderId: member.id,
      },
      include: {
        members: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado ou você não é líder deste ministério' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Criar a escala
    const schedule = await prisma.ministrySchedule.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        location,
        notes,
        ministryId: ministryId,
        churchId: member.churchId,
      },
    })

    // Associar membros à escala
    if (assignedMemberIds && Array.isArray(assignedMemberIds) && assignedMemberIds.length > 0) {
      const scheduleMembers = await Promise.all(
        assignedMemberIds.map(async (memberMinistryId: string) => {
          // Verificar se o memberMinistryId pertence ao ministério
          const memberMinistry = await prisma.memberMinistry.findFirst({
            where: {
              id: memberMinistryId,
              ministryId: ministryId,
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

          if (memberMinistry) {
            const scheduleMember = await prisma.ministryScheduleMember.create({
              data: {
                scheduleId: schedule.id,
                memberMinistryId: memberMinistryId,
              },
            })
            return { scheduleMember, memberMinistry }
          }
          return null
        })
      )

      // Filtrar nulls
      const validMembers = scheduleMembers.filter(Boolean) as Array<{ scheduleMember: any; memberMinistry: any }>
      
      // Marcar como notificado (sem envio de push)
      for (const item of validMembers) {
        if (item && item.scheduleMember) {
          try {
            await prisma.ministryScheduleMember.update({
              where: { id: item.scheduleMember.id },
              data: {
                notified: true,
                notifiedAt: new Date(),
              },
            })
          } catch (error) {
            console.error('Erro ao atualizar status de notificação:', error)
          }
        }
      }
    }

    // Buscar escala completa para retornar
    const scheduleWithMembers = await prisma.ministrySchedule.findUnique({
      where: { id: schedule.id },
      include: {
        assignedMembers: {
          include: {
            memberMinistry: {
              include: {
                member: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(scheduleWithMembers, { status: 201, headers: corsHeaders })
  } catch (error: any) {
    console.error('Erro ao criar escala:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar escala' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}