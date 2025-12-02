import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateCertificateHash } from '@/lib/certificate'

export async function GET(request: NextRequest) {
  try {
    // Verificar se prisma.certificate está disponível
    if (!prisma || !prisma.certificate) {
      console.error('Modelo Certificate não encontrado no Prisma Client')
      return NextResponse.json({ 
        error: 'Modelo Certificate não encontrado. Execute: npm run db:generate e reinicie o servidor',
        isValid: false 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const number = searchParams.get('number')
    const hash = searchParams.get('hash')

    if (!number || !hash) {
      return NextResponse.json({ 
        error: 'Número do certificado e hash são obrigatórios',
        isValid: false 
      }, { status: 400 })
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber: number },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
        baptism: {
          select: {
            id: true,
            date: true,
            location: true,
            minister: true,
            memberId: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
          },
        },
        church: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!certificate) {
      // Registrar tentativa de validação de certificado inexistente (possível falsificação)
      console.warn('Tentativa de validação de certificado inexistente:', {
        number,
        hash: hash.substring(0, 16) + '...',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      })
      
      return NextResponse.json({ 
        error: 'Certificado não encontrado no sistema. Este certificado pode ser falsificado.',
        isValid: false,
        fraudAlert: true,
      }, { status: 404 })
    }

    // Verificar se está revogado
    if (certificate.revoked) {
      await prisma.certificateValidation.create({
        data: {
          certificateId: certificate.id,
          isValid: false,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
          notes: 'Certificado revogado',
        },
      })

      return NextResponse.json({ 
        error: 'Este certificado foi revogado',
        isValid: false,
        revoked: true,
        revokedAt: certificate.revokedAt,
        revokeReason: certificate.revokeReason,
      }, { status: 410 })
    }

    // Verificar se está ativo
    if (!certificate.active) {
      await prisma.certificateValidation.create({
        data: {
          certificateId: certificate.id,
          isValid: false,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
          notes: 'Certificado inativo',
        },
      })

      return NextResponse.json({ 
        error: 'Este certificado está inativo',
        isValid: false,
      }, { status: 403 })
    }

    // Verificar validade
    if (certificate.validUntil && new Date(certificate.validUntil) < new Date()) {
      await prisma.certificateValidation.create({
        data: {
          certificateId: certificate.id,
          isValid: false,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
          notes: 'Certificado expirado',
        },
      })

      return NextResponse.json({ 
        error: 'Este certificado expirou',
        isValid: false,
        expired: true,
        validUntil: certificate.validUntil,
      }, { status: 410 })
    }

    // Validar hash incluindo informações críticas (nome e título)
    // Se alguém alterar o nome no documento físico, o hash não corresponderá
    const secret = process.env.CERTIFICATE_SECRET || process.env.JWT_SECRET || 'default-secret'
    
    console.log('Validando certificado:', {
      number: certificate.certificateNumber,
      memberId: certificate.memberId,
      memberName: certificate.member.name,
      type: certificate.type,
      title: certificate.title,
      issuedDate: certificate.issuedDate,
      hashProvided: hash.substring(0, 16) + '...',
      hashStored: certificate.validationHash.substring(0, 16) + '...',
    })
    
    const isValidHash = validateCertificateHash(
      hash,
      certificate.certificateNumber,
      certificate.memberId,
      certificate.member.name,
      certificate.type,
      certificate.title,
      certificate.issuedDate,
      secret
    )

    // Verificar se o hash armazenado no banco corresponde ao fornecido
    const hashMatchesStored = hash === certificate.validationHash

    console.log('Resultado da validação:', {
      isValidHash,
      hashMatchesStored,
    })

    // Registrar validação
    await prisma.certificateValidation.create({
      data: {
        certificateId: certificate.id,
        isValid: isValidHash && hashMatchesStored && !certificate.revoked && certificate.active,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
        notes: isValidHash && hashMatchesStored 
          ? 'Validação bem-sucedida' 
          : `Hash inválido. isValidHash: ${isValidHash}, hashMatchesStored: ${hashMatchesStored}`,
      },
    })

    if (!isValidHash || !hashMatchesStored) {
      // Registrar tentativa de falsificação
      console.warn('Tentativa de validação com hash inválido (possível falsificação):', {
        certificateNumber: certificate.certificateNumber,
        memberId: certificate.memberId,
        hashProvided: hash.substring(0, 16) + '...',
        hashStored: certificate.validationHash.substring(0, 16) + '...',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      })
      
      return NextResponse.json({ 
        error: 'Hash de validação inválido. Este certificado pode ser falsificado. O hash fornecido não corresponde ao certificado registrado no sistema.',
        isValid: false,
        fraudAlert: true,
        debug: process.env.NODE_ENV === 'development' ? {
          hashProvided: hash.substring(0, 16) + '...',
          hashStored: certificate.validationHash.substring(0, 16) + '...',
          isValidHash,
          hashMatchesStored,
        } : undefined,
      }, { status: 403 })
    }

    // Validações cruzadas adicionais para detectar falsificações
    let validationWarnings: string[] = []

    // Verificar se o batismo realmente existe e pertence ao membro
    if (certificate.type === 'BAPTISM' && certificate.baptismId) {
      const baptism = await prisma.baptism.findFirst({
        where: {
          id: certificate.baptismId,
          memberId: certificate.memberId,
        },
      })
      if (!baptism) {
        validationWarnings.push('O batismo associado não foi encontrado ou não pertence a este membro')
      }
    }

    // Verificar se o membro realmente completou o curso
    if (certificate.type === 'COURSE' && certificate.courseId) {
      const memberCourse = await prisma.memberCourse.findFirst({
        where: {
          memberId: certificate.memberId,
          courseId: certificate.courseId,
          status: 'COMPLETED',
        },
      })
      if (!memberCourse) {
        validationWarnings.push('O membro não possui registro de conclusão deste curso no sistema')
      }
    }

    // Verificar se o membro realmente participou do evento
    if (certificate.type === 'EVENT' && certificate.eventId) {
      const attendance = await prisma.attendance.findFirst({
        where: {
          memberId: certificate.memberId,
          eventId: certificate.eventId,
          present: true,
        },
      })
      if (!attendance) {
        validationWarnings.push('O membro não possui registro de participação neste evento no sistema')
      }
    }

    // Se houver avisos, ainda considerar válido mas registrar
    if (validationWarnings.length > 0) {
      console.warn('Avisos de validação para certificado:', {
        certificateNumber: certificate.certificateNumber,
        warnings: validationWarnings,
      })
    }

    // Certificado válido
    return NextResponse.json({
      isValid: true,
      certificate: {
        number: certificate.certificateNumber,
        type: certificate.type,
        title: certificate.title,
        description: certificate.description,
        issuedDate: certificate.issuedDate,
        issuedBy: certificate.issuedBy,
        member: certificate.member,
        baptism: certificate.baptism,
        course: certificate.course,
        event: certificate.event,
        church: certificate.church,
      },
      warnings: validationWarnings.length > 0 ? validationWarnings : undefined,
    })
  } catch (error: any) {
    console.error('Erro ao validar certificado:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro ao validar certificado',
      isValid: false 
    }, { status: 500 })
  }
}

