# ⚡ Solução Rápida - App Não Conecta

## ✅ Servidor Acessível (Confirmado)
Você consegue acessar `http://192.168.1.161:3000` no celular, então o servidor está OK!

## 🔧 Solução SEM Rebuild (Tente Primeiro)

### Opção 1: Configurar URL no App

1. **Abra o app no celular**
2. **Na tela de login**, toque em **"Configurações da API"** (botão no final da tela)
3. **Verifique/Configure a URL:**
   - Deve estar: `http://192.168.1.161:3000`
   - Se não estiver, digite e salve
4. **Tente fazer login novamente**

### Opção 2: Limpar Dados do App

Se a configuração não funcionar:

1. **Android:**
   - Configurações → Apps → Ekklesia → Armazenamento → Limpar Dados
   - Ou desinstale e reinstale o app

2. **Tente fazer login novamente**

## 🔨 Se Não Funcionar: Rebuild Necessário

Se mesmo configurando a URL o app não conectar, você precisa fazer rebuild:

### Passo 1: Verificar URL Padrão

Edite `mobile/lib/services/config_service.dart`:

```dart
static const String _defaultApiUrl = 'http://192.168.1.161:3000';
```

Certifique-se de que está correto.

### Passo 2: Rebuild do APK

```bash
cd mobile
flutter clean
flutter pub get
flutter build apk --release
```

### Passo 3: Instalar o Novo APK

1. Copie o APK gerado para o celular
2. Desinstale a versão antiga
3. Instale a nova versão
4. Tente fazer login

## 🐛 Debug: Verificar o que está acontecendo

### No App (Logs)

Quando tentar fazer login, o app mostra logs. Procure por:

```
🔐 Tentando login com email: ...
🌐 URL Base: ...
🌐 URL Completa: ...
```

**Se a URL estiver errada:**
- Configure na tela de Configurações
- Ou faça rebuild

**Se a URL estiver correta mas ainda der erro:**
- Verifique os logs do servidor Next.js
- Pode ser problema de CORS ou autenticação

### No Servidor (Logs)

No terminal onde o servidor está rodando, você deve ver:

```
POST /api/auth/member/login
Body recebido: { email: '...', password: '***' }
```

**Se não aparecer nada:**
- A requisição não está chegando ao servidor
- Problema de rede ou URL incorreta

**Se aparecer erro:**
- Verifique as credenciais
- Verifique os logs de erro

## ✅ Checklist Rápido

- [ ] Tentei configurar a URL na tela de Configurações do app
- [ ] Limpei os dados do app (ou reinstalei)
- [ ] Verifiquei os logs do app (URL está correta?)
- [ ] Verifiquei os logs do servidor (requisição chegou?)
- [ ] Se nada funcionar, fiz rebuild do APK

## 🎯 Resposta Direta

**SIM, você provavelmente precisa fazer rebuild** se:
- O app foi instalado antes de implementarmos a tela de configurações
- A URL padrão estava diferente
- Limpar dados/configurar não funcionou

**NÃO precisa rebuild se:**
- Você consegue configurar a URL na tela de Configurações
- A URL está sendo salva e usada corretamente
- O problema é outro (credenciais, CORS, etc.)

## 📱 Teste Rápido

1. Abra o app
2. Vá em Configurações da API
3. Veja qual URL está configurada
4. Se estiver errada, configure e salve
5. Tente login
6. Se não funcionar → Rebuild necessário

