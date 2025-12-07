import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'
import { getCorsHeaders } from '@/lib/cors'

/**
 * Confirma ou cancela presença do membro em um evento
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> | { eventId: string } }
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

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { willAttend } = body

    if (typeof willAttend !== 'boolean') {
      return NextResponse.json(
        { error: 'Parâmetro "willAttend" deve ser true ou false' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verificar se o evento existe e pertence à mesma igreja
    const event = await prisma.event.findFirst({
      where: {
        id: resolvedParams.eventId,
        churchId: member.churchId,
        active: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Verificar se já existe registro de presença
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        eventId: resolvedParams.eventId,
        date: event.date,
      },
    })

    if (existingAttendance) {
      // Atualizar presença existente
      const updatedAttendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          present: willAttend,
        },
      })

      // Registrar log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: null,
          userEmail: member.email || null,
          action: 'UPDATE',
          entityType: 'ATTENDANCE',
          entityId: updatedAttendance.id,
          description: `Membro ${member.name} ${willAttend ? 'confirmou' : 'cancelou'} presença no evento ${event.title}`,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return NextResponse.json({
        success: true,
        message: willAttend ? 'Presença confirmada com sucesso' : 'Presença cancelada com sucesso',
        attendance: updatedAttendance,
      }, { headers: corsHeaders })
    } else {
      // Criar novo registro de presença
      const newAttendance = await prisma.attendance.create({
        data: {
          memberId: member.id,
          eventId: resolvedParams.eventId,
          date: event.date,
          present: willAttend,
          churchId: member.churchId,
        },
      })

      // Registrar log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: null,
          userEmail: member.email || null,
          action: 'CREATE',
          entityType: 'ATTENDANCE',
          entityId: newAttendance.id,
          description: `Membro ${member.name} ${willAttend ? 'confirmou' : 'cancelou'} presença no evento ${event.title}`,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return NextResponse.json({
        success: true,
        message: willAttend ? 'Presença confirmada com sucesso' : 'Presença cancelada com sucesso',
        attendance: newAttendance,
      }, { headers: corsHeaders })
    }
  } catch (error: any) {
    console.error('Erro ao confirmar presença:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao confirmar presença' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

