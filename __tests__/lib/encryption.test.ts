/**
 * Testes básicos para funções de criptografia
 * 
 * Nota: As funções de criptografia só funcionam no servidor (Node.js)
 * Em ambiente de teste (Jest), elas retornam o texto original
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
    it('deve retornar texto quando não está no servidor (ambiente de teste)', () => {
      const text = 'teste123'
      const encrypted = encrypt(text)
      
      // Em ambiente de teste (Jest), a função retorna o texto original
      // porque verifica se está no servidor (typeof window === 'undefined')
      // No Jest, window pode estar definido pelo jsdom
      expect(encrypted).toBeTruthy()
      // A função retorna o texto original em ambiente não-servidor
      expect(encrypted).toBe(text)
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
    it('deve retornar texto quando não está no servidor (ambiente de teste)', () => {
      const encrypted = 'teste123'
      const decrypted = decrypt(encrypted)
      
      // Em ambiente de teste, retorna o texto original
      expect(decrypted).toBe(encrypted)
    })

    it('deve retornar texto criptografado se descriptografia falhar', () => {
      const invalidEncrypted = 'invalid:format'
      const result = decrypt(invalidEncrypted)
      
      expect(result).toBe(invalidEncrypted)
    })
  })

  describe('anonymize', () => {
    it('deve retornar texto quando não está no servidor (ambiente de teste)', () => {
      const text = 'teste123'
      const anonymized = anonymize(text)
      
      // Em ambiente de teste, retorna o texto original
      expect(anonymized).toBeTruthy()
      expect(anonymized).toBe(text)
    })
  })
})
