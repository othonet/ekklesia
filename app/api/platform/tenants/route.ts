import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'
import { hashPassword } from '@/lib/auth'

// Listar todas as igrejas
export async function GET(request: NextRequest) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const churches = await prisma.church.findMany({
      include: {
        plan: true,
        users: {
          where: {
            role: 'ADMIN',
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
          take: 1, // Apenas o primeiro admin
        },
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
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
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
      adminEmail,
      adminPassword,
      adminName,
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

    // Criar igreja
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

    // Criar usuário admin se credenciais foram fornecidas
    let adminUser = null
    if (adminEmail && adminPassword) {
      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email do administrador já está em uso' },
          { status: 400, headers: getCorsHeaders(request) }
        )
      }

      // Hash da senha
      const hashedPassword = await hashPassword(adminPassword)

      // Criar usuário admin da igreja (não da plataforma)
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName || 'Administrador',
          password: hashedPassword,
          role: 'ADMIN',
          active: true,
          isPlatformAdmin: false, // Admin da igreja, não da plataforma
          churchId: church.id,
        },
      })
    }

    return NextResponse.json(
      { 
        church,
        adminUser: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        } : null,
      },
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

