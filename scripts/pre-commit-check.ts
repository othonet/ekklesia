#!/usr/bin/env tsx
/**
 * Script de validação pré-commit
 * Executa todas as verificações antes de permitir commit
 */

import { execSync } from 'child_process'
import { exit } from 'process'

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

function runCommand(command: string, description: string): boolean {
  try {
    log(`\n🔍 ${description}...`, 'blue')
    execSync(command, { stdio: 'inherit', encoding: 'utf-8' })
    log(`✅ ${description} passou`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} falhou`, 'red')
    return false
  }
}

async function main() {
  log('\n🚀 Iniciando validação pré-commit...', 'blue')
  log('=' .repeat(60), 'blue')

  const checks = [
    {
      command: 'npm run lint',
      description: 'Lint (ESLint)',
      required: true,
    },
    {
      command: 'npx tsc --noEmit',
      description: 'Type Check (TypeScript)',
      required: true,
    },
    {
      command: 'npm run validate:env',
      description: 'Validação de variáveis de ambiente',
      required: false,
    },
  ]

  const results: Array<{ description: string; passed: boolean; required: boolean }> = []

  for (const check of checks) {
    const passed = runCommand(check.command, check.description)
    results.push({
      description: check.description,
      passed,
      required: check.required,
    })

    if (!passed && check.required) {
      log(`\n❌ Validação pré-commit falhou!`, 'red')
      log(`   Corrija os erros em: ${check.description}`, 'yellow')
      log('\n💡 Dica: Execute os comandos manualmente para ver detalhes dos erros', 'yellow')
      exit(1)
    }
  }

  // Resumo
  log('\n' + '='.repeat(60), 'blue')
  log('📊 Resumo da validação:', 'blue')
  
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
    log('   Corrija os erros antes de fazer commit', 'yellow')
    exit(1)
  }

  if (warnings > 0) {
    log(`\n⚠️  ${warnings} verificação(ões) opcional(is) falharam`, 'yellow')
    log('   Continue com cuidado', 'yellow')
  }

  log(`\n✅ Todas as verificações obrigatórias passaram!`, 'green')
  log('   Você pode fazer commit com segurança', 'green')
  exit(0)
}

main().catch(error => {
  log(`\n❌ Erro inesperado: ${error.message}`, 'red')
  exit(1)
})
