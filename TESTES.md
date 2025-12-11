# 🧪 Guia de Testes Automatizados

Este documento explica como usar os testes automatizados e scripts de validação do projeto.

## 📋 Scripts Disponíveis

### Validação Pré-Commit

Execute antes de fazer commit para garantir que o código está correto:

```bash
npm run pre-commit
```

**O que verifica:**
- ✅ Lint (ESLint)
- ✅ Type Check (TypeScript)
- ✅ Validação de variáveis de ambiente (opcional)

**Uso recomendado:** Configure como git hook para executar automaticamente antes de cada commit.

### Validação Pré-Deploy

Execute antes de fazer deploy para garantir que tudo está pronto:

```bash
npm run pre-deploy
```

**O que verifica:**
- ✅ Arquivos essenciais (.env.example, next.config.js, schema.prisma)
- ✅ Lint (ESLint)
- ✅ Type Check (TypeScript)
- ✅ Geração do cliente Prisma
- ✅ Build da aplicação
- ✅ Testes LGPD

**Uso recomendado:** Execute antes de fazer push para `master`/`main`.

### Testes Unitários

Execute os testes unitários:

```bash
# Executar todos os testes
npm test

# Executar em modo watch (re-executa ao salvar arquivos)
npm run test:watch

# Executar com cobertura de código
npm run test:coverage
```

### Validação Completa (CI)

Execute todas as validações que o CI executa:

```bash
npm run ci
```

**Equivale a:**
```bash
npm run lint && npm run type-check && npm test && npm run build && npm run lgpd:test
```

## 🧪 Estrutura de Testes

```
__tests__/
  lib/
    auth.test.ts          # Testes de autenticação
    encryption.test.ts    # Testes de criptografia
```

## ✍️ Escrevendo Novos Testes

### Exemplo Básico

```typescript
// __tests__/lib/exemplo.test.ts
import { minhaFuncao } from '@/lib/exemplo'

describe('MinhaFuncao', () => {
  it('deve fazer algo corretamente', () => {
    const resultado = minhaFuncao('input')
    expect(resultado).toBe('output esperado')
  })

  it('deve tratar erros corretamente', () => {
    expect(() => minhaFuncao(null)).toThrow('Erro esperado')
  })
})
```

### Executar Teste Específico

```bash
# Executar apenas um arquivo de teste
npm test -- __tests__/lib/auth.test.ts

# Executar apenas um teste específico
npm test -- -t "deve verificar senha corretamente"
```

## 🔧 Configuração

### Jest

A configuração do Jest está em `jest.config.js`:
- Usa Next.js Jest preset
- Configuração de paths (`@/` → raiz do projeto)
- Ignora node_modules e .next

### Variáveis de Ambiente para Testes

As variáveis são configuradas automaticamente em `jest.setup.js`:
- `JWT_SECRET`: Chave de teste
- `ENCRYPTION_KEY`: Chave de teste
- `DATABASE_URL`: URL de teste
- `NODE_ENV`: test

## 📊 CI/CD

Os testes são executados automaticamente no CI:

1. **Lint** - Verifica qualidade do código
2. **Type Check** - Verifica tipos TypeScript
3. **Testes Unitários** - Executa todos os testes
4. **Build** - Compila a aplicação
5. **Testes LGPD** - Testa funcionalidades LGPD

**Todas as verificações devem passar para o CI aprovar.**

## 🚨 Troubleshooting

### Testes falhando localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Gere o cliente Prisma:**
   ```bash
   npm run db:generate
   ```

3. **Verifique variáveis de ambiente:**
   ```bash
   npm run validate:env
   ```

### Erro "Cannot find module"

- Verifique se o arquivo existe no caminho correto
- Verifique se o `moduleNameMapper` em `jest.config.js` está correto
- Execute `npm run db:generate` se for erro relacionado ao Prisma

### Testes muito lentos

- Use `npm run test:watch` apenas para desenvolvimento
- Use `npm test` para execução completa
- Considere mockar dependências pesadas (banco de dados, APIs externas)

## 📝 Boas Práticas

1. **Sempre execute `npm run pre-commit` antes de fazer commit**
2. **Execute `npm run pre-deploy` antes de fazer push para master**
3. **Escreva testes para novas funcionalidades**
4. **Mantenha cobertura de código acima de 70%**
5. **Testes devem ser rápidos e independentes**

## 🔗 Links Úteis

- [Documentação Jest](https://jestjs.io/docs/getting-started)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
