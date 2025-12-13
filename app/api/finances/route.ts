import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, validateRequest, createErrorResponse, createSuccessResponse, checkModuleAccess } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createFinanceSchema } from '@/lib/validations'
import { checkPermission } from '@/lib/permissions-helpers'

export async function GET(request: NextRequest) {
  try {
    // Verificar se o módulo FINANCES está ativo
    const moduleCheck = await checkModuleAccess(request, 'FINANCES')
    if (moduleCheck) return moduleCheck

    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    // Verificar permissão para ler finanças
    if (!(await checkPermission(request, 'finances:read'))) {
      return createErrorResponse('Acesso negado. Você não tem permissão para visualizar finanças.', 403)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null

    const where: any = { churchId: user.churchId }
    if (type) {
      where.type = type
    }

    const [finances, total] = await Promise.all([
      prisma.finance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.finance.count({ where }),
    ])

    // Converter Decimal para número
    const financesData = finances.map(f => ({
      ...f,
      amount: typeof f.amount === 'number' ? f.amount : Number(f.amount),
    }))

    return createSuccessResponse({
      data: financesData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return createErrorResponse(error.message || 'Erro ao buscar finanças', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se o módulo FINANCES está ativo
    const moduleCheck = await checkModuleAccess(request, 'FINANCES')
    if (moduleCheck) return moduleCheck

    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    // Verificar permissão para criar finanças
    if (!(await checkPermission(request, 'finances:write'))) {
      return createErrorResponse('Acesso negado. Você não tem permissão para criar transações financeiras.', 403)
    }

    const body = await request.json()
    
    // Validar dados com Zod
    const validation = validateRequest(createFinanceSchema, body)
    if (!validation.success) {
      return validation.error
    }

    const { description, amount, type, category, date, donationType, method, memberId, paymentId } = validation.data

    // Normalizar donationType: remover 'none' e strings vazias
    const normalizedDonationType = (() => {
      if (!donationType) return null
      const dt = String(donationType)
      if (dt === '' || dt === 'none') return null
      if (dt === 'TITHE' || dt === 'OFFERING' || dt === 'CONTRIBUTION') {
        return dt as 'TITHE' | 'OFFERING' | 'CONTRIBUTION'
      }
      return null
    })()

    const finance = await prisma.finance.create({
      data: {
        description,
        amount: typeof amount === 'number' ? amount : parseFloat(String(amount)),
        type,
        category: category && category !== '' ? category : null,
        date: new Date(date),
        donationType: normalizedDonationType,
        method: method && method !== '' ? method : null,
        memberId: memberId && memberId !== '' && memberId !== 'none' ? memberId : null,
        paymentId: paymentId || null,
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const financeData = {
      ...finance,
      amount: Number(finance.amount),
    }

    return createSuccessResponse(financeData, 201)
  } catch (error: any) {
    return createErrorResponse(error.message || 'Erro ao criar transação financeira', 500)
  }
}

