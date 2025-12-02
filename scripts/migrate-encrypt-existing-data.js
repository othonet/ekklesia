/**
 * Script para migrar dados existentes - Criptografar CPF/RG
 * Execute este script APENAS UMA VEZ após aplicar a migração do schema
 * 
 * IMPORTANTE: Faça backup do banco antes de executar!
 */

const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Função de criptografia (mesma lógica do lib/encryption.ts)
function encrypt(text) {
  if (!text) return text

  try {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
    const ALGORITHM = 'aes-256-gcm'

    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Erro ao criptografar:', error)
    return text
  }
}

async function migrateMembers() {
  console.log('🔄 Iniciando migração de dados existentes...\n')

  // Buscar todos os membros com CPF ou RG não criptografados
  const members = await prisma.member.findMany({
    where: {
      OR: [
        { cpfEncrypted: false, cpf: { not: null } },
        { rgEncrypted: false, rg: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      cpf: true,
      rg: true,
      cpfEncrypted: true,
      rgEncrypted: true,
    },
  })

  console.log(`📋 Encontrados ${members.length} membros para migrar\n`)

  if (members.length === 0) {
    console.log('✅ Nenhum membro precisa ser migrado!')
    return
  }

  let successCount = 0
  let errorCount = 0

  for (const member of members) {
    try {
      const updateData = {}

      // Criptografar CPF se necessário
      if (member.cpf && !member.cpfEncrypted) {
        // Verificar se já está criptografado (formato: iv:authTag:encrypted)
        const isAlreadyEncrypted = member.cpf.includes(':') && member.cpf.split(':').length === 3
        
        if (!isAlreadyEncrypted) {
          updateData.cpf = encrypt(member.cpf)
          updateData.cpfEncrypted = true
          console.log(`🔒 Criptografando CPF do membro: ${member.name}`)
        } else {
          updateData.cpfEncrypted = true
          console.log(`✓ CPF já criptografado: ${member.name}`)
        }
      }

      // Criptografar RG se necessário
      if (member.rg && !member.rgEncrypted) {
        // Verificar se já está criptografado
        const isAlreadyEncrypted = member.rg.includes(':') && member.rg.split(':').length === 3
        
        if (!isAlreadyEncrypted) {
          updateData.rg = encrypt(member.rg)
          updateData.rgEncrypted = true
          console.log(`🔒 Criptografando RG do membro: ${member.name}`)
        } else {
          updateData.rgEncrypted = true
          console.log(`✓ RG já criptografado: ${member.name}`)
        }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.member.update({
          where: { id: member.id },
          data: updateData,
        })
        successCount++
      }
    } catch (error) {
      console.error(`❌ Erro ao migrar membro ${member.id} (${member.name}):`, error.message)
      errorCount++
    }
  }

  console.log(`\n✅ Migração concluída!`)
  console.log(`   Sucesso: ${successCount}`)
  console.log(`   Erros: ${errorCount}`)
}

async function main() {
  try {
    // Verificar se ENCRYPTION_KEY está configurada
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY === 'default-key-change-in-production') {
      console.error('❌ ERRO: ENCRYPTION_KEY não configurada ou está usando valor padrão!')
      console.error('   Configure ENCRYPTION_KEY no arquivo .env antes de executar este script.')
      process.exit(1)
    }

    console.log('⚠️  ATENÇÃO: Este script irá criptografar CPF e RG de todos os membros.')
    console.log('   Certifique-se de ter feito backup do banco de dados!\n')

    await migrateMembers()
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { migrateMembers }

