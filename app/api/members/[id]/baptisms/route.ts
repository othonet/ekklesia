import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const baptisms = await prisma.baptism.findMany({
      where: {
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(baptisms)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { date, location, minister, notes } = body

    if (!date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    // Verificar se o membro já possui um batismo registrado
    const existingBaptism = await prisma.baptism.findFirst({
      where: {
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (existingBaptism) {
      const existingDate = new Date(existingBaptism.date).toLocaleDateString('pt-BR')
      return NextResponse.json({ 
        error: `Este membro já possui um batismo registrado em ${existingDate}. Cada membro pode ter apenas um batismo. Se necessário, edite o batismo existente.`,
        existingBaptism: {
          id: existingBaptism.id,
          date: existingBaptism.date,
          location: existingBaptism.location,
          minister: existingBaptism.minister,
        }
      }, { status: 409 }) // 409 Conflict
    }

    // Parse da data para evitar problemas de fuso horário
    const dateParts = date.split('-') // Formato: YYYY-MM-DD
    if (dateParts.length !== 3) {
      return NextResponse.json({ error: 'Formato de data inválido' }, { status: 400 })
    }
    
    const year = parseInt(dateParts[0])
    const month = parseInt(dateParts[1]) - 1 // Mês começa em 0 no JavaScript
    const day = parseInt(dateParts[2])
    const baptismDate = new Date(year, month, day, 0, 0, 0, 0)

    const baptism = await prisma.baptism.create({
      data: {
        memberId: resolvedParams.id,
        date: baptismDate,
        location,
        minister,
        notes,
        churchId: user.churchId,
      },
    })

    return NextResponse.json(baptism, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

