import { NextRequest, NextResponse } from 'next/server'
import { getChurchModules } from '@/lib/module-permissions'
import { getCorsHeaders } from '@/lib/cors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> | { churchId: string } }
) {
  try {
    const { churchId } = await Promise.resolve(params)

    const modules = await getChurchModules(churchId)

    return NextResponse.json(
      { modules },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao obter módulos da igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao obter módulos' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

