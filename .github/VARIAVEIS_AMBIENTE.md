# 🔐 Variáveis de Ambiente - Guia Completo

Este guia explica como configurar variáveis de ambiente em diferentes cenários.

## 📋 Resumo Rápido

| Ambiente | Arquivo Necessário | Onde Criar | Como Configurar |
|----------|-------------------|------------|-----------------|
| **Desenvolvimento Local** | `.env` | Na raiz do projeto | Manualmente |
| **Produção VPS (Manual)** | `.env.production` ou `.env` | Na VPS | Manualmente ou script |
| **Produção VPS (CI/CD)** | Nenhum arquivo | GitHub Secrets | Secrets do GitHub |

## 🏠 Desenvolvimento Local

### Criar arquivo `.env` na raiz do projeto:

```bash
# Copiar exemplo
cp env.example.txt .env

# Editar com suas configurações
nano .env
```

**Conteúdo mínimo:**

```env
# Database
DATABASE_URL="mysql://root:senha@localhost:3306/ekklesia"

# JWT
JWT_SECRET=seu-jwt-secret-aqui
JWT_EXPIRES_IN=7d

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-nextauth-secret-aqui

# LGPD
ENCRYPTION_KEY=sua-chave-64-caracteres-hex-aqui

# Application URL
APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**⚠️ IMPORTANTE:**
- O arquivo `.env` está no `.gitignore` (não será commitado)
- Use valores de desenvolvimento/teste
- Nunca commite este arquivo!

## 🚀 Produção na VPS (Deploy Manual)

### Opção 1: Usar Script Automatizado

```bash
# Na VPS
./scripts/vps/gerar-env-producao.sh
```

Isso cria o arquivo `.env.production` automaticamente.

### Opção 2: Criar Manualmente

```bash
# Na VPS, criar .env.production
nano .env.production
```

**Conteúdo:**

```env
NODE_ENV=production
DATABASE_URL="mysql://user:pass@localhost:3306/ekklesia"
JWT_SECRET="chave-forte-aqui"
NEXTAUTH_SECRET="chave-forte-aqui"
NEXTAUTH_URL="https://seu-dominio.com"
APP_URL="https://seu-dominio.com"
ENCRYPTION_KEY="chave-64-caracteres-hex"
ALLOWED_ORIGINS="https://seu-dominio.com"
```

Depois copiar para `.env`:

```bash
cp .env.production .env
```

## 🤖 Produção na VPS (CI/CD Automático)

**NÃO precisa criar `.env` manualmente!**

O workflow do GitHub Actions cria automaticamente:

1. **Durante o deploy**, o workflow:
   - Lê os secrets do GitHub
   - Cria o arquivo `.env.production` na VPS
   - Copia para `.env` se necessário

2. **Você só precisa:**
   - Configurar os secrets no GitHub
   - Fazer push para `main`/`master`
   - O deploy cria tudo automaticamente!

### Secrets Necessários no GitHub:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `APP_URL`
- `NEXTAUTH_URL`
- `ALLOWED_ORIGINS` (opcional)

## 🔄 Como o Next.js Carrega Variáveis

O Next.js carrega automaticamente:

1. `.env` - Sempre carregado
2. `.env.local` - Sempre carregado (ignorado pelo git)
3. `.env.production` - Apenas em `NODE_ENV=production`
4. `.env.development` - Apenas em `NODE_ENV=development`

**Ordem de precedência:**
```
.env.local > .env.production/.env.development > .env
```

## 📝 Exemplo Prático

### Cenário 1: Desenvolvimento Local

```bash
# 1. Criar .env
cp env.example.txt .env

# 2. Editar .env com valores locais
nano .env

# 3. Rodar aplicação
npm run dev
```

### Cenário 2: Deploy Manual na VPS

```bash
# Na VPS
# 1. Usar script
./scripts/vps/gerar-env-producao.sh

# 2. Ou criar manualmente
nano .env.production
cp .env.production .env

# 3. Deploy
./scripts/vps/deploy.sh
```

### Cenário 3: CI/CD Automático

```bash
# 1. Configurar secrets no GitHub
# Settings → Secrets → Actions

# 2. Fazer push
git push origin main

# 3. Pronto! O workflow cria tudo automaticamente
```

## ✅ Checklist

### Para Desenvolvimento Local:
- [ ] Arquivo `.env` criado na raiz
- [ ] Variáveis configuradas
- [ ] Arquivo não está no git (verificar `.gitignore`)

### Para Produção Manual:
- [ ] Arquivo `.env.production` criado na VPS
- [ ] Valores de produção configurados
- [ ] Arquivo copiado para `.env` se necessário

### Para CI/CD:
- [ ] Secrets configurados no GitHub
- [ ] Workflow de deploy configurado
- [ ] Teste de deploy realizado

## 🔒 Segurança

### ⚠️ NUNCA:
- ❌ Commite arquivos `.env*` no Git
- ❌ Compartilhe chaves em texto plano
- ❌ Use a mesma chave em desenvolvimento e produção
- ❌ Deixe arquivos `.env` em repositórios públicos

### ✅ SEMPRE:
- ✅ Use secrets do GitHub para produção
- ✅ Gere chaves fortes e únicas
- ✅ Rotacione chaves periodicamente
- ✅ Mantenha backups seguros das chaves

## 🐛 Troubleshooting

### Variáveis não estão sendo carregadas

1. Verifique se o arquivo está na raiz do projeto
2. Verifique se o nome está correto (`.env`, não `env`)
3. Reinicie o servidor após criar/editar `.env`
4. Verifique se não há espaços em `VAR=valor` (deve ser `VAR=valor`)

### Next.js não encontra variáveis

- Variáveis devem começar com `NEXT_PUBLIC_` para serem expostas ao cliente
- Variáveis de servidor não precisam do prefixo
- Reinicie o servidor após mudanças

### CI/CD não está usando secrets

- Verifique se os secrets estão configurados no GitHub
- Verifique se os nomes dos secrets estão corretos
- Verifique os logs do workflow em Actions

## 📚 Recursos

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Última atualização:** $(date)

