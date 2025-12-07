import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

/**
 * Atualiza o status de bloqueio/liberação do sistema para um tenant
 */
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

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { systemEnabled } = body

    if (typeof systemEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'systemEnabled deve ser um valor booleano' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se a igreja existe
    const church = await prisma.church.findUnique({
      where: { id: resolvedParams.churchId },
    })

    if (!church) {
      return NextResponse.json(
        { error: 'Igreja não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Atualizar status
    const updated = await prisma.church.update({
      where: { id: resolvedParams.churchId },
      data: { systemEnabled },
      include: {
        plan: true,
      },
    })

    return NextResponse.json(
      { 
        church: updated,
        message: systemEnabled 
          ? 'Sistema liberado para o tenant' 
          : 'Sistema bloqueado para o tenant'
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar status do sistema:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar status do sistema' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

