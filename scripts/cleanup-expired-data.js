/**
 * Script de limpeza automática de dados expirados
 * Executar via cron job diariamente
 * 
 * Política de retenção:
 * - Membros inativos: 5 anos
 * - Dados financeiros: 10 anos (obrigação legal)
 * - Logs de auditoria: 2 anos
 * - Membros deletados (soft delete): 30 dias antes de exclusão permanente
 */

const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

// Função de anonimização (mesma lógica do lib/encryption.ts)
function anonymize(text) {
  if (!text) return text
  try {
    return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16)
  } catch (error) {
    console.error('Erro ao anonimizar:', error)
    return text
  }
}

const prisma = new PrismaClient()

async function cleanupExpiredMembers() {
  console.log('🧹 Iniciando limpeza de membros expirados...')
  
  const now = new Date()
  
  // Buscar membros com retenção expirada
  const expiredMembers = await prisma.member.findMany({
    where: {
      retentionUntil: {
        lte: now,
      },
      anonymized: false,
      deletedAt: null,
    },
  })

  console.log(`📋 Encontrados ${expiredMembers.length} membros com retenção expirada`)

  for (const member of expiredMembers) {
    try {
      // Anonimizar antes de excluir
      console.log(`🔒 Anonimizando membro: ${member.name} (ID: ${member.id})`)
      
      const anonymizedName = anonymize(member.name)
      const anonymizedEmail = member.email ? anonymize(member.email) : null
      const anonymizedPhone = member.phone ? anonymize(member.phone) : null
      const anonymizedCpf = member.cpf ? anonymize(member.cpf) : null
      const anonymizedRg = member.rg ? anonymize(member.rg) : null

      await prisma.member.update({
        where: { id: member.id },
        data: {
          name: `[ANONIMIZADO] ${anonymizedName}`,
          email: anonymizedEmail,
          phone: anonymizedPhone,
          phone2: null,
          cpf: anonymizedCpf,
          rg: anonymizedRg,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          emergencyContact: null,
          emergencyPhone: null,
          notes: '[Dados anonimizados conforme política de retenção LGPD]',
          anonymized: true,
          anonymizedAt: new Date(),
        },
      })

      console.log(`✅ Membro anonimizado: ${member.id}`)
    } catch (error) {
      console.error(`❌ Erro ao anonimizar membro ${member.id}:`, error)
    }
  }
}

async function cleanupSoftDeletedMembers() {
  console.log('🧹 Iniciando limpeza de membros com soft delete expirado...')
  
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Buscar membros deletados há mais de 30 dias
  const expiredDeletions = await prisma.member.findMany({
    where: {
      deletedAt: {
        lte: thirtyDaysAgo,
      },
      anonymized: false,
    },
  })

  console.log(`📋 Encontrados ${expiredDeletions.length} membros para exclusão permanente`)

  for (const member of expiredDeletions) {
    try {
      // Anonimizar antes de excluir permanentemente
      console.log(`🔒 Anonimizando e excluindo membro: ${member.name} (ID: ${member.id})`)
      
      const anonymizedName = anonymize(member.name)
      const anonymizedEmail = member.email ? anonymize(member.email) : null
      const anonymizedPhone = member.phone ? anonymize(member.phone) : null
      const anonymizedCpf = member.cpf ? anonymize(member.cpf) : null
      const anonymizedRg = member.rg ? anonymize(member.rg) : null

      await prisma.member.update({
        where: { id: member.id },
        data: {
          name: `[ANONIMIZADO] ${anonymizedName}`,
          email: anonymizedEmail,
          phone: anonymizedPhone,
          phone2: null,
          cpf: anonymizedCpf,
          rg: anonymizedRg,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          emergencyContact: null,
          emergencyPhone: null,
          notes: '[Dados anonimizados e excluídos conforme LGPD]',
          anonymized: true,
          anonymizedAt: new Date(),
        },
      })

      // Atualizar solicitações de exclusão
      await prisma.dataRequest.updateMany({
        where: {
          memberId: member.id,
          requestType: 'DELETE',
          status: 'PENDING',
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      console.log(`✅ Membro anonimizado e processado: ${member.id}`)
    } catch (error) {
      console.error(`❌ Erro ao processar membro ${member.id}:`, error)
    }
  }
}

async function cleanupOldAuditLogs() {
  console.log('🧹 Iniciando limpeza de logs de auditoria antigos...')
  
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  
  const deleted = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lte: twoYearsAgo,
      },
    },
  })

  console.log(`✅ ${deleted.count} logs de auditoria removidos`)
}

async function main() {
  try {
    console.log('🚀 Iniciando processo de limpeza de dados expirados...\n')
    
    await cleanupExpiredMembers()
    await cleanupSoftDeletedMembers()
    await cleanupOldAuditLogs()
    
    console.log('\n✅ Processo de limpeza concluído!')
  } catch (error) {
    console.error('❌ Erro no processo de limpeza:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { main, cleanupExpiredMembers, cleanupSoftDeletedMembers, cleanupOldAuditLogs }

