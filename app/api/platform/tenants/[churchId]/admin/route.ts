import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'
import { hashPassword } from '@/lib/auth'

// Obter credenciais admin de um tenant
export async function GET(
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

    const { churchId } = await Promise.resolve(params)

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

    // Buscar admin existente
    const existingAdmin = await prisma.user.findFirst({
      where: {
        churchId: churchId,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json(
      {
        hasAdmin: !!existingAdmin,
        admin: existingAdmin || null,
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar admin:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar admin' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Criar ou atualizar credenciais admin de um tenant
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

    const { churchId } = await Promise.resolve(params)
    const body = await request.json()
    const { adminEmail, adminPassword, adminName } = body

    if (!adminEmail || !adminName) {
      return NextResponse.json(
        { error: 'Email e nome do administrador são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
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

    // Verificar se já existe um admin para esta igreja
    const existingAdmin = await prisma.user.findFirst({
      where: {
        churchId: churchId,
        role: 'ADMIN',
      },
    })

    // Se não tem admin existente, senha é obrigatória
    if (!existingAdmin && !adminPassword) {
      return NextResponse.json(
        { error: 'Senha é obrigatória ao criar novo administrador' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Se tem senha, validar tamanho mínimo
    if (adminPassword && adminPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se o email já está em uso por outro usuário
    const emailInUse = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (emailInUse && emailInUse.id !== existingAdmin?.id) {
      return NextResponse.json(
        { error: 'Email já está em uso por outro usuário' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    let adminUser
    if (existingAdmin) {
      // Atualizar admin existente
      const updateData: {
        email: string
        name: string
        password?: string
      } = {
        email: adminEmail,
        name: adminName,
      }

      // Só atualizar senha se fornecida
      if (adminPassword) {
        const hashedPassword = await hashPassword(adminPassword)
        updateData.password = hashedPassword
      }

      adminUser = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: updateData,
      })
    } else {
      // Criar novo admin (senha é obrigatória aqui)
      const hashedPassword = await hashPassword(adminPassword!)
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: 'ADMIN',
          active: true,
          churchId: churchId,
        },
      })
    }

    return NextResponse.json(
      {
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        },
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar/atualizar admin:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar/atualizar admin' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

