import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { getAuthenticatedMember } from '@/lib/member-auth'

export async function POST(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Buscar todos os dados do membro
    const memberWithData = await prisma.member.findUnique({
      where: { id: member.id },
      include: {
        donations: true,
        ministries: {
          include: {
            ministry: true,
          },
        },
        consents: true,
        dataRequests: true,
      },
    })

    if (!memberWithData) {
      return NextResponse.json(
        { error: 'Erro ao buscar dados do membro' },
        { status: 500 }
      )
    }

    // Criar objeto com todos os dados pessoais
    const personalData = {
      exportDate: new Date().toISOString(),
      member: {
        id: memberWithData.id,
        name: memberWithData.name,
        email: memberWithData.email,
        phone: memberWithData.phone,
        phone2: memberWithData.phone2,
        birthDate: memberWithData.birthDate,
        address: memberWithData.address,
        city: memberWithData.city,
        state: memberWithData.state,
        zipCode: memberWithData.zipCode,
        status: memberWithData.status,
        memberSince: memberWithData.memberSince,
        // Dados sensíveis - descriptografar se necessário
        cpf: memberWithData.cpfEncrypted && memberWithData.cpf ? decrypt(memberWithData.cpf) : memberWithData.cpf,
        rg: memberWithData.rgEncrypted && memberWithData.rg ? decrypt(memberWithData.rg) : memberWithData.rg,
        maritalStatus: memberWithData.maritalStatus,
        profession: memberWithData.profession,
        education: memberWithData.education,
        emergencyContact: memberWithData.emergencyContact,
        emergencyPhone: memberWithData.emergencyPhone,
        donations: memberWithData.donations,
        ministries: memberWithData.ministries,
        consents: memberWithData.consents,
        dataConsent: memberWithData.dataConsent,
        consentDate: memberWithData.consentDate,
        _warning: 'Este arquivo contém dados pessoais sensíveis. Mantenha-o seguro e não compartilhe.',
      },
      dataRequests: memberWithData.dataRequests || [],
    }

    // Registrar log de auditoria (sem userId pois é ação do próprio membro)
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: member.email || null,
        action: 'EXPORT',
        entityType: 'MEMBER',
        entityId: member.id,
        description: `Exportação de dados pessoais (LGPD) por ${member.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Criar solicitação de exportação
    await prisma.dataRequest.create({
      data: {
        memberId: member.id,
        requestType: 'EXPORT',
        status: 'COMPLETED',
        completedAt: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return new NextResponse(JSON.stringify(personalData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="meus-dados-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error: any) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}
