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

// Obter estatísticas do sistema
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const [totalChurches, totalMembers, totalPlans, churchesWithPlan] = await Promise.all([
      prisma.church.count(),
      prisma.member.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.plan.count({
        where: {
          active: true,
        },
      }),
      prisma.church.count({
        where: {
          planId: {
            not: null,
          },
          plan: {
            active: true,
          },
          OR: [
            { planExpiresAt: null },
            { planExpiresAt: { gte: new Date() } },
          ],
        },
      }),
    ])

    const stats = {
      totalChurches,
      totalMembers,
      totalPlans,
      activeChurches: churchesWithPlan,
    }

    return NextResponse.json(
      { stats },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao obter estatísticas' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

