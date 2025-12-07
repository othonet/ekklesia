# 🔍 Diagnóstico de Conexão - App Ekklesia

## Problema: App não consegue conectar ao servidor local

### ✅ Checklist de Verificação

#### 1. Servidor Next.js está rodando?

**Verificar:**
```bash
# No terminal onde o servidor está rodando, você deve ver:
# "Ready on http://localhost:3000"
```

**Se não estiver rodando:**
```bash
npm run dev
```

#### 2. Servidor está acessível na rede local?

**Teste no navegador do computador:**
- Acesse: `http://192.168.1.161:3000`
- Deve carregar a página do sistema

**Se não carregar:**
- O servidor pode estar rodando apenas em `localhost`
- **Solução:** Inicie o servidor com:
  ```bash
  npm run dev -- -H 0.0.0.0
  ```
  Ou adicione no `package.json`:
  ```json
  "dev": "next dev -H 0.0.0.0"
  ```

#### 3. Firewall do Windows está bloqueando?

**Verificar:**
1. Abra "Firewall do Windows Defender"
2. Verifique se a porta 3000 está permitida
3. Ou desative temporariamente para testar

**Permitir porta no firewall:**
```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

#### 4. Dispositivo está na mesma rede Wi-Fi?

**Verificar:**
- Celular e computador devem estar na **mesma rede Wi-Fi**
- Não pode ser rede de dados móveis
- Não pode ser rede diferente

**Teste:**
- No celular, abra o navegador
- Acesse: `http://192.168.1.161:3000`
- Deve carregar a página

#### 5. IP do servidor está correto?

**Descobrir o IP correto:**
```powershell
# Windows PowerShell
ipconfig
```

Procure por **"IPv4 Address"** na seção da sua conexão Wi-Fi/Ethernet.

**Exemplo:**
```
Adaptador Ethernet Wi-Fi:
   IPv4 Address. . . . . . . . . . . . : 192.168.1.161
```

**Se o IP for diferente:**
1. Atualize no app (tela de Configurações)
2. Ou edite `mobile/lib/services/config_service.dart`:
   ```dart
   static const String _defaultApiUrl = 'http://SEU_IP_AQUI:3000';
   ```

#### 6. URL está configurada corretamente no app?

**Verificar no app:**
1. Abra o app
2. Vá em "Configurações da API" (botão na tela de login)
3. Verifique se a URL está: `http://192.168.1.161:3000`
4. Se não estiver, configure e salve

#### 7. Testar conexão diretamente

**No celular (navegador):**
```
http://192.168.1.161:3000/api/auth/member/login
```

Deve retornar um erro JSON (isso é bom, significa que o servidor está acessível).

**Com curl (no computador):**
```powershell
curl -X POST http://192.168.1.161:3000/api/auth/member/login -H "Content-Type: application/json" -d '{\"email\":\"teste@teste.com\",\"password\":\"teste\"}'
```

Deve retornar um erro de credenciais inválidas (isso é bom).

## 🔧 Soluções Comuns

### Solução 1: Servidor não está acessível externamente

**Problema:** Next.js por padrão roda apenas em `localhost`

**Solução:** Inicie o servidor escutando em todas as interfaces:

**Opção A - Comando direto:**
```bash
npm run dev -- -H 0.0.0.0
```

**Opção B - Modificar package.json:**
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0"
  }
}
```

Depois:
```bash
npm run dev
```

### Solução 2: Firewall bloqueando

**Windows:**
1. Abra "Firewall do Windows Defender com Segurança Avançada"
2. Clique em "Regras de Entrada"
3. Clique em "Nova Regra"
4. Escolha "Porta"
5. TCP, porta 3000
6. Permitir conexão
7. Aplique para todos os perfis

**Ou via PowerShell:**
```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Solução 3: IP mudou

**Se o IP do computador mudou:**
1. Descubra o novo IP: `ipconfig`
2. Atualize no app (Configurações)
3. Ou atualize o padrão em `config_service.dart`

### Solução 4: Rede diferente

**Certifique-se:**
- Celular e computador na mesma rede Wi-Fi
- Não use dados móveis no celular
- Não use VPN que possa interferir

## 🧪 Teste Completo

Execute este teste passo a passo:

1. **Servidor rodando?**
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

2. **Acessível no navegador do computador?**
   - Abra: `http://192.168.1.161:3000`
   - Deve carregar

3. **Acessível no navegador do celular?**
   - No celular, abra: `http://192.168.1.161:3000`
   - Deve carregar

4. **API responde?**
   - No celular: `http://192.168.1.161:3000/api/auth/member/login`
   - Deve retornar JSON (mesmo que erro)

5. **App configurado?**
   - Abra o app
   - Vá em Configurações
   - URL deve ser: `http://192.168.1.161:3000`
   - Salve se necessário

6. **Tente fazer login no app**

## 📱 Logs do App

O app mostra logs no console. Verifique:
- `🌐 URL Base:` - Deve mostrar o IP correto
- `🌐 URL Completa:` - Deve mostrar a URL completa
- `✅ Status:` - Deve ser 200 para sucesso
- `❌ Erro:` - Mostra o erro específico

## 🆘 Ainda não funciona?

1. **Verifique os logs do servidor Next.js** - Pode mostrar erros
2. **Verifique os logs do app** - Mostra a URL e erros
3. **Teste com Postman/Insomnia** - Para verificar se a API funciona
4. **Verifique se há proxy/VPN** - Pode interferir

