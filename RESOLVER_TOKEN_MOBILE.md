# 🔧 Resolver: "Token inválido ou expirado" no App Mobile

## Problema

O app mobile está mostrando erro "Token inválido ou expirado" ao tentar configurar o token.

## Correções Realizadas

### 1. Ordem de Validação Corrigida
- **Antes**: Tentava validar o token ANTES de salvá-lo
- **Agora**: Valida o token primeiro, depois salva apenas se válido

### 2. Limpeza do Token
- Remove espaços e quebras de linha automaticamente
- Valida comprimento mínimo do token

### 3. Logs de Debug Adicionados
- Logs no app mobile (console)
- Logs no servidor (backend)

## Como Debugar

### 1. Verificar o Token no Banco de Dados

```sql
SELECT id, name, email, privacyToken, privacyTokenExpiresAt 
FROM members 
WHERE privacyToken IS NOT NULL;
```

### 2. Verificar se o Token Foi Gerado Corretamente

No dashboard, ao gerar o token:
- O token deve aparecer no dialog
- Deve ser copiado automaticamente
- Verifique se não há espaços extras ao colar

### 3. Verificar Logs do Servidor

Quando tentar validar o token, verifique os logs do servidor:
- Deve mostrar "Validando token de privacidade"
- Deve mostrar se encontrou o membro ou não
- Se expirado, mostrará a data de expiração

### 4. Verificar Logs do App Mobile

No console do Expo/React Native:
- Deve mostrar a URL sendo chamada
- Deve mostrar o status da resposta
- Deve mostrar os dados recebidos

## Possíveis Causas

### 1. Token com Espaços
**Solução**: O código agora remove espaços automaticamente

### 2. Token Não Salvo no Banco
**Solução**: Verifique se o token foi realmente salvo após gerar

### 3. Token Expirado
**Solução**: Gere um novo token (tokens expiram em 90 dias)

### 4. URL da API Incorreta
**Solução**: Verifique `src/constants/api.ts`:
- Android Emulator: `http://10.0.2.2:3000/api`
- Dispositivo Físico: Use o IP da sua máquina (ex: `http://192.168.1.100:3000/api`)

### 5. Servidor Não Está Rodando
**Solução**: Certifique-se que o servidor Next.js está rodando na porta 3000

## Teste Manual

### 1. Gerar Token no Dashboard
1. Vá em `/dashboard/members`
2. Clique no botão de smartphone ao lado do membro
3. Copie o token gerado

### 2. Testar Token Diretamente na API

```bash
# Substitua TOKEN_AQUI pelo token gerado
curl "http://localhost:3000/api/privacy/member?token=TOKEN_AQUI"
```

Se funcionar no curl, o problema está no app mobile.
Se não funcionar, o problema está no token ou no servidor.

### 3. Verificar no App Mobile

1. Abra o app mobile
2. Cole o token
3. Verifique os logs no console
4. Verifique os logs do servidor

## Próximos Passos

Se ainda não funcionar:

1. **Verifique os logs do servidor** quando tentar validar
2. **Verifique os logs do app mobile** no console
3. **Teste o token diretamente** via curl/Postman
4. **Verifique a URL da API** no arquivo `src/constants/api.ts`
5. **Gere um novo token** e tente novamente

## Dicas

- Tokens são únicos e seguros (64 caracteres hexadecimais)
- Tokens expiram em 90 dias
- Cada membro pode ter apenas um token ativo
- Gerar um novo token invalida o anterior

