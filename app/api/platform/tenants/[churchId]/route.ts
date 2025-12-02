import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'
import { hashPassword } from '@/lib/auth'

// Atualizar tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId } = await Promise.resolve(params)
    const body = await request.json()
    const {
      name,
      cnpj,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      website,
      pastorName,
      planId,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se a igreja existe
    const existingChurch = await prisma.church.findUnique({
      where: { id: churchId },
    })

    if (!existingChurch) {
      return NextResponse.json(
        { error: 'Igreja não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se CNPJ já existe em outra igreja (se fornecido)
    if (cnpj && cnpj !== existingChurch.cnpj) {
      const churchWithCnpj = await prisma.church.findUnique({
        where: { cnpj },
      })

      if (churchWithCnpj) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado em outra igreja' },
          { status: 400, headers: getCorsHeaders(request) }
        )
      }
    }

    // Atualizar igreja
    const updatedChurch = await prisma.church.update({
      where: { id: churchId },
      data: {
        name,
        cnpj: cnpj || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        website: website || null,
        pastorName: pastorName || null,
        planId: planId || null,
        planAssignedAt: planId ? (existingChurch.planAssignedAt || new Date()) : existingChurch.planAssignedAt,
      },
      include: {
        plan: true,
      },
    })

    return NextResponse.json(
      { church: updatedChurch },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar igreja' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Deletar tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId } = await Promise.resolve(params)

    // Verificar se a igreja existe
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        _count: {
          select: {
            members: true,
            users: true,
          },
        },
      },
    })

    if (!church) {
      return NextResponse.json(
        { error: 'Igreja não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se há dados associados
    if (church._count.members > 0 || church._count.users > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir igreja com membros ou usuários associados. Remova-os primeiro.' 
        },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Deletar igreja
    await prisma.church.delete({
      where: { id: churchId },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao deletar igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar igreja' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

