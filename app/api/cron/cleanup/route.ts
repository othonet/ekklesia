import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint para execução do script de limpeza via cron job
 * Protegido por secret token para segurança
 * 
 * Configurar no Vercel Cron ou similar:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar token de segurança
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Se CRON_SECRET não configurado, permitir apenas em desenvolvimento
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        )
      }
    }

    // Executar script de limpeza
    const { cleanupExpiredMembers, cleanupSoftDeletedMembers, cleanupOldAuditLogs } = require('@/scripts/cleanup-expired-data')
    
    await cleanupExpiredMembers()
    await cleanupSoftDeletedMembers()
    await cleanupOldAuditLogs()

    return NextResponse.json({
      success: true,
      message: 'Limpeza de dados expirados executada com sucesso',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Erro ao executar limpeza:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro ao executar limpeza',
      },
      { status: 500 }
    )
  }
}

