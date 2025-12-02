# 🔧 Resolver Problema: "Apenas admin pode gerar tokens"

## Problema

O sistema está dizendo que apenas admin pode gerar tokens, mesmo você sendo admin.

## Causa

O token JWT foi gerado antes de você ter o role ADMIN. O JWT armazena o role no momento do login, então mesmo que o role no banco seja ADMIN, o token antigo ainda tem o role antigo.

## Solução Rápida

### 1. Verificar seu role no banco de dados

```powershell
npx tsx scripts/check-user-role.ts seu-email@exemplo.com
```

Isso mostrará seu role atual.

### 2. Atualizar seu role para ADMIN (se necessário)

```powershell
npx tsx scripts/check-user-role.ts seu-email@exemplo.com ADMIN
```

### 3. Fazer logout e login novamente

**Importante:** Após atualizar o role, você precisa:

1. Fazer **logout** no sistema
2. Fazer **login** novamente

Isso gerará um novo token JWT com o role correto.

## Verificação Manual no Banco

Se preferir verificar diretamente no banco:

```sql
SELECT id, email, name, role, active FROM users WHERE email = 'seu-email@exemplo.com';
```

Para atualizar:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu-email@exemplo.com';
```

Depois faça logout e login novamente.

## Por que isso acontece?

O JWT (token de autenticação) é gerado no momento do login e contém:
- ID do usuário
- Email
- **Role** (papel/permissão)
- Church ID

Se você atualizar o role no banco de dados, o token JWT antigo ainda terá o role antigo. Por isso é necessário fazer logout e login novamente para gerar um novo token com o role atualizado.

## Verificar se funcionou

Após fazer logout/login, tente gerar um token novamente. Se ainda der erro, verifique:

1. O role no banco está como `ADMIN`?
2. Você fez logout e login após atualizar?
3. O token está sendo enviado corretamente nas requisições?

## Logs de Debug

Se ainda não funcionar, verifique os logs do servidor. A API agora mostra mensagens de erro mais detalhadas indicando qual role foi encontrado e qual é necessário.

