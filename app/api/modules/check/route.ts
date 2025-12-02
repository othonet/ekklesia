import { NextRequest, NextResponse } from 'next/server'
import { hasModuleAccess } from '@/lib/module-permissions'
import { getCorsHeaders } from '@/lib/cors'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const churchId = searchParams.get('churchId')
    const moduleKey = searchParams.get('moduleKey')

    if (!churchId || !moduleKey) {
      return NextResponse.json(
        { error: 'churchId e moduleKey são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    const hasAccess = await hasModuleAccess(churchId, moduleKey as any)

    return NextResponse.json(
      { hasAccess },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao verificar acesso ao módulo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar acesso' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

