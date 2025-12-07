/**
 * Script de teste das funcionalidades LGPD
 * Testa criptografia, descriptografia, anonimização, etc.
 */

const crypto = require('crypto')

// Simular funções de criptografia
function encrypt(text, encryptionKey) {
  if (!text) return text

  try {
    const ALGORITHM = 'aes-256-gcm'
    const key = crypto.scryptSync(encryptionKey, 'salt', 32)
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

function decrypt(encryptedText, encryptionKey) {
  if (!encryptedText) return encryptedText

  try {
    const ALGORITHM = 'aes-256-gcm'
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Formato de texto criptografado inválido')
    }

    const key = crypto.scryptSync(encryptionKey, 'salt', 32)
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Erro ao descriptografar:', error)
    return encryptedText
  }
}

function anonymize(text) {
  if (!text) return text
  try {
    return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16)
  } catch (error) {
    console.error('Erro ao anonimizar:', error)
    return text
  }
}

async function runTests() {
  console.log('🧪 Testando funcionalidades LGPD...\n')

  const encryptionKey = process.env.ENCRYPTION_KEY || 'test-key-for-testing-only'
  
  // Teste 1: Criptografia/Descriptografia
  console.log('📝 Teste 1: Criptografia e Descriptografia')
  const testCpf = '123.456.789-00'
  const encryptedCpf = encrypt(testCpf, encryptionKey)
  const decryptedCpf = decrypt(encryptedCpf, encryptionKey)
  
  if (testCpf === decryptedCpf && encryptedCpf !== testCpf) {
    console.log('   ✅ Criptografia funcionando corretamente')
    console.log(`   Original: ${testCpf}`)
    console.log(`   Criptografado: ${encryptedCpf.substring(0, 50)}...`)
    console.log(`   Descriptografado: ${decryptedCpf}`)
  } else {
    console.log('   ❌ Erro na criptografia!')
    return false
  }

  // Teste 2: Anonimização
  console.log('\n📝 Teste 2: Anonimização')
  const testName = 'João Silva'
  const anonymizedName = anonymize(testName)
  
  if (anonymizedName && anonymizedName !== testName && anonymizedName.length === 16) {
    console.log('   ✅ Anonimização funcionando corretamente')
    console.log(`   Original: ${testName}`)
    console.log(`   Anonimizado: ${anonymizedName}`)
  } else {
    console.log('   ❌ Erro na anonimização!')
    return false
  }

  // Teste 3: Consistência da anonimização
  console.log('\n📝 Teste 3: Consistência da Anonimização')
  const anonymized1 = anonymize(testName)
  const anonymized2 = anonymize(testName)
  
  if (anonymized1 === anonymized2) {
    console.log('   ✅ Anonimização é determinística (mesmo input = mesmo output)')
  } else {
    console.log('   ⚠️  Anonimização não é determinística (pode ser intencional)')
  }

  // Teste 4: Formato de dados criptografados
  console.log('\n📝 Teste 4: Formato de Dados Criptografados')
  const parts = encryptedCpf.split(':')
  if (parts.length === 3 && parts[0].length > 0 && parts[1].length > 0 && parts[2].length > 0) {
    console.log('   ✅ Formato de criptografia correto (iv:authTag:encrypted)')
  } else {
    console.log('   ❌ Formato de criptografia incorreto!')
    return false
  }

  console.log('\n✅ Todos os testes passaram!')
  return true
}

async function main() {
  try {
    const success = await runTests()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { runTests }

