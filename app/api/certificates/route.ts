import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { generateCertificateNumber, generateValidationHash, generateQRCodeUrl } from '@/lib/certificate'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se prisma.certificate está disponível
    if (!prisma || !prisma.certificate) {
      console.error('Modelo Certificate não encontrado no Prisma Client')
      return NextResponse.json({ 
        error: 'Modelo Certificate não encontrado. Execute: npm run db:generate e reinicie o servidor' 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const type = searchParams.get('type')

    const where: any = {
      churchId: user.churchId,
      active: true,
      revoked: false,
    }

    if (memberId) {
      where.memberId = memberId
    }

    if (type) {
      where.type = type
    }

    const certificates = await prisma.certificate.findMany({
      where,
      select: {
        id: true,
        certificateNumber: true,
        type: true,
        title: true,
        issuedDate: true,
        revoked: true,
        active: true,
        validationHash: true,
        member: {
          select: {
            id: true,
            name: true,
          },
        },
        baptism: {
          select: {
            date: true,
            location: true,
            minister: true,
          },
        },
        course: {
          select: {
            name: true,
            description: true,
          },
        },
        event: {
          select: {
            title: true,
            date: true,
            type: true,
          },
        },
      },
      orderBy: { issuedDate: 'desc' },
    })

    return NextResponse.json(certificates)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se prisma.certificate está disponível
    if (!prisma || !prisma.certificate) {
      console.error('Modelo Certificate não encontrado no Prisma Client')
      return NextResponse.json({ 
        error: 'Modelo Certificate não encontrado. Execute: npm run db:generate e reinicie o servidor' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { memberId, type, title, description, baptismId, courseId, eventId, issuedBy, validUntil } = body

    if (!memberId || !type || !title) {
      return NextResponse.json({ error: 'Membro, tipo e título são obrigatórios' }, { status: 400 })
    }

    // Validar tipo
    const validTypes = ['BAPTISM', 'COURSE', 'EVENT']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo de certificado inválido' }, { status: 400 })
    }

    // Validações específicas por tipo
    if (type === 'BAPTISM' && !baptismId) {
      return NextResponse.json({ error: 'ID do batismo é obrigatório para certificado de batismo' }, { status: 400 })
    }

    if (type === 'COURSE' && !courseId) {
      return NextResponse.json({ error: 'ID do curso é obrigatório para certificado de curso' }, { status: 400 })
    }

    if (type === 'EVENT' && !eventId) {
      return NextResponse.json({ error: 'ID do evento é obrigatório para certificado de evento' }, { status: 400 })
    }

    // Validar se o membro realmente possui os registros necessários
    if (type === 'BAPTISM' && baptismId) {
      // Verificar se o batismo existe e pertence ao membro
      const baptism = await prisma.baptism.findFirst({
        where: {
          id: baptismId,
          memberId: memberId,
          churchId: user.churchId,
        },
      })

      if (!baptism) {
        return NextResponse.json({ 
          error: 'Batismo não encontrado ou não pertence a este membro' 
        }, { status: 404 })
      }

      // Verificar se já existe certificado para este batismo
      const existing = await prisma.certificate.findFirst({
        where: {
          memberId,
          type: 'BAPTISM',
          baptismId,
          churchId: user.churchId,
          revoked: false,
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Já existe um certificado de batismo para este membro' }, { status: 409 })
      }
    }

    if (type === 'COURSE' && courseId) {
      // Verificar se o membro completou o curso
      const memberCourse = await prisma.memberCourse.findFirst({
        where: {
          memberId: memberId,
          courseId: courseId,
          status: 'COMPLETED',
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              churchId: true,
            },
          },
        },
      })

      if (!memberCourse) {
        return NextResponse.json({ 
          error: 'O membro não possui registro de conclusão deste curso. Verifique se o curso foi marcado como concluído.' 
        }, { status: 404 })
      }

      // Verificar se o curso pertence à mesma igreja
      if (memberCourse.course.churchId !== user.churchId) {
        return NextResponse.json({ 
          error: 'O curso não pertence à sua igreja' 
        }, { status: 403 })
      }

      // Verificar se já existe certificado para este curso
      const existing = await prisma.certificate.findFirst({
        where: {
          memberId,
          type: 'COURSE',
          courseId,
          churchId: user.churchId,
          revoked: false,
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Já existe um certificado de conclusão deste curso para este membro' }, { status: 409 })
      }
    }

    if (type === 'EVENT' && eventId) {
      // Verificar se o evento existe e pertence à igreja
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          churchId: user.churchId,
        },
      })

      if (!event) {
        return NextResponse.json({ 
          error: 'Evento não encontrado' 
        }, { status: 404 })
      }

      // Verificar se o membro participou do evento (tem presença registrada)
      const attendance = await prisma.attendance.findFirst({
        where: {
          memberId: memberId,
          eventId: eventId,
          present: true,
        },
      })

      if (!attendance) {
        return NextResponse.json({ 
          error: 'O membro não possui registro de participação neste evento. Verifique se a presença foi registrada.' 
        }, { status: 404 })
      }

      // Verificar se já existe certificado para este evento
      const existing = await prisma.certificate.findFirst({
        where: {
          memberId,
          type: 'EVENT',
          eventId,
          churchId: user.churchId,
          revoked: false,
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Já existe um certificado de participação neste evento para este membro' }, { status: 409 })
      }
    }

    // Buscar informações do membro para incluir no hash
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { name: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
    }

    const issuedDate = new Date()
    const certificateNumber = generateCertificateNumber()
    const secret = process.env.CERTIFICATE_SECRET || process.env.JWT_SECRET || 'default-secret'
    const validationHash = generateValidationHash(
      certificateNumber,
      memberId,
      member.name,
      type,
      title,
      issuedDate,
      secret
    )

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const qrCodeUrl = generateQRCodeUrl(certificateNumber, validationHash, baseUrl)

    const certificate = await prisma.certificate.create({
      data: {
        memberId,
        type,
        title,
        description,
        baptismId: baptismId || null,
        courseId: courseId || null,
        eventId: eventId || null,
        certificateNumber,
        validationHash,
        qrCodeUrl,
        issuedDate,
        issuedBy: issuedBy || user.name || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
        baptism: true,
        course: true,
        event: true,
      },
    })

    return NextResponse.json(certificate, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar certificado:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

