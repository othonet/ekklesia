import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getCorsHeaders } from '@/lib/cors'

// Verificar se é admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return false

    const payload = verifyToken(token)
    if (!payload) return false

    return payload.role === 'ADMIN'
  } catch {
    return false
  }
}

// Atribuir plano a uma igreja
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId } = await Promise.resolve(params)
    const body = await request.json()
    const { planId, expiresAt } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'planId é obrigatório' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se o plano existe
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se a igreja existe
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    })

    if (!church) {
      return NextResponse.json(
        { error: 'Igreja não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Atualizar plano da igreja
    const updatedChurch = await prisma.church.update({
      where: { id: churchId },
      data: {
        planId,
        planAssignedAt: new Date(),
        planExpiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        plan: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      { church: updatedChurch },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atribuir plano à igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atribuir plano' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

