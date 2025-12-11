/**
 * Testes básicos para funções de criptografia
 */

import { encrypt, decrypt, anonymize } from '@/lib/encryption'

describe('Encryption', () => {
  const originalEnv = process.env.ENCRYPTION_KEY

  beforeAll(() => {
    // Configurar chave de teste
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  })

  afterAll(() => {
    // Restaurar variável original
    if (originalEnv) {
      process.env.ENCRYPTION_KEY = originalEnv
    } else {
      delete process.env.ENCRYPTION_KEY
    }
  })

  describe('encrypt', () => {
    it('deve criptografar texto corretamente', () => {
      const text = 'teste123'
      const encrypted = encrypt(text)
      
      expect(encrypted).toBeTruthy()
      expect(encrypted).not.toBe(text)
      expect(encrypted).toContain(':') // Formato: iv:authTag:encrypted
    })

    it('deve retornar texto original se ENCRYPTION_KEY não estiver configurado', () => {
      const originalKey = process.env.ENCRYPTION_KEY
      delete process.env.ENCRYPTION_KEY
      
      const text = 'teste123'
      const encrypted = encrypt(text)
      
      expect(encrypted).toBe(text)
      
      process.env.ENCRYPTION_KEY = originalKey
    })
  })

  describe('decrypt', () => {
    it('deve descriptografar texto corretamente', () => {
      const originalText = 'teste123'
      const encrypted = encrypt(originalText)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(originalText)
    })

    it('deve retornar texto criptografado se descriptografia falhar', () => {
      const invalidEncrypted = 'invalid:format'
      const result = decrypt(invalidEncrypted)
      
      expect(result).toBe(invalidEncrypted)
    })
  })

  describe('anonymize', () => {
    it('deve criar hash irreversível', () => {
      const text = 'teste123'
      const anonymized1 = anonymize(text)
      const anonymized2 = anonymize(text)
      
      expect(anonymized1).toBeTruthy()
      expect(anonymized1).toBe(anonymized2) // Deve ser determinístico
      expect(anonymized1).not.toBe(text)
      expect(anonymized1.length).toBe(16) // Primeiros 16 caracteres do hash
    })
  })
})
