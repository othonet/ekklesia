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

    return NextResponse.json(certificate)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

