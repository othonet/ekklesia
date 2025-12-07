# 📱 Configurar IP para Dispositivo Físico

## Problema: "Erro ao fazer login" no celular

Quando você instala o APK em um dispositivo físico (celular real), o app não consegue conectar porque está usando a URL padrão do emulador (`http://10.0.2.2:3000`).

## ✅ Solução Rápida (3 passos)

### 1. Descobrir o IP do seu computador

**Windows (PowerShell):**
```powershell
ipconfig | findstr /i "IPv4"
```

Procure por algo como: `192.168.1.161`

**Ou abra o PowerShell e digite:**
```powershell
ipconfig
```

Procure por **"Endereço IPv4"** na seção da sua conexão Wi-Fi/Ethernet.

### 2. Configurar no app

1. Abra o app no celular
2. Na tela de login, toque em **"Configurações da API"** (botão no final da tela)
3. Altere a URL para: `http://SEU_IP:3000`
   - Exemplo: `http://192.168.1.161:3000`
4. Toque em **"Salvar URL"**
5. Volte para a tela de login e tente fazer login novamente

### 3. Verificar requisitos

✅ **Celular e computador na mesma rede Wi-Fi**
- Ambos devem estar conectados na mesma rede Wi-Fi
- Não pode ser rede de dados móveis
- Não pode ser rede diferente

✅ **Servidor rodando**
- No computador, execute: `npm run dev`
- Deve aparecer: "Ready on http://localhost:3000"

✅ **Firewall permitindo conexões**
- O Windows pode estar bloqueando a porta 3000
- Se necessário, permita no Firewall do Windows

## 🔍 Testar se está funcionando

**No navegador do celular:**
1. Abra o navegador no celular
2. Acesse: `http://192.168.1.161:3000` (use seu IP)
3. Deve carregar a página do sistema

Se carregar, significa que o servidor está acessível e você pode usar essa URL no app.

## 🚨 Problemas Comuns

### "Erro de conexão" mesmo após configurar

1. **Verifique se o servidor está rodando:**
   ```bash
   npm run dev
   ```

2. **Verifique se está na mesma rede Wi-Fi:**
   - Celular e computador devem estar na mesma rede

3. **Verifique o firewall:**
   - O Windows pode estar bloqueando
   - Permita a porta 3000 no Firewall

4. **Teste no navegador do celular:**
   - Se não carregar no navegador, o problema não é do app

### IP mudou

Se o IP do computador mudar (pode acontecer ao reconectar no Wi-Fi):
1. Descubra o novo IP: `ipconfig`
2. Atualize no app (Configurações)

### Servidor não acessível externamente

O servidor já está configurado para aceitar conexões externas (`-H 0.0.0.0` no `package.json`).

Se ainda não funcionar, verifique se o servidor está rodando com:
```bash
npm run dev
```

## 📝 Exemplo Completo

**Seu IP:** `192.168.1.161`

**URL para configurar no app:**
```
http://192.168.1.161:3000
```

**Passos:**
1. Abra o app
2. Toque em "Configurações da API"
3. Digite: `http://192.168.1.161:3000`
4. Toque em "Salvar URL"
5. Faça login normalmente

## 💡 Dica

Se você sempre usa o mesmo computador e rede, pode salvar a URL uma vez e ela será lembrada pelo app.

