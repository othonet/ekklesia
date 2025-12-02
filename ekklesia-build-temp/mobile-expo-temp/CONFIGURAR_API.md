# 🔧 Configurar URL da API para Expo Go

## Problema: "Network request failed"

Se você está usando **Expo Go** em um **dispositivo físico** (celular), o app não consegue acessar `localhost` ou `10.0.2.2`. Você precisa usar o **IP da sua máquina** na rede local.

## ⚡ Solução Rápida (3 Passos)

### 1. Descobrir seu IP

**Windows:**
```powershell
ipconfig
```
Procure por **"IPv4 Address"** (ex: `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# ou
ip addr
```

### 2. Atualizar o arquivo `src/constants/api.ts`

Abra o arquivo `mobile-expo-temp/src/constants/api.ts` e altere **DUAS linhas**:

```typescript
// Linha 1: Coloque o IP que você descobriu
const DEVICE_IP = '192.168.1.100' // ⚠️ ALTERE AQUI

// Linha 2: Mude para true se estiver usando Expo Go no celular físico
const USE_DEVICE_IP = true // ⚠️ ALTERE para true
```

**Exemplo completo:**
```typescript
const DEVICE_IP = '192.168.1.100' // Seu IP aqui
const USE_DEVICE_IP = true // true = Expo Go no celular, false = emulador
```

### 3. Reiniciar o Expo

```powershell
# Pare o Expo (Ctrl+C)
# Depois execute novamente
npm start
```

## Verificar se Funcionou

1. Abra o app no Expo Go
2. Tente configurar um token
3. Se ainda der erro, verifique:
   - O servidor está rodando? (`npm run dev` na pasta raiz)
   - O IP está correto?
   - O celular e o computador estão na mesma rede Wi-Fi?

## Diferentes Cenários

### Expo Go em Dispositivo Físico
- Use o IP da sua máquina: `http://192.168.1.100:3000/api`
- Celular e computador devem estar na mesma rede Wi-Fi

### Android Emulator
- Use: `http://10.0.2.2:3000/api`
- Funciona automaticamente

### iOS Simulator (Mac)
- Use: `http://localhost:3000/api`
- Funciona automaticamente

## Teste Rápido

Teste se o servidor está acessível:

1. No seu computador, abra o navegador
2. Acesse: `http://localhost:3000/api/privacy/member?token=TESTE`
3. Deve retornar um erro de token inválido (isso é bom, significa que o servidor está funcionando)

4. No celular, abra o navegador
5. Acesse: `http://SEU_IP:3000/api/privacy/member?token=TESTE`
6. Se funcionar, o app também funcionará

## Firewall

Se ainda não funcionar, verifique o firewall:

**Windows:**
- Permita conexões na porta 3000
- Ou desative temporariamente o firewall para testar

**Mac:**
- Sistema > Segurança > Firewall
- Permita conexões de entrada para Node.js

## Dica

Se você mudar de rede Wi-Fi, precisará atualizar o IP novamente!

