import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const member = await prisma.member.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
        deletedAt: null, // Não retornar membros deletados
      },
      include: {
        ministries: {
          include: {
            ministry: true,
          },
        },
        donations: true,
        consents: {
          where: {
            consentType: 'DATA_PROCESSING',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Buscar data de revogação mais recente
    const latestRevokedConsent = member.consents?.find(c => c.revokedAt !== null)
    const consentRevokedAt = latestRevokedConsent?.revokedAt || null

    // Descriptografar dados sensíveis se necessário
    const memberData = {
      ...member,
      cpf: member.cpfEncrypted && member.cpf ? decrypt(member.cpf) : member.cpf,
      rg: member.rgEncrypted && member.rg ? decrypt(member.rg) : member.rg,
      consentRevokedAt,
    }

    // Registrar log de visualização
    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'VIEW',
      entityType: 'MEMBER',
      entityId: resolvedParams.id,
      description: `Visualização de dados do membro: ${member.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(memberData)
  } catch (error: any) {
    console.error('Erro ao buscar membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar membro' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar dados com Zod
    const { updateMemberSchema } = await import('@/lib/validations')
    const validation = updateMemberSchema.safeParse(body)
    if (!validation.success) {
      console.error('Erro de validação:', validation.error.errors)
      return NextResponse.json(
        {
          error: validation.error.errors[0]?.message || 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data

    const resolvedParams = await Promise.resolve(params)
    const member = await prisma.member.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
        deletedAt: null, // Não permitir atualizar membros deletados
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Criptografar CPF e RG se fornecidos
    const encryptedCpf = validatedData.cpf ? encrypt(validatedData.cpf) : member.cpf
    const encryptedRg = validatedData.rg ? encrypt(validatedData.rg) : member.rg
    const cpfEncrypted = validatedData.cpf ? true : member.cpfEncrypted
    const rgEncrypted = validatedData.rg ? true : member.rgEncrypted

    // Atualizar retenção se status mudou para INACTIVE
    const retentionUntil = validatedData.status === 'INACTIVE' && member.status !== 'INACTIVE'
      ? new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) // 5 anos
      : member.retentionUntil

    const updated = await prisma.member.update({
      where: { id: resolvedParams.id },
      data: {
        name: validatedData.name ?? member.name,
        email: validatedData.email ?? member.email,
        phone: validatedData.phone ?? member.phone,
        phone2: validatedData.phone2 ?? member.phone2,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : member.birthDate,
        address: validatedData.address ?? member.address,
        city: validatedData.city ?? member.city,
        state: validatedData.state ?? member.state,
        zipCode: validatedData.zipCode ?? member.zipCode,
        status: validatedData.status ?? member.status,
        cpf: encryptedCpf,
        rg: encryptedRg,
        cpfEncrypted,
        rgEncrypted,
        maritalStatus: validatedData.maritalStatus ?? member.maritalStatus,
        profession: validatedData.profession ?? member.profession,
        education: validatedData.education ?? member.education,
        emergencyContact: validatedData.emergencyContact ?? member.emergencyContact,
        emergencyPhone: validatedData.emergencyPhone ?? member.emergencyPhone,
        notes: validatedData.notes ?? member.notes,
        retentionUntil,
      },
    })

    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'UPDATE',
      entityType: 'MEMBER',
      entityId: resolvedParams.id,
      description: `Atualização de membro: ${validatedData.name ?? member.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Erro ao atualizar membro:', error)
    console.error('Stack trace:', error.stack)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)
    
    return NextResponse.json(
      {
        error: error.message || 'Erro ao atualizar membro',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          code: error.code,
          meta: error.meta,
        }),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const member = await prisma.member.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
        deletedAt: null, // Não permitir deletar novamente
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete: marcar como deletado ao invés de excluir permanentemente
    const deletionDate = new Date()
    const scheduledPermanentDeletion = new Date()
    scheduledPermanentDeletion.setDate(scheduledPermanentDeletion.getDate() + 30) // 30 dias de graça

    await prisma.member.update({
      where: { id: resolvedParams.id },
      data: {
        deletedAt: deletionDate,
        retentionUntil: scheduledPermanentDeletion,
      },
    })

    // Criar solicitação de exclusão para processamento posterior
    await prisma.dataRequest.create({
      data: {
        memberId: member.id,
        requestType: 'DELETE',
        status: 'PENDING',
        scheduledDeletionAt: scheduledPermanentDeletion,
        notes: `Exclusão solicitada por admin: ${user.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'DELETE',
      entityType: 'MEMBER',
      entityId: resolvedParams.id,
      description: `Soft delete de membro: ${member.name} (exclusão permanente agendada para ${scheduledPermanentDeletion.toLocaleDateString('pt-BR')})`,
      metadata: JSON.stringify({
        softDelete: true,
        scheduledPermanentDeletion: scheduledPermanentDeletion.toISOString(),
      }),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ 
      success: true,
      message: 'Membro marcado para exclusão. Exclusão permanente será realizada em 30 dias.',
      scheduledDeletionAt: scheduledPermanentDeletion,
    })
  } catch (error: any) {
    console.error('Erro ao deletar membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar membro' },
      { status: 500 }
    )
  }
}

