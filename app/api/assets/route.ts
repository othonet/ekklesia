import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, validateRequest, createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createAssetSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const where: any = {
      churchId: user.churchId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { serialNumber: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.asset.count({ where }),
    ])

    // Converter Decimal para número
    const assetsData = assets.map(asset => ({
      ...asset,
      purchaseValue: asset.purchaseValue ? Number(asset.purchaseValue) : null,
      currentValue: asset.currentValue ? Number(asset.currentValue) : null,
      area: asset.area ? Number(asset.area) : null,
    }))

    return createSuccessResponse({
      data: assetsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Erro ao buscar patrimônio:', error)
    return createErrorResponse(error.message || 'Erro ao buscar patrimônio', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    const body = await request.json()
    
    // Validar dados com Zod
    const validation = createAssetSchema.safeParse(body)
    if (!validation.success) {
      console.error('Erro de validação:', validation.error.errors)
      return createErrorResponse(
        validation.error.errors[0]?.message || 'Dados inválidos',
        400,
        validation.error.errors
      )
    }

    const validatedData = validation.data

    // Verificar se número de série já existe (se fornecido)
    if (validatedData.serialNumber) {
      const existingAsset = await prisma.asset.findUnique({
        where: { serialNumber: validatedData.serialNumber },
      })
      if (existingAsset && existingAsset.churchId !== user.churchId) {
        return createErrorResponse('Número de série já cadastrado em outra igreja', 400)
      }
    }

    // Preparar dados para criação
    const createData: any = {
      name: validatedData.name,
      description: validatedData.description || null,
      category: validatedData.category,
      type: validatedData.type,
      brand: validatedData.brand || null,
      model: validatedData.model || null,
      serialNumber: validatedData.serialNumber || null,
      purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
      location: validatedData.location || null,
      status: validatedData.status || 'ACTIVE',
      condition: validatedData.condition || 'GOOD',
      notes: validatedData.notes || null,
      address: validatedData.address || null,
      city: validatedData.city || null,
      state: validatedData.state || null,
      zipCode: validatedData.zipCode || null,
      responsibleId: validatedData.responsibleId || null,
      churchId: user.churchId,
    }

    // Adicionar valores numéricos apenas se não forem null/undefined
    // Prisma aceita números diretamente para campos Decimal
    if (validatedData.purchaseValue !== null && validatedData.purchaseValue !== undefined) {
      createData.purchaseValue = validatedData.purchaseValue
    }

    if (validatedData.currentValue !== null && validatedData.currentValue !== undefined) {
      createData.currentValue = validatedData.currentValue
    }

    if (validatedData.area !== null && validatedData.area !== undefined) {
      createData.area = validatedData.area
    }

    console.log('Dados a serem criados:', JSON.stringify(createData, null, 2))

    const asset = await prisma.asset.create({
      data: createData,
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'CREATE',
      entityType: 'ASSET',
      entityId: asset.id,
      description: `Patrimônio criado: ${validatedData.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    // Converter Decimal para número na resposta
    const responseData = {
      ...asset,
      purchaseValue: asset.purchaseValue ? Number(asset.purchaseValue) : null,
      currentValue: asset.currentValue ? Number(asset.currentValue) : null,
      area: asset.area ? Number(asset.area) : null,
    }

    return createSuccessResponse(responseData, 201)
  } catch (error: any) {
    console.error('Erro ao criar patrimônio:', error)
    console.error('Stack trace:', error.stack)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)
    
    // Retornar mensagem de erro mais detalhada
    const errorMessage = error.message || 'Erro ao criar patrimônio'
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { 
          message: errorMessage,
          stack: error.stack,
          code: error.code,
          meta: error.meta,
        }
      : undefined
    
    return createErrorResponse(errorMessage, 500, errorDetails)
  }
}

