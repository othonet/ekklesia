import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { generateValidationHash } from '@/lib/certificate'

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
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificado não encontrado' }, { status: 404 })
    }

    // Gerar novo hash com formato atualizado
    const secret = process.env.CERTIFICATE_SECRET || process.env.JWT_SECRET || 'default-secret'
    const newHash = generateValidationHash(
      certificate.certificateNumber,
      certificate.memberId,
      certificate.member.name,
      certificate.type,
      certificate.title,
      certificate.issuedDate,
      secret
    )

    // Atualizar o hash no banco
    const updated = await prisma.certificate.update({
      where: { id: resolvedParams.id },
      data: {
        validationHash: newHash,
      },
    })

    return NextResponse.json({
      success: true,
      certificate: {
        id: updated.id,
        certificateNumber: updated.certificateNumber,
        validationHash: updated.validationHash,
      },
    })
  } catch (error: any) {
    console.error('Erro ao atualizar hash:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

