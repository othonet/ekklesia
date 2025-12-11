# 🔧 Corrigir Acesso à Plataforma

## 🐛 Problema Identificado

Após as mudanças de segurança, alguns usuários podem estar recebendo:
```
{"error":"Acesso negado. Apenas administradores da plataforma."}
```

## 🔍 Causa

Tokens JWT gerados **antes das mudanças** não contêm a flag `isPlatformAdmin` no payload. O middleware estava bloqueando esses tokens mesmo quando o usuário era admin no banco.

---

## ✅ Solução Aplicada

### 1. **Middleware Melhorado**
- ✅ Verifica `isPlatformAdmin` no token primeiro
- ✅ Se não tiver flag, verifica no banco de dados
- ✅ Permite acesso se for admin no banco (mesmo sem flag no token)
- ✅ Adiciona logs detalhados para debug

### 2. **Logs de Diagnóstico**
Agora você verá logs como:
```
[PLATFORM] Token sem flag isPlatformAdmin, verificando no banco... user@email.com
[PLATFORM-AUTH] Verificação: { userId: '...', email: '...', isPlatformAdmin: true, result: true }
[PLATFORM] Acesso permitido após verificação no banco user@email.com
```

---

## 🔄 Como Resolver

### Opção 1: Fazer Login Novamente (Recomendado)

**Se você está recebendo erro de acesso negado:**

1. Acesse `/platform/login`
2. Faça login novamente com suas credenciais
3. Um novo token será gerado **com a flag `isPlatformAdmin`**
4. O acesso funcionará normalmente

**Por quê?**
- Tokens antigos não têm `isPlatformAdmin` no payload
- Novo login gera token atualizado com todas as flags

### Opção 2: Verificar no Banco

Se ainda não funcionar após fazer login novamente:

1. Verifique se o usuário tem `isPlatformAdmin = true` no banco:
```sql
SELECT id, email, role, isPlatformAdmin, active 
FROM User 
WHERE email = 'seu-email@exemplo.com';
```

2. Se `isPlatformAdmin` for `false` ou `NULL`, atualize:
```sql
UPDATE User 
SET isPlatformAdmin = true 
WHERE email = 'seu-email@exemplo.com';
```

3. Faça login novamente

---

## 🔍 Verificar Logs

Após o deploy, verifique os logs do servidor:

```bash
# Na VPS
pm2 logs ekklesia --lines 100 | grep PLATFORM
```

Você deve ver:
- `[PLATFORM] Token sem flag isPlatformAdmin, verificando no banco...`
- `[PLATFORM-AUTH] Verificação: ...`
- `[PLATFORM] Acesso permitido após verificação no banco`

---

## 📋 Checklist de Diagnóstico

- [ ] Acessou `/platform/login`?
- [ ] Fez login novamente após as mudanças?
- [ ] Verificou logs do servidor?
- [ ] Confirmou que `isPlatformAdmin = true` no banco?
- [ ] Limpou cookies do navegador (se necessário)?

---

## 🚨 Se Ainda Não Funcionar

### 1. Limpar Cookies
```javascript
// No console do navegador (F12)
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### 2. Verificar Credenciais
- Email: `ofbsantos@gmail.com`
- Senha: `LinuxBraga2025@#`

### 3. Verificar Banco de Dados
```sql
-- Verificar usuário
SELECT id, email, name, role, isPlatformAdmin, active 
FROM User 
WHERE email = 'ofbsantos@gmail.com';

-- Se necessário, atualizar
UPDATE User 
SET isPlatformAdmin = true, active = true 
WHERE email = 'ofbsantos@gmail.com';
```

---

## ✅ O Que Foi Corrigido

1. ✅ Middleware agora verifica no banco se token não tem flag
2. ✅ Logs detalhados para diagnóstico
3. ✅ Redirecionamento corrigido na página de login
4. ✅ Verificação mais robusta de `isPlatformAdmin`

---

## 📝 Notas Importantes

- **Tokens antigos**: Funcionam agora (verificação no banco)
- **Tokens novos**: Têm `isPlatformAdmin` no payload (mais rápido)
- **Recomendação**: Fazer login novamente para obter token atualizado

---

**Última atualização:** 2025-12-10
