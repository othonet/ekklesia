import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const church = await prisma.church.findUnique({
      where: { id: user.churchId },
      select: { name: true },
    })

    if (!church) {
      return NextResponse.json(
        { error: 'Igreja não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ name: church.name })
  } catch (error: any) {
    console.error('Erro ao buscar nome da igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar nome da igreja' },
      { status: 500 }
    )
  }
}

