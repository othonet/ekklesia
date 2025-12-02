import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, validateRequest, createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { updateBaptismSchema } from '@/lib/validations'

/**
 * Atualizar informações de um batismo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; baptismId: string }> | { id: string; baptismId: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    
    // Validar dados com Zod
    const validation = validateRequest(updateBaptismSchema, body)
    if (!validation.success) {
      return validation.error
    }

    const { date, location, minister, notes } = validation.data

    // Verificar se o batismo existe e pertence à igreja do usuário
    const baptism = await prisma.baptism.findFirst({
      where: {
        id: resolvedParams.baptismId,
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!baptism) {
      return NextResponse.json({ error: 'Batismo não encontrado' }, { status: 404 })
    }

    // Parse da data para evitar problemas de fuso horário
    if (!date) {
      return createErrorResponse('Data é obrigatória', 400)
    }
    
    const dateParts = date.split('-') // Formato: YYYY-MM-DD
    if (dateParts.length !== 3) {
      return createErrorResponse('Formato de data inválido', 400)
    }
    
    const year = parseInt(dateParts[0])
    const month = parseInt(dateParts[1]) - 1 // Mês começa em 0 no JavaScript
    const day = parseInt(dateParts[2])
    const baptismDate = new Date(year, month, day, 0, 0, 0, 0)

    // Atualizar batismo
    const updatedBaptism = await prisma.baptism.update({
      where: { id: resolvedParams.baptismId },
      data: {
        date: baptismDate,
        location: location || null,
        minister: minister || null,
        notes: notes || null,
      },
    })

    // Registrar log de auditoria
    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'UPDATE',
      entityType: 'BAPTISM',
      entityId: updatedBaptism.id,
      description: `Atualização de batismo do membro ${baptism.member.name} - Data: ${baptismDate.toLocaleDateString('pt-BR')}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return createSuccessResponse(updatedBaptism)
  } catch (error: any) {
    console.error('Erro ao atualizar batismo:', error)
    return createErrorResponse(error.message || 'Erro ao atualizar batismo', 500)
  }
}

/**
 * Deletar um batismo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; baptismId: string }> | { id: string; baptismId: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)

    // Verificar se o batismo existe e pertence à igreja do usuário
    const baptism = await prisma.baptism.findFirst({
      where: {
        id: resolvedParams.baptismId,
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!baptism) {
      return createErrorResponse('Batismo não encontrado', 404)
    }

    // Verificar se há certificados associados
    const certificates = await prisma.certificate.findMany({
      where: {
        baptismId: resolvedParams.baptismId,
      },
    })

    if (certificates.length > 0) {
      return createErrorResponse(
        `Não é possível excluir este batismo pois existem ${certificates.length} certificado(s) associado(s). Exclua os certificados primeiro.`,
        400
      )
    }

    // Deletar batismo
    await prisma.baptism.delete({
      where: { id: resolvedParams.baptismId },
    })

    // Registrar log de auditoria
    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'DELETE',
      entityType: 'BAPTISM',
      entityId: resolvedParams.baptismId,
      description: `Exclusão de batismo do membro ${baptism.member.name} - Data: ${new Date(baptism.date).toLocaleDateString('pt-BR')}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return createSuccessResponse({ success: true, message: 'Batismo excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir batismo:', error)
    return createErrorResponse(error.message || 'Erro ao excluir batismo', 500)
  }
}

