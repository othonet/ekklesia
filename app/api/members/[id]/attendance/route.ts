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
    const attendances = await prisma.attendance.findMany({
      where: {
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(attendances)
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

    // Verificar se prisma está disponível
    if (!prisma) {
      console.error('Prisma client não está disponível')
      return NextResponse.json({ 
        error: 'Erro de configuração do banco de dados. Execute: npm run db:generate' 
      }, { status: 500 })
    }

    // Verificar se o modelo attendance existe
    if (!prisma.attendance) {
      console.error('Modelo Attendance não encontrado no Prisma Client')
      return NextResponse.json({ 
        error: 'Modelo Attendance não encontrado. Execute: npm run db:generate e reinicie o servidor' 
      }, { status: 500 })
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { eventId, date, present, notes, serviceType } = body

    if (!date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    // Normalizar a data para comparar apenas dia, mês e ano (ignorar hora)
    // Usar a string da data diretamente para evitar problemas de fuso horário
    const dateParts = date.split('-') // Formato: YYYY-MM-DD
    if (dateParts.length !== 3) {
      return NextResponse.json({ error: 'Formato de data inválido' }, { status: 400 })
    }
    
    const year = parseInt(dateParts[0])
    const month = parseInt(dateParts[1]) - 1 // Mês começa em 0 no JavaScript
    const day = parseInt(dateParts[2])
    
    // Criar data no fuso horário local para evitar problemas de UTC
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999)

    console.log('Verificando frequência:', {
      memberId: resolvedParams.id,
      eventId: eventId || null,
      serviceType: serviceType || null,
      date: startOfDay,
      churchId: user.churchId,
    })

    // Verificar se já existe uma frequência para este membro, evento/serviceType e data (mesmo dia)
    const whereClause: any = {
      memberId: resolvedParams.id,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      churchId: user.churchId,
    }

    if (eventId) {
      whereClause.eventId = eventId
      whereClause.serviceType = null
    } else if (serviceType) {
      whereClause.eventId = null
      whereClause.serviceType = serviceType
    } else {
      whereClause.eventId = null
      whereClause.serviceType = null
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    })

    if (existingAttendance) {
      let eventName = 'Culto Oficial'
      if (existingAttendance.event) {
        eventName = existingAttendance.event.title
      } else if (existingAttendance.serviceType === 'teaching') {
        eventName = 'Culto de Ensino'
      } else if (existingAttendance.serviceType === 'members') {
        eventName = 'Culto de Membros'
      }
      
      const existingDate = new Date(existingAttendance.date).toLocaleDateString('pt-BR')
      
      return NextResponse.json({ 
        error: `Já existe uma frequência registrada para esta data (${existingDate}). Evento: ${eventName}. Por favor, escolha outra data ou edite a frequência existente.`,
        existingAttendance: {
          id: existingAttendance.id,
          date: existingAttendance.date,
          present: existingAttendance.present,
          event: existingAttendance.event,
          serviceType: existingAttendance.serviceType,
        }
      }, { status: 409 }) // 409 Conflict
    }

    // Usar a data normalizada (início do dia) para salvar
    const attendance = await prisma.attendance.create({
      data: {
        memberId: resolvedParams.id,
        eventId: eventId || null,
        serviceType: serviceType || null,
        date: startOfDay,
        present: present !== undefined ? present : true,
        notes: notes || null,
        churchId: user.churchId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    })

    console.log('Frequência criada com sucesso:', attendance.id)
    return NextResponse.json(attendance, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar frequência:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro ao salvar frequência',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

