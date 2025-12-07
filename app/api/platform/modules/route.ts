import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'

// Listar todos os módulos
export async function GET(request: NextRequest) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const modules = await prisma.module.findMany({
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(
      { modules },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao listar módulos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao listar módulos' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Criar novo módulo
export async function POST(request: NextRequest) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const body = await request.json()
    const { key, name, description, icon, route, order } = body

    if (!key || !name) {
      return NextResponse.json(
        { error: 'key e name são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    const module = await prisma.module.create({
      data: {
        key,
        name,
        description,
        icon,
        route,
        order: order || 0,
      },
    })

    return NextResponse.json(
      { module },
      { status: 201, headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar módulo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar módulo' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

