import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'
import { hashPassword, verifyPassword } from '@/lib/auth'

/**
 * Atualiza credenciais (email e senha) do membro autenticado via JWT
 */
export async function PUT(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, currentPassword, newPassword } = body

    // Buscar membro completo do banco
    const memberData = await prisma.member.findUnique({
      where: { id: member.id },
    })

    if (!memberData) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // Atualizar email (se fornecido)
    if (email !== undefined && email !== memberData.email) {
      // Verificar se o email já está em uso por outro membro
      const existingMember = await prisma.member.findUnique({
        where: { email },
      })

      if (existingMember && existingMember.id !== member.id) {
        return NextResponse.json(
          { error: 'Este email já está em uso por outro membro' },
          { status: 400 }
        )
      }

      updateData.email = email
    }

    // Atualizar senha (se fornecido)
    if (newPassword !== undefined) {
      // Se o membro já tem senha, verificar a senha atual
      if (memberData.password) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Senha atual é obrigatória para alterar a senha' },
            { status: 400 }
          )
        }

        const isValidPassword = await verifyPassword(currentPassword, memberData.password)
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Senha atual incorreta' },
            { status: 401 }
          )
        }
      }

      // Validar nova senha
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres' },
          { status: 400 }
        )
      }

      updateData.password = await hashPassword(newPassword)
    }

    // Se não há nada para atualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização' },
        { status: 400 }
      )
    }

    // Atualizar membro
    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: updateData,
    })

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: updatedMember.email || null,
        action: 'UPDATE',
        entityType: 'MEMBER',
        entityId: updatedMember.id,
        description: `Membro ${updatedMember.name} atualizou suas credenciais via app mobile`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Credenciais atualizadas com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao atualizar credenciais do membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar credenciais' },
      { status: 500 }
    )
  }
}

