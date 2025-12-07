# 📱 Como Acompanhar Implementações Sem Celular

Guia completo para continuar testando e acompanhando o desenvolvimento do app mobile sem precisar do celular físico.

## 🎯 Opções Disponíveis

### 1. **Emulador Android** (Recomendado - Mais Próximo do Real)

#### Pré-requisitos:
- Android Studio instalado
- Android SDK configurado

#### Passos:

1. **Criar um Emulador:**
   - Abra o Android Studio
   - Vá em: `Tools` → `Device Manager`
   - Clique em `Create Device`
   - Escolha um dispositivo (ex: Pixel 5)
   - Escolha uma imagem do sistema (ex: Android 13)
   - Finalize a criação

2. **Iniciar o Emulador:**
   - No Device Manager, clique em ▶️ ao lado do emulador criado
   - Aguarde o emulador iniciar completamente

3. **Executar o App:**
   ```powershell
   cd mobile
   flutter run
   ```
   O Flutter detectará automaticamente o emulador e instalará o app.

4. **Configurar URL da API:**
   - Para emulador Android, use: `http://10.0.2.2:3000`
   - Edite `mobile/lib/config/api_config.dart`:
   ```dart
   static const String baseUrl = 'http://10.0.2.2:3000';
   ```

**Vantagens:**
- ✅ Experiência muito próxima do dispositivo real
- ✅ Pode testar diferentes tamanhos de tela
- ✅ Hot reload funciona perfeitamente
- ✅ Pode simular diferentes versões do Android

---

### 2. **Flutter Web** (Mais Rápido - Navegador)

O Flutter pode rodar diretamente no navegador!

#### Passos:

1. **Verificar se o suporte web está habilitado:**
   ```powershell
   flutter doctor
   ```

2. **Executar no navegador:**
   ```powershell
   cd mobile
   flutter run -d chrome
   ```
   Ou escolha outro navegador:
   ```powershell
   flutter run -d edge
   flutter run -d firefox
   ```

3. **Configurar URL da API:**
   - Para web, use: `http://localhost:3000`
   - Edite `mobile/lib/config/api_config.dart`:
   ```dart
   static const String baseUrl = 'http://localhost:3000';
   ```

**Vantagens:**
- ✅ Inicia muito rápido
- ✅ Não precisa de emulador pesado
- ✅ Hot reload instantâneo
- ✅ Fácil de debugar com DevTools do navegador

**Limitações:**
- ⚠️ Algumas funcionalidades mobile podem não funcionar (câmera, notificações push, etc.)
- ⚠️ Layout pode ser diferente do mobile

---

### 3. **Testar API Diretamente** (Backend)

Teste todas as funcionalidades da API sem precisar do app!

#### Opção A: Postman / Insomnia

1. **Instalar Postman:** https://www.postman.com/downloads/
   Ou **Insomnia:** https://insomnia.rest/download

2. **Importar Collection:**
   - Crie requisições para testar os endpoints
   - Exemplo de login:
   ```
   POST http://localhost:3000/api/auth/member/login
   Content-Type: application/json
   
   {
     "email": "membro@exemplo.com",
     "password": "senha123"
   }
   ```

3. **Endpoints Principais para Testar:**
   - `GET /api/members/me` - Perfil do membro
   - `GET /api/members/me/donations` - Doações
   - `GET /api/members/me/certificates` - Certificados
   - `GET /api/members/me/courses` - Cursos
   - `GET /api/members/me/ministries` - Ministérios
   - `GET /api/members/me/events` - Eventos

#### Opção B: cURL (Terminal)

```powershell
# Testar login
curl -X POST http://localhost:3000/api/auth/member/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"membro@exemplo.com\",\"password\":\"senha123\"}'

# Testar perfil (com token)
curl -X GET http://localhost:3000/api/members/me `
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Opção C: Navegador (GET requests)

Abra no navegador:
- `http://localhost:3000/api/members/me?token=SEU_TOKEN`
- `http://localhost:3000/api/dashboard/stats`

---

### 4. **Dashboard Web** (Interface Administrativa)

Teste a interface web completa do sistema:

1. **Iniciar o servidor:**
   ```powershell
   npm run dev
   ```

2. **Acessar no navegador:**
   - Dashboard: http://localhost:3000/dashboard
   - Login: http://localhost:3000/login
   - Plataforma: http://localhost:3000/platform

3. **Credenciais padrão:**
   - Admin: `admin@ekklesia.com` / `admin123`
   - Pastor: `pastor@ekklesia.com` / `pastor123`

**Funcionalidades que você pode testar:**
- ✅ Gestão de membros
- ✅ Gestão de ministérios
- ✅ Gestão de eventos
- ✅ Gestão de finanças
- ✅ Relatórios e analytics
- ✅ Configurações LGPD

---

### 5. **Acompanhar Logs do Servidor**

Veja tudo que está acontecendo no backend em tempo real:

1. **Iniciar servidor com logs detalhados:**
   ```powershell
   npm run dev
   ```

2. **Monitorar requisições:**
   - Todas as requisições aparecem no terminal
   - Erros são exibidos em vermelho
   - Você pode ver exatamente o que o app está fazendo

3. **Logs úteis para acompanhar:**
   - Requisições de autenticação
   - Erros de validação
   - Queries do banco de dados
   - Tempo de resposta das APIs

---

### 6. **Prisma Studio** (Banco de Dados Visual)

Veja e edite os dados diretamente no banco:

```powershell
npm run db:studio
```

Isso abre uma interface web em: http://localhost:5555

**O que você pode fazer:**
- ✅ Ver todos os dados do banco
- ✅ Editar registros diretamente
- ✅ Criar novos registros
- ✅ Ver relacionamentos entre tabelas
- ✅ Testar queries

---

## 🚀 Recomendação: Workflow Completo

Para acompanhar tudo sem celular, use esta combinação:

1. **Dashboard Web** - Testar funcionalidades administrativas
2. **Flutter Web** - Testar o app mobile no navegador
3. **Postman** - Testar APIs específicas
4. **Prisma Studio** - Ver/editar dados do banco
5. **Logs do Servidor** - Acompanhar requisições em tempo real

---

## 📋 Checklist Rápido

### Para testar o app mobile:
- [ ] Emulador Android configurado OU
- [ ] Flutter Web habilitado (`flutter run -d chrome`)
- [ ] URL da API configurada corretamente
- [ ] Servidor Next.js rodando (`npm run dev`)

### Para testar a API:
- [ ] Postman/Insomnia instalado
- [ ] Servidor rodando
- [ ] Token de autenticação (se necessário)

### Para testar o dashboard:
- [ ] Servidor rodando
- [ ] Credenciais de acesso
- [ ] Navegador aberto em http://localhost:3000

---

## 🔧 Comandos Úteis

```powershell
# Ver dispositivos disponíveis (emuladores, navegadores, etc.)
flutter devices

# Executar em dispositivo específico
flutter run -d chrome
flutter run -d windows
flutter run -d android

# Ver logs do Flutter
flutter logs

# Limpar cache do Flutter
flutter clean
flutter pub get

# Verificar status do Flutter
flutter doctor -v
```

---

## 💡 Dicas

1. **Use Flutter Web para desenvolvimento rápido** - É mais leve que emulador
2. **Use Emulador Android para testes finais** - Mais próximo do real
3. **Use Postman para debugar APIs** - Mais fácil que testar no app
4. **Monitore os logs** - Você vê tudo que está acontecendo
5. **Use Prisma Studio** - Fácil de ver e editar dados

---

## ❓ Problemas Comuns

### "No devices found"
- Para web: `flutter run -d chrome`
- Para Android: Inicie o emulador primeiro

### "Connection refused" na API
- Verifique se o servidor está rodando: `npm run dev`
- Verifique a URL configurada no app

### "CORS error" no navegador
- O servidor já está configurado para aceitar requisições do Flutter Web
- Se persistir, verifique `lib/cors.ts`

---

Agora você pode continuar desenvolvendo e testando mesmo sem o celular! 🎉

