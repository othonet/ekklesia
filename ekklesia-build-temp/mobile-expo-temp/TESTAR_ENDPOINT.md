# 🧪 Testar Endpoint da API

## Verificar se o Endpoint Está Funcionando

### 1. Teste no Navegador (Computador)

Abra no navegador:
```
http://localhost:3000/api/privacy/member?token=TESTE123
```

**Resultado esperado:**
- Se o servidor estiver rodando: retorna erro "Token inválido ou expirado" (isso é bom!)
- Se não estiver rodando: erro de conexão

### 2. Teste no Celular (Expo Go)

Se estiver usando Expo Go no celular físico:

1. Descubra o IP da sua máquina:
   ```powershell
   ipconfig
   ```

2. No navegador do celular, acesse:
   ```
   http://SEU_IP:3000/api/privacy/member?token=TESTE123
   ```
   (Substitua SEU_IP pelo IP que você descobriu)

**Resultado esperado:**
- Se funcionar: retorna erro de token inválido (isso é bom, significa que o endpoint está acessível)
- Se não funcionar: problema de rede/firewall

### 3. Verificar Logs do Servidor

Quando tentar validar o token no app, verifique os logs do servidor Next.js. Deve aparecer:

```
Validando token de privacidade: { tokenLength: 64, ... }
```

Se não aparecer, o servidor não está recebendo a requisição.

## Endpoint Correto

O endpoint correto é:
```
GET /api/privacy/member?token=TOKEN_AQUI
```

A URL completa deve ser:
- Emulador: `http://10.0.2.2:3000/api/privacy/member?token=...`
- Dispositivo físico: `http://192.168.1.100:3000/api/privacy/member?token=...` (use seu IP)

## Checklist de Verificação

- [ ] Servidor Next.js está rodando? (`npm run dev`)
- [ ] URL está correta no `src/constants/api.ts`?
- [ ] Se Expo Go no celular: `USE_DEVICE_IP = true`?
- [ ] IP correto configurado?
- [ ] Celular e computador na mesma rede Wi-Fi?
- [ ] Firewall permitindo conexões na porta 3000?

## Debug no App

Os logs agora mostram:
- 🔗 URL completa sendo chamada
- 📡 API_BASE_URL configurada
- 📡 Endpoint sendo usado
- 📤 Requisição sendo enviada
- 📥 Resposta recebida (status, headers)
- ❌ Erros detalhados

Verifique o console do Expo para ver esses logs.

