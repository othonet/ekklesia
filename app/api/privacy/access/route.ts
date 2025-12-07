import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar dados do membro
    const member = await prisma.member.findFirst({
      where: {
        email: user.email,
        churchId: user.churchId,
      },
      include: {
        donations: {
          select: {
            id: true,
            amount: true,
            date: true,
            method: true,
          },
        },
        ministries: {
          include: {
            ministry: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
        consents: true,
      },
    })

    // Registrar log de acesso
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: 'ACCESS',
        entityType: 'USER_DATA',
        description: 'Acesso aos dados pessoais (LGPD)',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    const data = {
      member: member ? {
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        dataConsent: member.dataConsent,
        consentDate: member.consentDate,
        donationsCount: member.donations.length,
        ministriesCount: member.ministries.length,
        consents: member.consents,
      } : null,
      accessDate: new Date().toISOString(),
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro ao acessar dados:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao acessar dados' },
      { status: 500 }
    )
  }
}

