# 🔍 Diagnóstico de Problemas no Login Mobile

## Problema: "Email ou senha inválidos" mesmo com credenciais corretas

### ✅ Correções Aplicadas

1. **Busca case-insensitive de email**: O sistema agora normaliza o email para lowercase antes de buscar no banco, garantindo que funcione mesmo se o email estiver em maiúsculas no banco de dados.

2. **Melhor tratamento de erros**: Logs mais detalhados para identificar o problema específico.

### 🔍 Verificações Necessárias

#### 1. Verificar se o Módulo MOBILE_APP está Ativo

A igreja do membro **DEVE** ter o módulo `MOBILE_APP` ativo. Verifique:

```sql
-- Verificar se o módulo MOBILE_APP existe
SELECT * FROM modules WHERE `key` = 'MOBILE_APP';

-- Verificar se a igreja tem o módulo MOBILE_APP ativo
SELECT 
  c.id as church_id,
  c.name as church_name,
  m.key as module_key,
  m.name as module_name,
  pm.moduleId IS NOT NULL as has_in_plan,
  cm.id IS NOT NULL as has_custom,
  cm.active as custom_active,
  cm.expiresAt as custom_expires_at
FROM churches c
LEFT JOIN plans p ON c.planId = p.id
LEFT JOIN plan_modules pm ON p.id = pm.planId AND pm.moduleId = (SELECT id FROM modules WHERE `key` = 'MOBILE_APP')
LEFT JOIN church_modules cm ON c.id = cm.churchId AND cm.moduleId = (SELECT id FROM modules WHERE `key` = 'MOBILE_APP')
LEFT JOIN modules m ON m.key = 'MOBILE_APP'
WHERE c.id = 'ID_DA_IGREJA_AQUI';
```

**Substitua `ID_DA_IGREJA_AQUI` pelo ID da igreja do membro.**

#### 2. Verificar se o Membro Existe e Tem Senha

```sql
-- Verificar membro
SELECT 
  id,
  name,
  email,
  CASE WHEN password IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_senha,
  deletedAt,
  churchId
FROM members
WHERE LOWER(TRIM(email)) = LOWER(TRIM('email_do_membro@exemplo.com'));
```

**Substitua `email_do_membro@exemplo.com` pelo email do membro.**

#### 3. Verificar se a Igreja Está Ativa

```sql
-- Verificar status da igreja
SELECT 
  id,
  name,
  systemEnabled,
  planId,
  planExpiresAt,
  CASE 
    WHEN systemEnabled = 0 THEN 'BLOQUEADA'
    WHEN planExpiresAt IS NOT NULL AND planExpiresAt < NOW() THEN 'PLANO EXPIRADO'
    ELSE 'ATIVA'
  END as status
FROM churches
WHERE id = 'ID_DA_IGREJA_AQUI';
```

#### 4. Verificar o Plano da Igreja

```sql
-- Verificar plano e módulos
SELECT 
  p.id as plan_id,
  p.name as plan_name,
  p.active as plan_active,
  m.key as module_key,
  m.name as module_name,
  m.active as module_active
FROM churches c
JOIN plans p ON c.planId = p.id
JOIN plan_modules pm ON p.id = pm.planId
JOIN modules m ON pm.moduleId = m.id
WHERE c.id = 'ID_DA_IGREJA_AQUI'
AND m.key = 'MOBILE_APP';
```

### 🛠️ Soluções

#### Solução 1: Ativar Módulo MOBILE_APP para a Igreja

**Opção A: Via Dashboard (Recomendado)**

1. Acesse o dashboard administrativo
2. Vá em "Configurações" > "Planos" ou "Módulos"
3. Ative o módulo "App para Membros" (MOBILE_APP) para a igreja
4. OU atribua o plano "Master" à igreja (inclui MOBILE_APP)

**Opção B: Via SQL (Direto no Banco)**

```sql
-- 1. Verificar se o módulo existe
SELECT id FROM modules WHERE `key` = 'MOBILE_APP';

-- 2. Se não existir, criar (ou executar seed)
-- Execute: npm run db:seed

-- 3. Ativar módulo individualmente para a igreja
INSERT INTO church_modules (id, churchId, moduleId, active, createdAt, updatedAt)
SELECT 
  CONCAT('cm_', UUID()),
  'ID_DA_IGREJA_AQUI',
  (SELECT id FROM modules WHERE `key` = 'MOBILE_APP'),
  1,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM church_modules 
  WHERE churchId = 'ID_DA_IGREJA_AQUI' 
  AND moduleId = (SELECT id FROM modules WHERE `key` = 'MOBILE_APP')
);
```

#### Solução 2: Verificar e Corrigir Email do Membro

Se o email no banco estiver em formato diferente (maiúsculas, espaços, etc.):

```sql
-- Verificar email exato no banco
SELECT id, name, email, LOWER(TRIM(email)) as email_normalizado
FROM members
WHERE id = 'ID_DO_MEMBRO_AQUI';

-- Se necessário, normalizar email (CUIDADO: faça backup antes!)
-- UPDATE members 
-- SET email = LOWER(TRIM(email))
-- WHERE id = 'ID_DO_MEMBRO_AQUI';
```

#### Solução 3: Verificar e Definir Senha do Membro

Se o membro não tem senha:

```sql
-- Verificar se tem senha
SELECT id, name, email, 
  CASE WHEN password IS NULL THEN 'SEM SENHA' ELSE 'COM SENHA' END as status_senha
FROM members
WHERE id = 'ID_DO_MEMBRO_AQUI';

-- Definir senha (via dashboard é mais seguro, mas se necessário via SQL):
-- A senha deve ser hash bcrypt, use o dashboard para definir
```

### 📋 Checklist de Verificação

Execute este checklist na ordem:

- [ ] Módulo `MOBILE_APP` existe no banco de dados
- [ ] Igreja tem o módulo `MOBILE_APP` ativo (via plano ou individual)
- [ ] Igreja está ativa (`systemEnabled = true`)
- [ ] Plano da igreja não expirou (se tiver `planExpiresAt`)
- [ ] Membro existe no banco de dados
- [ ] Membro não está deletado (`deletedAt IS NULL`)
- [ ] Membro tem senha definida (`password IS NOT NULL`)
- [ ] Email do membro está correto (verificar formato)
- [ ] Senha do membro está correta (testar no dashboard web)

### 🧪 Testar Login via API

Teste direto na API para ver o erro específico:

```bash
curl -X POST https://enord.app/api/auth/member/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email_do_membro@exemplo.com",
    "password": "senha_do_membro"
  }'
```

**Possíveis respostas:**

1. **401 - "Email ou senha inválidos"**
   - Email não encontrado
   - Senha incorreta
   - Membro deletado
   - Membro sem senha

2. **403 - "Sistema bloqueado"**
   - Igreja com `systemEnabled = false`

3. **403 - "Sua igreja não tem acesso ao aplicativo mobile"**
   - Igreja não tem módulo `MOBILE_APP` ativo

4. **200 - Sucesso**
   - Login funcionou! Retorna `token` e `member`

### 📝 Logs do Servidor

Verifique os logs do servidor para ver mensagens detalhadas:

```bash
# Se estiver usando PM2
pm2 logs

# Se estiver usando npm
# Os logs aparecerão no console onde o servidor está rodando
```

Procure por:
- `"Tentativa de login de membro para:"`
- `"Membro não encontrado ou deletado para email:"`
- `"Membro não tem senha definida:"`
- `"Senha inválida para email:"`
- `"Login bem-sucedido para membro:"`

### 🔧 Próximos Passos

1. Execute as verificações SQL acima
2. Identifique qual é o problema específico
3. Aplique a solução correspondente
4. Teste novamente o login no app mobile
5. Se ainda não funcionar, verifique os logs do servidor

---

**Nota:** As correções aplicadas garantem que o email seja normalizado (lowercase) antes da busca, resolvendo problemas de case-sensitivity. Mas o módulo `MOBILE_APP` ainda precisa estar ativo para a igreja!

