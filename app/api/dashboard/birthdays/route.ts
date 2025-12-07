import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

/**
 * Busca membros da igreja que fazem aniversário hoje
 */
export async function GET(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request)
    
    // Verificar autenticação (tentar cookie primeiro, depois header Authorization)
    let token = request.cookies.get('church_token')?.value || 
                request.cookies.get('token')?.value // Fallback para compatibilidade
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      console.log('❌ Token não encontrado')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: corsHeaders }
      )
    }

    const payload = verifyToken(token)
    if (!payload || !payload.churchId) {
      console.log('❌ Token inválido ou sem churchId:', { hasPayload: !!payload, churchId: payload?.churchId })
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: corsHeaders }
      )
    }

    console.log('✅ Autenticado para igreja:', payload.churchId)

    // Obter data de hoje (apenas dia e mês)
    // Usar UTC para evitar problemas de timezone
    const today = new Date()
    const todayMonthUTC = today.getUTCMonth() + 1 // getMonth() retorna 0-11
    const todayDayUTC = today.getUTCDate()
    
    console.log('📅 Data de hoje:', { 
      monthUTC: todayMonthUTC, 
      dayUTC: todayDayUTC, 
      monthLocal: today.getMonth() + 1,
      dayLocal: today.getDate(),
      fullDate: today.toISOString(),
      localDate: today.toLocaleDateString('pt-BR')
    })

    // Buscar todos os membros ativos da igreja com data de nascimento
    const allMembers = await prisma.member.findMany({
      where: {
        churchId: payload.churchId,
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
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`👥 Membros encontrados com birthDate: ${allMembers.length}`)
    if (allMembers.length > 0) {
      console.log('📋 Primeiros membros:', allMembers.slice(0, 3).map(m => ({
        name: m.name,
        birthDate: m.birthDate,
        monthUTC: m.birthDate ? new Date(m.birthDate).getUTCMonth() + 1 : null,
        dayUTC: m.birthDate ? new Date(m.birthDate).getUTCDate() : null,
        monthLocal: m.birthDate ? new Date(m.birthDate).getMonth() + 1 : null,
        dayLocal: m.birthDate ? new Date(m.birthDate).getDate() : null,
      })))
    }

    // Filtrar membros que fazem aniversário hoje
    // IMPORTANTE: Usar UTC para evitar problemas de timezone
    const todayBirthdays = allMembers.filter((member) => {
      if (!member.birthDate) return false
      
      const birthDate = new Date(member.birthDate)
      // Usar UTC para extrair dia e mês, evitando problemas de timezone
      const birthMonth = birthDate.getUTCMonth() + 1
      const birthDay = birthDate.getUTCDate()
      
      // Também usar UTC para a data de hoje
      const todayMonthUTC = today.getUTCMonth() + 1
      const todayDayUTC = today.getUTCDate()
      
      const matches = birthMonth === todayMonthUTC && birthDay === todayDayUTC
      
      if (matches) {
        console.log(`🎉 Aniversariante encontrado: ${member.name} (${birthDay}/${birthMonth})`)
      } else if (allMembers.length <= 5) {
        // Log para debug apenas se houver poucos membros
        console.log(`⏭️  ${member.name}: ${birthDay}/${birthMonth} (UTC) vs ${todayDayUTC}/${todayMonthUTC} (UTC)`)
      }
      
      return matches
    })

    console.log(`🎂 Total de aniversariantes hoje: ${todayBirthdays.length}`)

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

