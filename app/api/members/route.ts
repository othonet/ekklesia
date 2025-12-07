import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, validateRequest, createErrorResponse, createSuccessResponse, checkSystemEnabled } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import { notifyConsentRequired } from '@/lib/notifications'
import { createMemberSchema } from '@/lib/validations'
import { checkPermission } from '@/lib/permissions-helpers'

export async function GET(request: NextRequest) {
  try {
    // Verificar se o sistema está habilitado
    const systemCheck = await checkSystemEnabled(request)
    if (systemCheck) return systemCheck

    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    // Verificar permissão para ler membros
    if (!(await checkPermission(request, 'members:read'))) {
      return createErrorResponse('Acesso negado. Você não tem permissão para visualizar membros.', 403)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''

    const where: any = {
      churchId: user.churchId,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ministries: {
            include: {
              ministry: true,
            },
          },
        },
      }),
      prisma.member.count({ where }),
    ])

    // Descriptografar dados sensíveis
    const membersData = members.map(member => ({
      ...member,
      // Não descriptografar CPF/RG na listagem por segurança
      // Apenas mostrar se está criptografado
      cpf: member.cpfEncrypted ? '[CRIPTOGRAFADO]' : member.cpf,
      rg: member.rgEncrypted ? '[CRIPTOGRAFADO]' : member.rg,
    }))

    // Registrar log de visualização de lista
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: 'VIEW',
        entityType: 'MEMBER_LIST',
        description: `Visualização de lista de membros (${members.length} membros)`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return createSuccessResponse({
      data: membersData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Erro ao buscar membros:', error)
    return createErrorResponse(error.message || 'Erro ao buscar membros', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    // Verificar permissão para criar membros
    if (!(await checkPermission(request, 'members:write'))) {
      return createErrorResponse('Acesso negado. Você não tem permissão para criar membros.', 403)
    }

    const body = await request.json()
    
    // Validar dados com Zod
    const validation = createMemberSchema.safeParse(body)
    if (!validation.success) {
      console.error('Erro de validação:', validation.error.errors)
      return createErrorResponse(
        validation.error.errors[0]?.message || 'Dados inválidos',
        400,
        validation.error.errors
      )
    }

    const validatedData = validation.data

    // Criptografar dados sensíveis (CPF e RG)
    const encryptedCpf = validatedData.cpf ? encrypt(validatedData.cpf) : null
    const encryptedRg = validatedData.rg ? encrypt(validatedData.rg) : null

    const member = await prisma.member.create({
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        phone2: validatedData.phone2 || null,
        birthDate: validatedData.birthDate ? (() => {
          // Criar data como UTC para evitar problemas de timezone
          // Se vier como string YYYY-MM-DD, criar como UTC
          const dateStr = validatedData.birthDate
          if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
            return new Date(Date.UTC(year, month - 1, day))
          }
          // Se vier como string DD/MM/YYYY, converter para UTC
          if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/').map(Number)
            return new Date(Date.UTC(year, month - 1, day))
          }
          // Caso padrão
          const date = new Date(dateStr)
          // Normalizar para UTC meia-noite
          return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
        })() : null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        zipCode: validatedData.zipCode || null,
        status: validatedData.status || 'ACTIVE',
        cpf: encryptedCpf,
        rg: encryptedRg,
        cpfEncrypted: !!encryptedCpf,
        rgEncrypted: !!encryptedRg,
        maritalStatus: validatedData.maritalStatus || null,
        profession: validatedData.profession || null,
        education: validatedData.education || null,
        emergencyContact: validatedData.emergencyContact || null,
        emergencyPhone: validatedData.emergencyPhone || null,
        notes: validatedData.notes || null,
        // Quando admin cadastra: dataConsent = false inicialmente, será confirmado pelo membro depois
        // Base legal: Legítimo interesse (gestão da igreja)
        dataConsent: false, // Será confirmado pelo membro posteriormente
        consentDate: null,
        // Definir retenção: 5 anos para membros inativos, indefinido para ativos
        retentionUntil: validatedData.status === 'INACTIVE' ? new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) : null,
        churchId: user.churchId,
      },
    })

    // Criar registro de consentimento indicando que foi cadastrado por admin
    // Base legal: Legítimo interesse (art. 7º, inciso IX da LGPD)
    await prisma.memberConsent.create({
      data: {
        memberId: member.id,
        consentType: 'DATA_PROCESSING',
        granted: true, // Admin confirmou que membro foi informado
        grantedAt: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        // Nota: metadata poderia armazenar "registeredByAdmin: true" e "legalBasis: LEGITIMATE_INTEREST"
      },
    })

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: 'CREATE',
        entityType: 'MEMBER',
        entityId: member.id,
        description: `Criação de membro: ${validatedData.name} (cadastrado por admin - base legal: legítimo interesse)`,
        metadata: JSON.stringify({
          registeredByAdmin: true,
          legalBasis: 'LEGITIMATE_INTEREST',
          memberNeedsToConfirmConsent: true,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Enviar notificação ao membro sobre necessidade de confirmar consentimento
    if (validatedData.email) {
      try {
        await notifyConsentRequired(validatedData.email, validatedData.name)
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
        // Não falhar o cadastro se a notificação falhar
      }
    }

    return createSuccessResponse(member, 201)
  } catch (error: any) {
    console.error('Erro ao criar membro:', error)
    console.error('Stack trace:', error.stack)
    console.error('Error code:', error.code)
    console.error('Error meta:', error.meta)

    // Tratar erro de email duplicado (constraint UNIQUE em members_email_key)
    if (error.code === 'P2002' && error.meta?.target === 'members_email_key') {
      return createErrorResponse(
        'Já existe um membro cadastrado com este e-mail. Use outro e-mail ou edite o membro existente.',
        400
      )
    }

    // Retornar mensagem de erro mais detalhada em desenvolvimento
    const errorMessage = error.message || 'Erro ao criar membro'
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { 
          message: errorMessage,
          stack: error.stack,
          code: error.code,
          meta: error.meta,
        }
      : undefined
    
    return createErrorResponse(errorMessage, 500, errorDetails)
  }
}

