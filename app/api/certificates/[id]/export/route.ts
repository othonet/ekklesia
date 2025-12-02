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
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    const certificate = await prisma.certificate.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
      include: {
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
        church: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificado não encontrado' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const validationUrl = `${baseUrl}/validate-certificate?number=${certificate.certificateNumber}&hash=${certificate.validationHash}`

    // Formatar dados para exportação
    const exportData = {
      // Informações básicas
      memberName: certificate.member.name,
      certificateNumber: certificate.certificateNumber,
      validationHash: certificate.validationHash,
      validationUrl: validationUrl,
      qrCodeUrl: certificate.qrCodeUrl || validationUrl,
      churchName: certificate.church.name,
      title: certificate.title,
      description: certificate.description,
      type: certificate.type,
      issuedDate: certificate.issuedDate,
      issuedBy: certificate.issuedBy,
      
      // Dados específicos por tipo
      ...(certificate.baptism && {
        baptism: {
          date: certificate.baptism.date,
          location: certificate.baptism.location,
          minister: certificate.baptism.minister,
        },
      }),
      ...(certificate.course && {
        course: {
          name: certificate.course.name,
          description: certificate.course.description,
        },
      }),
      ...(certificate.event && {
        event: {
          title: certificate.event.title,
          date: certificate.event.date,
          type: certificate.event.type,
        },
      }),
    }

    if (format === 'csv') {
      // Converter para CSV
      const csvRows = []
      csvRows.push(['Campo', 'Valor'])
      Object.entries(exportData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            csvRows.push([`${key}.${subKey}`, String(subValue || '')])
          })
        } else {
          csvRows.push([key, String(value || '')])
        }
      })

      const csv = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="certificado-${certificate.certificateNumber}.csv"`,
        },
      })
    }

    // JSON (padrão)
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="certificado-${certificate.certificateNumber}.json"`,
      },
    })
  } catch (error: any) {
    console.error('Erro ao exportar certificado:', error)
    return NextResponse.json({ error: error.message || 'Erro ao exportar certificado' }, { status: 500 })
  }
}

