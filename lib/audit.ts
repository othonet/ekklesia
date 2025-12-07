import { prisma } from './prisma'

interface AuditLogData {
  userId?: string
  userEmail?: string
  action: string
  entityType: string
  entityId?: string
  description?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error)
    // Não lançar erro para não quebrar o fluxo principal
  }
}

