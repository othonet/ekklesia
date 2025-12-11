/**
 * Testes básicos para funções de autenticação
 */

import { hashPassword, verifyPassword } from '@/lib/auth'

describe('Authentication', () => {
  describe('hashPassword', () => {
    it('deve criar hash de senha', async () => {
      const password = 'senha123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeTruthy()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('deve criar hashes diferentes para a mesma senha', async () => {
      const password = 'senha123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      // Hashes devem ser diferentes devido ao salt
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('deve verificar senha corretamente', async () => {
      const password = 'senha123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    it('deve rejeitar senha incorreta', async () => {
      const password = 'senha123'
      const wrongPassword = 'senha456'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)
      
      expect(isValid).toBe(false)
    })
  })
})
