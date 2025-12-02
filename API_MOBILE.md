# APIs para Aplicativo Mobile (React Native)

Este documento descreve as APIs que serão utilizadas pelo aplicativo mobile React Native para funcionalidades dos membros.

## Autenticação de Membros

### Token de Privacidade

Os membros não fazem login no sistema web. Eles acessam suas informações através de um **token de privacidade** gerado por um administrador.

#### Gerar Token de Privacidade (Admin)

**Endpoint:** `POST /api/members/[id]/generate-privacy-token`

**Autenticação:** Requer autenticação de User (Admin/Pastor)

**Resposta:**
```json
{
  "success": true,
  "privacyToken": "abc123...",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "memberId": "member-id",
  "memberName": "Nome do Membro",
  "memberEmail": "email@example.com",
  "message": "Token de privacidade gerado com sucesso. Este token será usado pelo aplicativo mobile.",
  "note": "Este token permite que o membro acesse suas informações de privacidade no aplicativo mobile."
}
```

**Nota:** Este token deve ser enviado ao membro (via email, SMS, etc.) para que ele possa configurar o acesso no app mobile.

---

## APIs de Privacidade (LGPD)

Todas as APIs de privacidade utilizam o **token de privacidade** do membro, não autenticação de User.

### 1. Buscar Dados do Membro

**Endpoint:** `GET /api/privacy/member?token={privacyToken}`

**Autenticação:** Token de privacidade (query parameter)

**Resposta:**
```json
{
  "id": "member-id",
  "name": "Nome do Membro",
  "email": "email@example.com",
  "dataConsent": true,
  "consentDate": "2024-01-15T10:00:00.000Z",
  "pendingDeletionRequest": {
    "scheduledDeletionAt": "2024-02-15T10:00:00.000Z"
  } | null
}
```

---

### 2. Gerenciar Consentimento

**Endpoint:** `POST /api/privacy/consent`

**Autenticação:** Token de privacidade (no body)

**Body:**
```json
{
  "token": "privacy-token",
  "granted": true // ou false para revogar
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Consentimento concedido com sucesso",
  "dataConsent": true,
  "consentDate": "2024-01-15T10:00:00.000Z"
}
```

**GET:** `GET /api/privacy/consent?token={privacyToken}` - Buscar status do consentimento

---

### 3. Exportar Dados

**Endpoint:** `POST /api/privacy/export`

**Autenticação:** Token de privacidade (no body)

**Body:**
```json
{
  "token": "privacy-token"
}
```

**Resposta:** Arquivo JSON com todos os dados pessoais do membro

---

### 4. Solicitar Exclusão de Dados

**Endpoint:** `POST /api/privacy/delete-request`

**Autenticação:** Token de privacidade (no body)

**Body:**
```json
{
  "token": "privacy-token",
  "reason": "Motivo da solicitação de exclusão"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Solicitação de exclusão criada com sucesso. Você receberá um email de confirmação.",
  "scheduledDeletionAt": "2024-02-15T10:00:00.000Z",
  "requestId": "request-id",
  "canCancelUntil": "2024-02-15T10:00:00.000Z"
}
```

**Nota:** A exclusão é agendada para 30 dias após a solicitação (período de graça conforme LGPD).

---

### 5. Cancelar Solicitação de Exclusão

**Endpoint:** `POST /api/privacy/cancel-deletion`

**Autenticação:** Token de privacidade (no body)

**Body:**
```json
{
  "token": "privacy-token"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Solicitação de exclusão cancelada com sucesso"
}
```

---

## Fluxo de Uso no App Mobile

1. **Admin gera token** via dashboard web
2. **Token é enviado ao membro** (email, SMS, WhatsApp, etc.)
3. **Membro configura token no app mobile**
4. **App mobile usa o token** para todas as requisições de privacidade
5. **Token expira após 90 dias** (configurável)

## Segurança

- Tokens são únicos e criptograficamente seguros (32 bytes hex)
- Tokens têm data de expiração (90 dias por padrão)
- Todas as ações são registradas em logs de auditoria
- Tokens são invalidados quando o membro é deletado

## Notas para Desenvolvimento Mobile

- O token deve ser armazenado de forma segura no dispositivo (Keychain/Keystore)
- Implementar renovação automática de token antes da expiração
- Tratar erros de token inválido/expirado adequadamente
- Implementar refresh do token quando necessário

