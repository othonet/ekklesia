/**
 * Funções de criptografia para dados sensíveis
 * IMPORTANTE: Estas funções só funcionam no servidor (não no Edge Runtime)
 * Use apenas em API routes e server components
 */

// Verificar se está no servidor
const isServer = typeof window === 'undefined'

/**
 * Criptografa dados sensíveis usando Node.js crypto
 * Usado para campos como CPF, dados bancários, etc.
 * 
 * NOTA: Esta função requer Node.js crypto module e só funciona no servidor
 */
export function encrypt(text: string): string {
  if (!text || !isServer) return text

  try {
    const crypto = require('crypto')
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
    return text // Retorna texto original em caso de erro
  }
}

/**
 * Descriptografa dados sensíveis
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !isServer) return encryptedText

  try {
    const crypto = require('crypto')
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
    const ALGORITHM = 'aes-256-gcm'

    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Formato de texto criptografado inválido')
    }

    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
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

/**
 * Hash de dados para anonimização (irreversível)
 */
export function anonymize(text: string): string {
  if (!text || !isServer) return text

  try {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16)
  } catch (error) {
    console.error('Erro ao anonimizar:', error)
    return text
  }
}

