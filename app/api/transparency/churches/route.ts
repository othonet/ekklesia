import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// API para listar igrejas (para desenvolvimento/testes)
// Em produção, isso deveria ser protegido ou removido
export async function GET(request: NextRequest) {
  try {
    // Verificar se prisma está inicializado
    if (!prisma) {
      console.error('Prisma não está inicializado')
      return NextResponse.json(
        { error: 'Erro de configuração do banco de dados' },
        { status: 500 }
      )
    }

    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
      },
      take: 10, // Limitar a 10 para não expor muitas informações
    })

    return NextResponse.json(churches)
  } catch (error: any) {
    console.error('Erro ao buscar igrejas:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao buscar igrejas',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

