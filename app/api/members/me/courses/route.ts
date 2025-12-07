import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Busca cursos do membro autenticado via JWT
 * Endpoint para uso do app mobile
 */
export async function GET(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Buscar cursos do membro
    const memberCourses = await prisma.memberCourse.findMany({
      where: {
        memberId: member.id,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    // Buscar certificados relacionados aos cursos do membro
    const courseIds = memberCourses.map(mc => mc.courseId)
    const certificates = await prisma.certificate.findMany({
      where: {
        memberId: member.id,
        courseId: {
          in: courseIds,
        },
        type: 'COURSE',
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        certificateNumber: true,
        validationHash: true,
        qrCodeUrl: true,
        issuedDate: true,
        issuedBy: true,
        validUntil: true,
        active: true,
        revoked: true,
        courseId: true,
      },
    })

    // Criar mapa de courseId -> certificate para busca rápida
    const certificateMap = new Map(
      certificates.map(cert => [cert.courseId, cert])
    )

    // Formatar resposta no formato esperado pelo modelo CourseInfo do Flutter
    const courses = memberCourses.map((mc) => {
      const certificate = certificateMap.get(mc.courseId) || null
      return {
        id: mc.course.id || '',
        name: mc.course.name || '',
        description: mc.course.description ?? null,
        startDate: mc.startDate.toISOString(),
        endDate: mc.endDate ? mc.endDate.toISOString() : null,
        status: mc.status || 'IN_PROGRESS',
        grade: mc.grade ?? null,
        certificate: mc.certificate ?? false,
        certificateData: certificate ? {
          id: certificate.id,
          type: certificate.type,
          title: certificate.title || mc.course.name || '',
          description: certificate.description ?? null,
          certificateNumber: certificate.certificateNumber,
          validationHash: certificate.validationHash,
          qrCodeUrl: certificate.qrCodeUrl ?? null,
          issuedDate: certificate.issuedDate.toISOString(),
          issuedBy: certificate.issuedBy ?? null,
          validUntil: certificate.validUntil ? certificate.validUntil.toISOString() : null,
          active: certificate.active ?? true,
          revoked: certificate.revoked ?? false,
          course: {
            name: mc.course.name || '',
            description: mc.course.description ?? null,
          },
        } : null,
      }
    })

    return NextResponse.json(courses)
  } catch (error: any) {
    console.error('Erro ao buscar cursos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar cursos' },
      { status: 500 }
    )
  }
}
