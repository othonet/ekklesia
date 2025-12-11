#!/usr/bin/env tsx
/**
 * Script para validar se todas as variáveis de ambiente críticas estão configuradas
 * 
 * Uso:
 *   npm run validate:env
 *   ou
 *   tsx scripts/validar-env.ts
 */

const requiredEnvVars = [
  {
    name: 'JWT_SECRET',
    description: 'Chave secreta para assinatura de tokens JWT',
    critical: true,
  },
  {
    name: 'ENCRYPTION_KEY',
    description: 'Chave de criptografia para dados sensíveis (LGPD)',
    critical: true,
  },
  {
    name: 'DATABASE_URL',
    description: 'URL de conexão com o banco de dados MySQL',
    critical: true,
  },
  {
    name: 'NEXTAUTH_SECRET',
    description: 'Chave secreta para NextAuth.js',
    critical: false,
  },
  {
    name: 'NEXTAUTH_URL',
    description: 'URL base da aplicação',
    critical: false,
  },
  {
    name: 'APP_URL',
    description: 'URL da aplicação',
    critical: false,
  },
]

function validateEnv() {
  console.log('🔍 Validando variáveis de ambiente...\n')
  
  const missing: string[] = []
  const present: string[] = []
  let hasCriticalMissing = false

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]
    
    if (!value || value.trim() === '') {
      if (envVar.critical) {
        console.log(`❌ ${envVar.name} - CRÍTICO: Não configurado`)
        console.log(`   ${envVar.description}`)
        missing.push(envVar.name)
        hasCriticalMissing = true
      } else {
        console.log(`⚠️  ${envVar.name} - Opcional: Não configurado`)
        console.log(`   ${envVar.description}`)
      }
    } else {
      // Não mostrar o valor por segurança, apenas confirmar que existe
      const maskedValue = value.length > 10 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : '***'
      console.log(`✅ ${envVar.name} - Configurado (${maskedValue})`)
      present.push(envVar.name)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (hasCriticalMissing) {
    console.log('\n❌ ERRO: Variáveis críticas não configuradas!')
    console.log('\nAs seguintes variáveis são obrigatórias:')
    missing.forEach(name => {
      const envVar = requiredEnvVars.find(v => v.name === name)
      console.log(`   - ${name}: ${envVar?.description}`)
    })
    console.log('\n💡 Configure essas variáveis antes de iniciar a aplicação.')
    console.log('   Verifique: .env, .env.production ou GitHub Secrets')
    process.exit(1)
  } else {
    console.log('\n✅ Todas as variáveis críticas estão configuradas!')
    console.log(`\n📊 Resumo:`)
    console.log(`   - Configuradas: ${present.length}/${requiredEnvVars.length}`)
    console.log(`   - Críticas OK: ${present.filter(name => 
      requiredEnvVars.find(v => v.name === name)?.critical
    ).length}/${requiredEnvVars.filter(v => v.critical).length}`)
    console.log('\n✨ Sistema pronto para iniciar!')
    process.exit(0)
  }
}

// Executar validação
validateEnv()
