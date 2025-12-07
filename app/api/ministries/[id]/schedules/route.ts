import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

/**
 * Lista escalas de um ministério
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    
    // Verificar se o ministério pertence à igreja
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }

    const schedules = await prisma.ministrySchedule.findMany({
      where: {
        ministryId: resolvedParams.id,
        active: true,
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

    return NextResponse.json(schedules)
  } catch (error: any) {
    console.error('Erro ao buscar escalas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Cria uma nova escala para o ministério
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { title, description, date, startTime, endTime, location, notes, assignedMemberIds } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Título e data são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o ministério pertence à igreja
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
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
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
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
        ministryId: resolvedParams.id,
        churchId: user.churchId,
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
              ministryId: resolvedParams.id,
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

    // Registrar log de auditoria
    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'CREATE',
      entityType: 'MINISTRY_SCHEDULE',
      entityId: schedule.id,
      description: `Escala "${title}" criada para o ministério ${ministry.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

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

    return NextResponse.json(scheduleWithMembers, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar escala:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

