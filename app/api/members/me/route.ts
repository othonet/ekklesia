import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decrypt, encrypt } from '@/lib/encryption'
import { getAuthenticatedMember } from '@/lib/member-auth'
import { hashPassword } from '@/lib/auth'

/**
 * Busca dados completos do membro autenticado via JWT
 * Endpoint para uso do app mobile
 */
// Headers CORS
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() })
}

export async function GET(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { 
          status: 401,
          headers: getCorsHeaders(),
        }
      )
    }

    // Buscar dados completos do membro
    const memberData = await prisma.member.findUnique({
      where: { id: member.id },
      include: {
        ministries: {
          include: {
            ministry: {
              select: {
                id: true,
                name: true,
                description: true,
                active: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        donations: {
          orderBy: { date: 'desc' },
          take: 50, // Limitar a 50 doações mais recentes
        },
        courses: {
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
        },
        certificates: {
          include: {
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
        },
      },
    })

    if (!memberData) {
      return NextResponse.json(
        { error: 'Dados do membro não encontrados' },
        { 
          status: 404,
          headers: getCorsHeaders(),
        }
      )
    }

    // Transformar dados para o formato esperado pelo app mobile
    const transformedData = {
      ...memberData,
      // Transformar ministries: de { id, joinedAt, role, ministry: { id, name, ... } } para { id, name, description, role, joinedAt }
      ministries: memberData.ministries?.map((mm: any) => {
        if (!mm.ministry) return null; // Pular se ministry não existir
        return {
          id: mm.ministry.id || '',
          name: mm.ministry.name || '',
          description: mm.ministry.description || null,
          role: mm.role || null,
          joinedAt: mm.joinedAt,
        };
      }).filter((m: any) => m !== null) || [],
      // Transformar courses: de { id, startDate, endDate, status, grade, certificate, course: { id, name, ... } } para { id, name, description, startDate, endDate, status, grade, certificate }
      courses: memberData.courses?.map((mc: any) => {
        if (!mc.course) return null; // Pular se course não existir
        return {
          id: mc.id || '',
          name: mc.course.name || '',
          description: mc.course.description || null,
          startDate: mc.startDate,
          endDate: mc.endDate || null,
          status: mc.status || 'IN_PROGRESS',
          grade: mc.grade || null,
          certificate: mc.certificate || false,
          certificateData: null, // Não incluído por padrão
        };
      }).filter((c: any) => c !== null) || [],
      // Descriptografar dados sensíveis
      cpf: memberData.cpfEncrypted && memberData.cpf ? decrypt(memberData.cpf) : memberData.cpf,
      rg: memberData.rgEncrypted && memberData.rg ? decrypt(memberData.rg) : memberData.rg,
      // Remover campos sensíveis de segurança
      cpfEncrypted: undefined,
      rgEncrypted: undefined,
      password: undefined,
    }

    // Registrar log de acesso
    await prisma.auditLog.create({
      data: {
        userId: null, // Ação do próprio membro via JWT
        userEmail: memberData.email || null,
        action: 'VIEW',
        entityType: 'MEMBER',
        entityId: memberData.id,
        description: `Acesso aos dados pessoais via app mobile por ${memberData.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      transformedData,
      { headers: getCorsHeaders() }
    )
  } catch (error: any) {
    console.error('Erro ao buscar dados do membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados' },
      { 
        status: 500,
        headers: getCorsHeaders(),
      }
    )
  }
}

/**
 * Atualiza dados do membro autenticado via JWT
 * Permite que o membro atualize suas próprias informações
 */
export async function PUT(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { 
          status: 401,
          headers: getCorsHeaders(),
        }
      )
    }

    const body = await request.json()
    const {
      name,
      phone,
      phone2,
      birthDate,
      address,
      city,
      state,
      zipCode,
      maritalStatus,
      profession,
      education,
      emergencyContact,
      emergencyPhone,
    } = body

    // Preparar dados para atualização
    const updateData: any = {}

    // Campos permitidos para o membro atualizar
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (phone2 !== undefined) updateData.phone2 = phone2
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (zipCode !== undefined) updateData.zipCode = zipCode
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus
    if (profession !== undefined) updateData.profession = profession
    if (education !== undefined) updateData.education = education
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact
    if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone

    // Atualizar membro
    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: updateData,
    })

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: updatedMember.email || null,
        action: 'UPDATE',
        entityType: 'MEMBER',
        entityId: updatedMember.id,
        description: `Membro ${updatedMember.name} atualizou seus próprios dados via app mobile`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Descriptografar dados sensíveis para resposta
    const responseData = {
      ...updatedMember,
      cpf: updatedMember.cpfEncrypted && updatedMember.cpf ? decrypt(updatedMember.cpf) : updatedMember.cpf,
      rg: updatedMember.rgEncrypted && updatedMember.rg ? decrypt(updatedMember.rg) : updatedMember.rg,
      password: undefined,
    }

    return NextResponse.json(
      responseData,
      { headers: getCorsHeaders() }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar dados do membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar dados' },
      { 
        status: 500,
        headers: getCorsHeaders(),
      }
    )
  }
}
