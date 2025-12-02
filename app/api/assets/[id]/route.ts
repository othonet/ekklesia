import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, validateRequest, createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { updateAssetSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    const resolvedParams = await Promise.resolve(params)
    
    const asset = await prisma.asset.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!asset) {
      return createErrorResponse('Patrimônio não encontrado', 404)
    }

    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'VIEW',
      entityType: 'ASSET',
      entityId: asset.id,
      description: `Visualização de patrimônio: ${asset.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    const assetData = {
      ...asset,
      purchaseValue: asset.purchaseValue ? Number(asset.purchaseValue) : null,
      currentValue: asset.currentValue ? Number(asset.currentValue) : null,
      area: asset.area ? Number(asset.area) : null,
    }

    return createSuccessResponse(assetData)
  } catch (error: any) {
    console.error('Erro ao buscar patrimônio:', error)
    return createErrorResponse(error.message || 'Erro ao buscar patrimônio', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    
    // Validar dados com Zod
    const validation = validateRequest(updateAssetSchema, body)
    if (!validation.success) {
      return validation.error
    }

    // Verificar se o patrimônio existe e pertence à igreja
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!existingAsset) {
      return createErrorResponse('Patrimônio não encontrado', 404)
    }

    // Verificar se número de série já existe em outro patrimônio (se fornecido)
    if (validation.data.serialNumber && validation.data.serialNumber !== existingAsset.serialNumber) {
      const duplicateAsset = await prisma.asset.findUnique({
        where: { serialNumber: validation.data.serialNumber },
      })
      if (duplicateAsset && duplicateAsset.id !== resolvedParams.id) {
        return createErrorResponse('Número de série já cadastrado em outro patrimônio', 400)
      }
    }

    const {
      name,
      description,
      category,
      type,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchaseValue,
      currentValue,
      location,
      status,
      condition,
      notes,
      address,
      city,
      state,
      zipCode,
      area,
      responsibleId,
    } = validation.data

    const updatedAsset = await prisma.asset.update({
      where: { id: resolvedParams.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(category && { category }),
        ...(type && { type }),
        ...(brand !== undefined && { brand: brand || null }),
        ...(model !== undefined && { model: model || null }),
        ...(serialNumber !== undefined && { serialNumber: serialNumber || null }),
        ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
        ...(purchaseValue !== undefined && { purchaseValue: purchaseValue ? purchaseValue : null }),
        ...(currentValue !== undefined && { currentValue: currentValue ? currentValue : null }),
        ...(location !== undefined && { location: location || null }),
        ...(status && { status }),
        ...(condition && { condition }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(state !== undefined && { state: state || null }),
        ...(zipCode !== undefined && { zipCode: zipCode || null }),
        ...(area !== undefined && { area: area ? area : null }),
        ...(responsibleId !== undefined && { responsibleId: responsibleId && responsibleId !== '' ? responsibleId : null }),
      },
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
      action: 'UPDATE',
      entityType: 'ASSET',
      entityId: updatedAsset.id,
      description: `Patrimônio atualizado: ${updatedAsset.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    const assetData = {
      ...updatedAsset,
      purchaseValue: updatedAsset.purchaseValue ? Number(updatedAsset.purchaseValue) : null,
      currentValue: updatedAsset.currentValue ? Number(updatedAsset.currentValue) : null,
      area: updatedAsset.area ? Number(updatedAsset.area) : null,
    }

    return createSuccessResponse(assetData)
  } catch (error: any) {
    console.error('Erro ao atualizar patrimônio:', error)
    return createErrorResponse(error.message || 'Erro ao atualizar patrimônio', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    const resolvedParams = await Promise.resolve(params)
    
    const asset = await prisma.asset.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!asset) {
      return createErrorResponse('Patrimônio não encontrado', 404)
    }

    await prisma.asset.delete({
      where: { id: resolvedParams.id },
    })

    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'DELETE',
      entityType: 'ASSET',
      entityId: resolvedParams.id,
      description: `Patrimônio excluído: ${asset.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return createSuccessResponse({ success: true, message: 'Patrimônio excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir patrimônio:', error)
    return createErrorResponse(error.message || 'Erro ao excluir patrimônio', 500)
  }
}

