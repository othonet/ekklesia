import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'

/**
 * Cria uma nova escala para o ministério (apenas para líder)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId || !user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const ministryId = resolvedParams.id
    const body = await request.json()
    const { title, description, date, startTime, endTime, location, notes, assignedMemberIds } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Título e data são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar o membro líder correspondente ao usuário através do email
    const leaderMember = await prisma.member.findUnique({
      where: {
        email: user.email,
        churchId: user.churchId,
      },
      select: {
        id: true,
      },
    })

    if (!leaderMember) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o ministério existe e se o membro é líder
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: user.churchId,
        leaderId: leaderMember.id,
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
        { status: 403 }
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

    return NextResponse.json(scheduleWithMembers, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar escala:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar escala' },
      { status: 500 }
    )
  }
}

