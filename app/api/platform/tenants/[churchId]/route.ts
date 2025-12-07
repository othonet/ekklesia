import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'
import { hashPassword } from '@/lib/auth'

// Atualizar tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId } = await Promise.resolve(params)
    const body = await request.json()
    const {
      name,
      cnpj,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      website,
      pastorName,
      planId,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se a igreja existe
    const existingChurch = await prisma.church.findUnique({
      where: { id: churchId },
    })

    if (!existingChurch) {
      return NextResponse.json(
        { error: 'Igreja não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se CNPJ já existe em outra igreja (se fornecido)
    if (cnpj && cnpj !== existingChurch.cnpj) {
      const churchWithCnpj = await prisma.church.findUnique({
        where: { cnpj },
      })

      if (churchWithCnpj) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado em outra igreja' },
          { status: 400, headers: getCorsHeaders(request) }
        )
      }
    }

    // Atualizar igreja
    const updatedChurch = await prisma.church.update({
      where: { id: churchId },
      data: {
        name,
        cnpj: cnpj || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        website: website || null,
        pastorName: pastorName || null,
        planId: planId || null,
        planAssignedAt: planId ? (existingChurch.planAssignedAt || new Date()) : existingChurch.planAssignedAt,
      },
      include: {
        plan: true,
      },
    })

    return NextResponse.json(
      { church: updatedChurch },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar igreja' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Deletar tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId } = await Promise.resolve(params)

    // Verificar se a igreja existe
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        _count: {
          select: {
            members: {
              where: {
                deletedAt: null, // Contar apenas membros não deletados (soft delete)
              },
            },
            users: true,
          },
        },
      },
    })

    if (!church) {
      return NextResponse.json(
        { error: 'Igreja não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se há membros ativos (não permitir deletar se houver membros ativos)
    if (church._count.members > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir igreja com ${church._count.members} membro(s) ativo(s) associado(s). Remova os membros primeiro.` 
        },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Deletar todas as entidades relacionadas antes de deletar a igreja
    // Ordem de deleção: primeiro deletar entidades que dependem de outras, depois as independentes
    
    // 0. Deletar TODOS os membros (incluindo soft deleted) - eles ainda têm churchId referenciando a igreja
    // As relações com onDelete: Cascade serão deletadas automaticamente pelo Prisma
    // (MemberMinistry, MemberCourse, MemberConsent, DataRequest, Attendance, Baptism, Discipleship, Certificate)
    const deletedMembers = await prisma.member.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedMembers.count} membro(s) da igreja ${churchId} (incluindo soft deleted)`)

    // 1. Deletar usuários da igreja (exceto admins da plataforma)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        churchId: churchId,
        isPlatformAdmin: false,
      },
    })
    console.log(`Deletados ${deletedUsers.count} usuário(s) da igreja ${churchId}`)

    // 2. Deletar ministérios e suas escalas (cascata automática)
    const deletedMinistries = await prisma.ministry.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedMinistries.count} ministério(s) da igreja ${churchId}`)

    // 3. Deletar eventos
    const deletedEvents = await prisma.event.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedEvents.count} evento(s) da igreja ${churchId}`)

    // 4. Deletar cursos
    const deletedCourses = await prisma.course.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedCourses.count} curso(s) da igreja ${churchId}`)

    // 5. Deletar certificados
    const deletedCertificates = await prisma.certificate.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedCertificates.count} certificado(s) da igreja ${churchId}`)

    // 6. Deletar batismos
    const deletedBaptisms = await prisma.baptism.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedBaptisms.count} batismo(s) da igreja ${churchId}`)

    // 7. Deletar discipulados
    const deletedDiscipleships = await prisma.discipleship.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedDiscipleships.count} discipulado(s) da igreja ${churchId}`)

    // 8. Deletar finanças
    const deletedFinances = await prisma.finance.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedFinances.count} registro(s) financeiro(s) da igreja ${churchId}`)

    // 9. Deletar doações
    const deletedDonations = await prisma.donation.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedDonations.count} doação(ões) da igreja ${churchId}`)

    // 10. Deletar pagamentos
    const deletedPayments = await prisma.payment.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedPayments.count} pagamento(s) da igreja ${churchId}`)

    // 11. Deletar orçamentos
    const deletedBudgets = await prisma.budget.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedBudgets.count} orçamento(s) da igreja ${churchId}`)

    // 12. Deletar patrimônio
    const deletedAssets = await prisma.asset.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedAssets.count} item(ns) de patrimônio da igreja ${churchId}`)

    // 13. Deletar presenças
    const deletedAttendances = await prisma.attendance.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedAttendances.count} registro(s) de presença da igreja ${churchId}`)

    // 14. Deletar escalas de ministério
    const deletedSchedules = await prisma.ministrySchedule.deleteMany({
      where: { churchId: churchId },
    })
    console.log(`Deletados ${deletedSchedules.count} escala(s) de ministério da igreja ${churchId}`)

    // Agora deletar a igreja
    await prisma.church.delete({
      where: { id: churchId },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao deletar igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar igreja' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

