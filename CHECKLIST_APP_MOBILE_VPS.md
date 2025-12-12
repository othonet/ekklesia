# 📱 Checklist: App Mobile na VPS

Este documento lista **tudo que precisa ser feito** para que o app mobile funcione corretamente quando a aplicação estiver na VPS.

## ✅ Pré-requisitos no Backend (VPS)

### 1. **Módulo MOBILE_APP Deve Estar Criado no Banco**

O módulo `MOBILE_APP` precisa existir no banco de dados. Execute na VPS:

```bash
# Conectar na VPS
ssh usuario@seu-servidor.com

# Ir para o diretório
cd /caminho/da/aplicacao

# Executar seed (cria módulos, incluindo MOBILE_APP)
npm run db:seed
```

**Verificar se foi criado:**
```bash
# Via Prisma Studio
npx prisma studio

# OU via MySQL
mysql -u usuario -p nome_do_banco -e "SELECT key, name, active FROM modules WHERE key = 'MOBILE_APP';"
```

### 2. **Igreja Deve Ter o Módulo MOBILE_APP Ativo**

A igreja precisa ter o módulo `MOBILE_APP` associado (via plano ou individualmente).

**Verificar:**
```bash
# Verificar se a igreja tem o módulo no plano
mysql -u usuario -p nome_do_banco << EOF
SELECT 
  c.name as igreja,
  p.name as plano,
  m.key as modulo_key,
  m.name as modulo_name
FROM churches c
LEFT JOIN plans p ON c.planId = p.id
LEFT JOIN plan_modules pm ON p.id = pm.planId
LEFT JOIN modules m ON pm.moduleId = m.id
WHERE m.key = 'MOBILE_APP' AND c.id = 'ID_DA_IGREJA';
EOF

# OU verificar módulos individuais
mysql -u usuario -p nome_do_banco -e "SELECT * FROM church_modules WHERE churchId = 'ID_DA_IGREJA' AND moduleId = (SELECT id FROM modules WHERE key = 'MOBILE_APP');"
```

**Associar o módulo à igreja:**

1. Acesse `/platform/tenants` como administrador da plataforma
2. Selecione a igreja
3. Vá em "Módulos"
4. Ative o módulo "App para Membros" (MOBILE_APP)

**OU via plano:**
- Atribua o plano "Master" à igreja (inclui MOBILE_APP)
- OU edite o plano da igreja e adicione o módulo MOBILE_APP

### 3. **APIs do App Mobile Devem Estar Acessíveis**

As seguintes APIs devem estar funcionando:

- ✅ `/api/auth/member/login` - Login de membro
- ✅ `/api/auth/member/login-with-token` - Login com token de privacidade
- ✅ `/api/members/me` - Dados do membro
- ✅ `/api/members/me/donations` - Doações
- ✅ `/api/members/me/certificates` - Certificados
- ✅ `/api/members/me/courses` - Cursos
- ✅ `/api/members/me/ministries` - Ministérios
- ✅ `/api/members/me/events` - Eventos
- ✅ `/api/members/me/schedules` - Escalas
- ✅ `/api/members/me/attendance` - Presenças
- ✅ `/api/privacy/member` - Dados de privacidade (token)

**Testar APIs:**
```bash
# Testar login (deve retornar erro se igreja não tiver MOBILE_APP)
curl -X POST https://seu-dominio.com/api/auth/member/login \
  -H "Content-Type: application/json" \
  -d '{"email":"membro@exemplo.com","password":"senha"}'

# Se retornar erro 403: "Sua igreja não tem acesso ao aplicativo mobile"
# Significa que o módulo MOBILE_APP não está ativo para a igreja
```

### 4. **CORS Configurado Corretamente**

O `next.config.js` deve permitir requisições do app mobile:

```javascript
// next.config.js já está configurado para permitir app mobile
headers: async () => {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NODE_ENV === 'production'
            ? process.env.ALLOWED_ORIGINS || '*'
            : '*' // App mobile não envia Origin, então precisa permitir *
        },
        // ...
      ],
    },
  ]
}
```

### 5. **HTTPS Configurado (Obrigatório para Produção)**

O app mobile **NÃO funciona com HTTP** em produção. Precisa de HTTPS:

```bash
# Verificar se SSL está configurado
sudo nginx -t
sudo systemctl status nginx

# Se não tiver SSL, configurar:
sudo ./scripts/vps/configurar-ssl.sh seu-dominio.com
```

---

## 📱 Configuração no App Mobile

### 1. **Atualizar URL da API**

O app mobile precisa apontar para a URL da VPS, não `localhost`.

**Arquivo:** `mobile/lib/config/api_config.dart` (ou equivalente)

**Antes (desenvolvimento):**
```dart
static const String baseUrl = 'http://localhost:3000';
// OU
static const String baseUrl = 'http://192.168.1.100:3000'; // IP local
```

**Depois (produção):**
```dart
static const String baseUrl = 'https://api.ekklesia.com.br';
// OU
static const String baseUrl = 'https://seu-dominio.com';
```

### 2. **Configurar Segurança de Rede (Android)**

**Arquivo:** `mobile/android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Permitir apenas HTTPS em produção -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    
    <!-- Permitir seu domínio -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.ekklesia.com.br</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>
```

**Arquivo:** `mobile/android/app/src/main/AndroidManifest.xml`

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### 3. **Rebuild do App Mobile**

Após alterar a URL da API, é necessário fazer rebuild:

```bash
cd mobile

# Android
flutter build apk --release
# OU
flutter build appbundle --release

# iOS (apenas macOS)
flutter build ios --release
```

---

## 🔍 Verificação Completa

### 1. Verificar Backend (VPS)

```bash
# 1. Módulo MOBILE_APP existe?
mysql -u usuario -p nome_do_banco -e "SELECT * FROM modules WHERE key = 'MOBILE_APP';"

# 2. Igreja tem o módulo?
# Via plataforma: /platform/tenants/[churchId]/modules
# Deve mostrar "App para Membros" como ativo

# 3. APIs respondem?
curl -X POST https://seu-dominio.com/api/auth/member/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"teste"}'

# Se retornar 403: "Sua igreja não tem acesso ao aplicativo mobile"
# → Módulo MOBILE_APP não está ativo para a igreja
```

### 2. Verificar App Mobile

```bash
# 1. URL da API está correta?
# Verificar: mobile/lib/config/api_config.dart

# 2. App foi rebuildado após mudar URL?
# Verificar: data do APK/IPA

# 3. Testar login no app
# Deve conseguir fazer login se:
# - Email/senha estão corretos
# - Igreja tem módulo MOBILE_APP ativo
```

---

## 🐛 Problemas Comuns

### Problema: "Sua igreja não tem acesso ao aplicativo mobile"

**Causa:** Igreja não tem o módulo `MOBILE_APP` ativo.

**Solução:**
1. Acesse `/platform/tenants` como admin da plataforma
2. Selecione a igreja
3. Vá em "Módulos"
4. Ative o módulo "App para Membros"

**OU:**
1. Atribua o plano "Master" à igreja
2. O plano Master inclui o módulo MOBILE_APP

### Problema: "Network request failed" no app

**Causa:** URL da API incorreta ou servidor não acessível.

**Solução:**
1. Verificar se a URL no app está correta: `https://seu-dominio.com`
2. Verificar se o servidor está rodando: `pm2 status`
3. Verificar se o domínio está acessível: `curl https://seu-dominio.com`
4. Verificar firewall/portas

### Problema: "SSL certificate error" no Android

**Causa:** Certificado SSL inválido ou não confiável.

**Solução:**
1. Verificar se o SSL está configurado: `sudo certbot certificates`
2. Verificar se o certificado não expirou
3. Atualizar `network_security_config.xml` se necessário

### Problema: Login funciona mas APIs retornam 401

**Causa:** Token JWT não está sendo enviado corretamente.

**Solução:**
1. Verificar se o token está sendo salvo após login
2. Verificar se o token está sendo enviado no header: `Authorization: Bearer <token>`
3. Verificar logs do servidor para ver se o token está sendo recebido

---

## 📋 Checklist Rápido

Execute na VPS:

```bash
# ✅ 1. Módulo MOBILE_APP existe?
npm run db:seed  # Cria módulos se não existirem

# ✅ 2. Verificar módulos
npx prisma studio  # Abre interface web

# ✅ 3. Verificar se APIs estão funcionando
curl -X POST https://seu-dominio.com/api/auth/member/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste","password":"teste"}'

# ✅ 4. Verificar logs
pm2 logs ekklesia --lines 50
```

No app mobile:

```bash
# ✅ 1. Atualizar URL da API
# Editar: mobile/lib/config/api_config.dart
# Mudar para: https://seu-dominio.com

# ✅ 2. Rebuild do app
cd mobile
flutter build apk --release

# ✅ 3. Instalar e testar
# Instalar o novo APK no dispositivo
# Tentar fazer login
```

---

## 🎯 Resumo: O Que Fazer AGORA

### Na VPS:

1. **Executar seed** (cria módulos):
   ```bash
   npm run db:seed
   ```

2. **Associar módulo MOBILE_APP à igreja**:
   - Via plataforma: `/platform/tenants/[churchId]/modules`
   - OU atribuir plano Master

3. **Verificar se APIs estão funcionando**:
   ```bash
   curl https://seu-dominio.com/api/auth/member/login
   ```

### No App Mobile:

1. **Atualizar URL da API** para `https://seu-dominio.com`

2. **Rebuild do app**:
   ```bash
   cd mobile
   flutter build apk --release
   ```

3. **Instalar e testar** o novo APK

---

**Última atualização:** Após implementação do sistema de módulos
