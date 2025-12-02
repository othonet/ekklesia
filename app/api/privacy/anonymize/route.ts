import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { anonymize } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
    })

    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'PASTOR')) {
      return NextResponse.json(
        { error: 'Apenas administradores podem anonimizar dados' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'ID do membro é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar membro
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        churchId: user.churchId,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    if (member.anonymized) {
      return NextResponse.json(
        { error: 'Membro já foi anonimizado' },
        { status: 400 }
      )
    }

    // Anonimizar dados pessoais
    const anonymizedName = anonymize(member.name)
    const anonymizedEmail = member.email ? anonymize(member.email) : null
    const anonymizedPhone = member.phone ? anonymize(member.phone) : null
    const anonymizedCpf = member.cpf ? anonymize(member.cpf) : null
    const anonymizedRg = member.rg ? anonymize(member.rg) : null

    await prisma.member.update({
      where: { id: memberId },
      data: {
        name: `[ANONIMIZADO] ${anonymizedName}`,
        email: anonymizedEmail,
        phone: anonymizedPhone,
        phone2: null,
        cpf: anonymizedCpf,
        rg: anonymizedRg,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        emergencyContact: null,
        emergencyPhone: null,
        notes: '[Dados anonimizados conforme LGPD]',
        anonymized: true,
        anonymizedAt: new Date(),
      },
    })

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: 'ANONYMIZE',
        entityType: 'MEMBER',
        entityId: memberId,
        description: `Anonimização de dados do membro: ${member.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Dados anonimizados com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao anonimizar dados:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao anonimizar dados' },
      { status: 500 }
    )
  }
}

