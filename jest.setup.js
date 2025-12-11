// Jest setup file
// Configurações globais para os testes

// Mock de variáveis de ambiente
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jest'
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/ekklesia_test'
process.env.NODE_ENV = 'test'

// Suprimir logs durante testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
