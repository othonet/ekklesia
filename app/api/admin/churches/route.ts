import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getCorsHeaders } from '@/lib/cors'

// Verificar se é admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('platform_token')?.value || 
                  request.cookies.get('token')?.value // Fallback para compatibilidade
    if (!token) return false

    const payload = verifyToken(token)
    if (!payload) return false

    return payload.role === 'ADMIN'
  } catch {
    return false
  }
}

// Listar todas as igrejas
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const churches = await prisma.church.findMany({
      include: {
        plan: true,
        _count: {
          select: {
            members: {
              where: {
                deletedAt: null,
              },
            },
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(
      { churches },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao listar igrejas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao listar igrejas' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Criar nova igreja
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

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

    // Verificar se CNPJ já existe (se fornecido)
    if (cnpj) {
      const existingChurch = await prisma.church.findUnique({
        where: { cnpj },
      })

      if (existingChurch) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado' },
          { status: 400, headers: getCorsHeaders(request) }
        )
      }
    }

    const church = await prisma.church.create({
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
        planAssignedAt: planId ? new Date() : null,
      },
      include: {
        plan: true,
      },
    })

    return NextResponse.json(
      { church },
      { status: 201, headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar igreja' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}
