import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'

/**
 * Lista módulos de uma igreja (plano + individuais)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId } = await Promise.resolve(params)

    const church = await prisma.church.findUnique({
      where: { id: churchId },
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
        customModules: {
          include: {
            module: true,
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

    // Buscar todos os módulos disponíveis no sistema
    const allModules = await prisma.module.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })

    // Módulos do plano
    const planModules = church.plan
      ? church.plan.modules
          .filter((pm) => pm.module.active)
          .map((pm) => ({
            ...pm.module,
            source: 'plan',
            assignedAt: church.planAssignedAt,
            expiresAt: church.planExpiresAt,
          }))
      : []

    // Módulos individuais
    const customModules = church.customModules.map((cm) => ({
      ...cm.module,
      source: 'custom',
      active: cm.active,
      assignedAt: cm.assignedAt,
      expiresAt: cm.expiresAt,
      assignedBy: cm.assignedBy,
    }))

    // Combinar e remover duplicatas (custom tem prioridade)
    const modulesMap = new Map()
    planModules.forEach((m) => {
      if (!modulesMap.has(m.key)) {
        modulesMap.set(m.key, m)
      }
    })
    customModules.forEach((m) => {
      modulesMap.set(m.key, m)
    })

    const activeModules = Array.from(modulesMap.values())

    // Módulos disponíveis mas não atribuídos
    const availableModules = allModules.filter(
      (m) => !activeModules.some((am) => am.key === m.key)
    )

    return NextResponse.json(
      {
        church: {
          id: church.id,
          name: church.name,
        },
        plan: church.plan
          ? {
              id: church.plan.id,
              name: church.plan.name,
              key: church.plan.key,
            }
          : null,
        activeModules,
        availableModules,
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar módulos da igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar módulos' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

/**
 * Atribui ou remove módulo individual de uma igreja
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId } = await Promise.resolve(params)
    const body = await request.json()
    const { moduleId, action, expiresAt } = body // action: 'add' ou 'remove'

    if (!moduleId || !action) {
      return NextResponse.json(
        { error: 'moduleId e action são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Obter usuário que está fazendo a ação
    const user = await import('@/lib/api-helpers').then((m) => m.getCurrentUser(request))
    const assignedBy = user?.userId || null

    if (action === 'add') {
      // Verificar se já existe
      const existing = await prisma.churchModule.findUnique({
        where: {
          churchId_moduleId: {
            churchId,
            moduleId,
          },
        },
      })

      if (existing) {
        // Atualizar existente
        const updated = await prisma.churchModule.update({
          where: { id: existing.id },
          data: {
            active: true,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            assignedBy,
            assignedAt: new Date(),
          },
          include: {
            module: true,
          },
        })

        return NextResponse.json(
          { module: updated, message: 'Módulo ativado com sucesso' },
          { headers: getCorsHeaders(request) }
        )
      } else {
        // Criar novo
        const created = await prisma.churchModule.create({
          data: {
            churchId,
            moduleId,
            active: true,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            assignedBy,
          },
          include: {
            module: true,
          },
        })

        return NextResponse.json(
          { module: created, message: 'Módulo atribuído com sucesso' },
          { status: 201, headers: getCorsHeaders(request) }
        )
      }
    } else if (action === 'remove') {
      // Remover ou desativar módulo
      const existing = await prisma.churchModule.findUnique({
        where: {
          churchId_moduleId: {
            churchId,
            moduleId,
          },
        },
      })

      if (existing) {
        await prisma.churchModule.delete({
          where: { id: existing.id },
        })

        return NextResponse.json(
          { message: 'Módulo removido com sucesso' },
          { headers: getCorsHeaders(request) }
        )
      } else {
        return NextResponse.json(
          { error: 'Módulo não encontrado' },
          { status: 404, headers: getCorsHeaders(request) }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use "add" ou "remove"' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }
  } catch (error: any) {
    console.error('Erro ao gerenciar módulo da igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao gerenciar módulo' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

