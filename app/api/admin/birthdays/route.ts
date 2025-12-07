import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

// Verificar se é admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('platform_token')?.value || 
                  request.cookies.get('token')?.value // Fallback para compatibilidade
    if (!token) return false

    const payload = verifyToken(token)
    if (!payload) return false

    return payload.role === 'ADMIN'
  } catch {
    return false
  }
}

/**
 * Busca todos os membros que fazem aniversário hoje
 */
export async function GET(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request)
    
    // Verificar autenticação e permissões de admin
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Obter data de hoje (apenas dia e mês)
    // Usar UTC para evitar problemas de timezone
    const today = new Date()
    const todayMonthUTC = today.getUTCMonth() + 1 // getMonth() retorna 0-11
    const todayDayUTC = today.getUTCDate()

    // Buscar todos os membros ativos com data de nascimento
    // Filtrar em memória para garantir compatibilidade
    const allMembers = await prisma.member.findMany({
      where: {
        birthDate: {
          not: null,
        },
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        church: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Filtrar membros que fazem aniversário hoje
    // IMPORTANTE: Usar UTC para evitar problemas de timezone
    const todayBirthdays = allMembers.filter((member) => {
      if (!member.birthDate) return false
      const birthDate = new Date(member.birthDate)
      // Usar UTC para extrair dia e mês, evitando problemas de timezone
      const birthMonth = birthDate.getUTCMonth() + 1
      const birthDay = birthDate.getUTCDate()
      return birthMonth === todayMonthUTC && birthDay === todayDayUTC
    })

    // Calcular idade para cada aniversariante
    // Usar UTC para cálculos consistentes
    const birthdaysWithAge = todayBirthdays.map((member) => {
      const birthDate = new Date(member.birthDate!)
      const age = today.getUTCFullYear() - birthDate.getUTCFullYear()
      const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth()
      const dayDiff = today.getUTCDate() - birthDate.getUTCDate()
      
      // Ajustar idade se ainda não fez aniversário este ano
      const finalAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) 
        ? age - 1 
        : age

      return {
        ...member,
        age: finalAge,
      }
    })

    return NextResponse.json(
      {
        birthdays: birthdaysWithAge,
        count: birthdaysWithAge.length,
        date: today.toISOString().split('T')[0],
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Erro ao buscar aniversariantes:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar aniversariantes' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

