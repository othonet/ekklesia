#!/usr/bin/env tsx
/**
 * Script de validação pré-deploy
 * Executa todas as verificações antes de fazer deploy
 */

import { execSync } from 'child_process'
import { exit } from 'process'
import * as fs from 'fs'
import * as path from 'path'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command: string, description: string, env?: Record<string, string>): boolean {
  try {
    log(`\n🔍 ${description}...`, 'blue')
    execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf-8',
      env: { ...process.env, ...env }
    })
    log(`✅ ${description} passou`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} falhou`, 'red')
    return false
  }
}

function checkFileExists(filePath: string, description: string): boolean {
  const fullPath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description} encontrado`, 'green')
    return true
  } else {
    log(`❌ ${description} não encontrado: ${filePath}`, 'red')
    return false
  }
}

async function main() {
  log('\n🚀 Iniciando validação pré-deploy...', 'blue')
  log('=' .repeat(60), 'blue')

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
    // Verificações de arquivos
    {
      type: 'file' as const,
      check: () => checkFileExists('.env.example', 'Arquivo .env.example'),
      description: 'Arquivo .env.example',
      required: true,
    },
    {
      type: 'file' as const,
      check: () => checkFileExists('next.config.js', 'Arquivo next.config.js'),
      description: 'Arquivo next.config.js',
      required: true,
    },
    {
      type: 'file' as const,
      check: () => checkFileExists('prisma/schema.prisma', 'Schema Prisma'),
      description: 'Schema Prisma',
      required: true,
    },
    
    // Verificações de código
    {
      type: 'command' as const,
      check: () => runCommand('npm run lint', 'Lint (ESLint)'),
      description: 'Lint (ESLint)',
      required: true,
    },
    {
      type: 'command' as const,
      check: () => runCommand('npx tsc --noEmit', 'Type Check (TypeScript)'),
      description: 'Type Check (TypeScript)',
      required: true,
    },
    {
      type: 'command' as const,
      check: () => runCommand('npm run db:generate', 'Gerar cliente Prisma'),
      description: 'Gerar cliente Prisma',
      required: true,
    },
    {
      type: 'command' as const,
      check: () => runCommand('npm run build', 'Build da aplicação', buildEnv),
      description: 'Build da aplicação',
      required: true,
    },
    {
      type: 'command' as const,
      check: () => runCommand('npm run lgpd:test', 'Testes LGPD', { ENCRYPTION_KEY: buildEnv.ENCRYPTION_KEY }),
      description: 'Testes LGPD',
      required: true,
    },
  ]

  const results: Array<{ description: string; passed: boolean; required: boolean }> = []

  for (const check of checks) {
    const passed = check.check()
    results.push({
      description: check.description,
      passed,
      required: check.required,
    })

    if (!passed && check.required) {
      log(`\n❌ Validação pré-deploy falhou!`, 'red')
      log(`   Corrija os erros em: ${check.description}`, 'yellow')
      log('\n💡 Dica: Execute os comandos manualmente para ver detalhes dos erros', 'yellow')
      exit(1)
    }
  }

  // Resumo
  log('\n' + '='.repeat(60), 'blue')
  log('📊 Resumo da validação pré-deploy:', 'blue')
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed && r.required).length
  const warnings = results.filter(r => !r.passed && !r.required).length

  results.forEach(result => {
    if (result.passed) {
      log(`  ✅ ${result.description}`, 'green')
    } else if (result.required) {
      log(`  ❌ ${result.description}`, 'red')
    } else {
      log(`  ⚠️  ${result.description} (opcional)`, 'yellow')
    }
  })

  if (failed > 0) {
    log(`\n❌ ${failed} verificação(ões) obrigatória(s) falharam`, 'red')
    log('   NÃO faça deploy até corrigir os erros', 'yellow')
    exit(1)
  }

  if (warnings > 0) {
    log(`\n⚠️  ${warnings} verificação(ões) opcional(is) falharam`, 'yellow')
    log('   Continue com cuidado', 'yellow')
  }

  log(`\n✅ Todas as verificações obrigatórias passaram!`, 'green')
  log('   Aplicação pronta para deploy', 'green')
  exit(0)
}

main().catch(error => {
  log(`\n❌ Erro inesperado: ${error.message}`, 'red')
  exit(1)
})
