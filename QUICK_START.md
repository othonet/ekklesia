# ⚡ Quick Start - LGPD (Desenvolvimento Local)

Guia rápido para começar a usar as funcionalidades LGPD em desenvolvimento local.

---

## 🎯 3 Passos Rápidos

### 1️⃣ Instalar e Configurar

```bash
# Instalar dependências
npm install

# Gerar chave de criptografia
npm run generate:encryption-key
```

Copie a chave gerada e adicione ao `.env`:
```env
ENCRYPTION_KEY=sua-chave-aqui
DATABASE_URL="mysql://root:senha@localhost:3306/ekklesia"
APP_URL="http://localhost:3000"
```

### 2️⃣ Aplicar Migração

```bash
# Aplicar migração do banco
npx prisma migrate dev --name add_lgpd_compliance_fields

# Se já tem dados, migrar CPF/RG existentes
npm run lgpd:migrate
```

### 3️⃣ Testar

```bash
# Testar funcionalidades
npm run lgpd:test

# Iniciar servidor
npm run dev
```

---

## ✅ Pronto!

Agora você pode:
- ✅ Cadastrar membros (CPF/RG serão criptografados automaticamente)
- ✅ Deletar membros (soft delete com período de graça)
- ✅ Gerenciar consentimento em `/dashboard/privacy`
- ✅ Exportar dados pessoais
- ✅ Ver logs de auditoria

---

## 📚 Documentação Completa

- **`SETUP_LOCAL.md`** - Guia completo para desenvolvimento local
- **`SETUP_LGPD.md`** - Guia para produção
- **`README_LGPD.md`** - Visão geral das funcionalidades

---

**Dúvidas?** Consulte `SETUP_LOCAL.md` para guia detalhado!

