#!/usr/bin/env tsx
/**
 * Script de validação completa
 * Executa todas as verificações: lint, type-check, testes, build, lgpd
 */

import { execSync } from 'child_process'
import { exit } from 'process'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command: string, description: string, env?: Record<string, string>): boolean {
  try {
    log(`\n${'='.repeat(60)}`, 'cyan')
    log(`🔍 ${description}...`, 'blue')
    log('='.repeat(60), 'cyan')
    
    execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf-8',
      env: { ...process.env, ...env }
    })
    
    log(`\n✅ ${description} passou`, 'green')
    return true
  } catch (error) {
    log(`\n❌ ${description} falhou`, 'red')
    return false
  }
}

async function main() {
  log('\n🚀 Iniciando validação completa...', 'cyan')
  log('='.repeat(60), 'cyan')

  // Variáveis de ambiente para build
  const buildEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/ekklesia',
    JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-for-ci',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'test-nextauth-secret-for-ci',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }

  const checks = [
    {
      command: 'npm run lint',
      description: '1/5 - Lint (ESLint)',
      required: true,
    },
    {
      command: 'npx tsc --noEmit',
      description: '2/5 - Type Check (TypeScript)',
      required: true,
    },
    {
      command: 'npm test',
      description: '3/5 - Testes Unitários',
      required: true,
      env: {
        JWT_SECRET: buildEnv.JWT_SECRET,
        ENCRYPTION_KEY: buildEnv.ENCRYPTION_KEY,
        DATABASE_URL: buildEnv.DATABASE_URL.replace('ekklesia', 'ekklesia_test'),
        NODE_ENV: 'test',
      },
    },
    {
      command: 'npm run db:generate',
      description: '4/5 - Gerar cliente Prisma',
      required: true,
      env: {
        DATABASE_URL: buildEnv.DATABASE_URL,
      },
    },
    {
      command: 'npm run build',
      description: '5/5 - Build da aplicação',
      required: true,
      env: buildEnv,
    },
    {
      command: 'npm run lgpd:test',
      description: '6/6 - Testes LGPD',
      required: true,
      env: {
        ENCRYPTION_KEY: buildEnv.ENCRYPTION_KEY,
      },
    },
  ]

  const results: Array<{ description: string; passed: boolean; required: boolean }> = []

  for (const check of checks) {
    const passed = runCommand(check.command, check.description, check.env)
    results.push({
      description: check.description,
      passed,
      required: check.required,
    })

    if (!passed && check.required) {
      log(`\n${'='.repeat(60)}`, 'red')
      log(`❌ Validação completa falhou!`, 'red')
      log(`   Erro em: ${check.description}`, 'yellow')
      log(`\n💡 Dica: Execute o comando manualmente para ver detalhes:`, 'yellow')
      log(`   ${check.command}`, 'cyan')
      log('='.repeat(60), 'red')
      exit(1)
    }
  }

  // Resumo final
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 Resumo da validação completa:', 'cyan')
  log('='.repeat(60), 'cyan')
  
  const passed = results.filter(r => r.passed).length
  const total = results.length

  results.forEach(result => {
    if (result.passed) {
      log(`  ✅ ${result.description}`, 'green')
    } else {
      log(`  ❌ ${result.description}`, 'red')
    }
  })

  log('\n' + '='.repeat(60), 'cyan')
  log(`✅ ${passed}/${total} verificações passaram!`, 'green')
  log('🎉 Aplicação pronta para deploy!', 'green')
  log('='.repeat(60), 'cyan')
  exit(0)
}

main().catch(error => {
  log(`\n❌ Erro inesperado: ${error.message}`, 'red')
  exit(1)
})
