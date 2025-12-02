# 🚀 Guia de Configuração para Produção

Este guia detalha todas as configurações necessárias para colocar o app em produção com segurança.

---

## 📋 Índice

1. [Configurações do Servidor Next.js](#1-configurações-do-servidor-nextjs)
2. [Configurações do App Flutter](#2-configurações-do-app-flutter)
3. [Segurança e Certificados SSL](#3-segurança-e-certificados-ssl)
4. [CORS e Headers de Segurança](#4-cors-e-headers-de-segurança)
5. [Build e Deploy](#5-build-e-deploy)

---

## 1. Configurações do Servidor Next.js

### 1.1 Variáveis de Ambiente

Crie/atualize o arquivo `.env` na raiz do projeto:

```env
# Ambiente
NODE_ENV=production

# Database
DATABASE_URL="mysql://user:password@host:3306/ekklesia"

# JWT
JWT_SECRET="seu-jwt-secret-forte-aqui"
JWT_EXPIRES_IN=7d

# Application URL (URL pública do seu servidor)
APP_URL="https://api.suaigreja.com"
NEXTAUTH_URL="https://api.suaigreja.com"
NEXTAUTH_SECRET="seu-nextauth-secret-aqui"

# Encryption Key (para LGPD)
ENCRYPTION_KEY="sua-chave-de-criptografia-32-bytes"

# Email (opcional, mas recomendado)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
EMAIL_FROM="noreply@suaigreja.com"
```

### 1.2 Configurar HTTPS

**Opção 1: Usando Nginx como Proxy Reverso (Recomendado)**

```nginx
server {
    listen 80;
    server_name api.suaigreja.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.suaigreja.com;

    ssl_certificate /etc/letsencrypt/live/api.suaigreja.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.suaigreja.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Opção 2: Usando PM2 com HTTPS**

Instale o certificado SSL e configure o Next.js para usar HTTPS diretamente.

### 1.3 Obter Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.suaigreja.com

# Renovação automática (já configurado no cron)
sudo certbot renew --dry-run
```

---

## 2. Configurações do App Flutter

### 2.1 Atualizar URL Padrão de Produção

Edite `mobile/lib/services/config_service.dart`:

```dart
static const String _defaultApiUrl = 'https://api.suaigreja.com';
```

### 2.2 Configurar Segurança de Rede para HTTPS

Edite `mobile/android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Configuração de produção: apenas HTTPS -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <!-- Se usar certificado auto-assinado, adicione aqui -->
            <!-- <certificates src="user" /> -->
        </trust-anchors>
    </base-config>
    
    <!-- Permitir apenas o domínio de produção -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.suaigreja.com</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
    
    <!-- Para desenvolvimento local (remover em produção) -->
    <!-- 
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.161</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
    -->
</network-security-config>
```

### 2.3 Atualizar AndroidManifest.xml

Remova ou comente `usesCleartextTraffic="true"` em produção:

```xml
<application
    android:label="Ekklesia - Membros"
    android:name="${applicationName}"
    android:icon="@mipmap/ic_launcher"
    android:networkSecurityConfig="@xml/network_security_config">
    <!-- Remover: android:usesCleartextTraffic="true" -->
```

---

## 3. Segurança e Certificados SSL

### 3.1 Requisitos de Certificado SSL

- ✅ Certificado válido emitido por uma CA confiável (Let's Encrypt, DigiCert, etc.)
- ✅ Certificado não expirado
- ✅ Domínio correspondente ao certificado
- ✅ Cadeia de certificados completa

### 3.2 Verificar Certificado

```bash
# Verificar certificado
openssl s_client -connect api.suaigreja.com:443 -showcerts

# Verificar expiração
echo | openssl s_client -servername api.suaigreja.com -connect api.suaigreja.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 4. CORS e Headers de Segurança

### 4.1 Atualizar CORS no Servidor

Edite `app/api/auth/member/login/route.ts` e outros endpoints:

```typescript
function getCorsHeaders() {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://suaigreja.com', 'https://app.suaigreja.com'] // Domínios permitidos
    : ['*']; // Desenvolvimento

  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
      ? (request.headers.get('origin') || allowedOrigins[0])
      : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}
```

### 4.2 Headers de Segurança Adicionais

Adicione no Nginx ou no middleware do Next.js:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

---

## 5. Build e Deploy

### 5.1 Build do App Flutter para Produção

```bash
cd mobile

# Limpar build anterior
flutter clean

# Obter dependências
flutter pub get

# Build APK de release
flutter build apk --release

# Ou build App Bundle (recomendado para Google Play)
flutter build appbundle --release
```

### 5.2 Assinar o APK (Obrigatório para produção)

```bash
# Gerar keystore (apenas uma vez)
keytool -genkey -v -keystore ~/ekklesia-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ekklesia

# Criar arquivo key.properties
echo "storePassword=SUA_SENHA_AQUI
keyPassword=SUA_SENHA_AQUI
keyAlias=ekklesia
storeFile=/caminho/para/ekklesia-key.jks" > android/key.properties

# Build assinado
flutter build apk --release
```

### 5.3 Configurar build.gradle para Assinatura

Edite `mobile/android/app/build.gradle`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 5.4 Deploy do Servidor Next.js

```bash
# Build do Next.js
npm run build

# Iniciar em produção
npm start

# Ou usando PM2 (recomendado)
npm install -g pm2
pm2 start npm --name "ekklesia-api" -- start
pm2 save
pm2 startup
```

---

## ✅ Checklist de Produção

### Servidor
- [ ] HTTPS configurado e funcionando
- [ ] Certificado SSL válido e não expirado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS restrito aos domínios permitidos
- [ ] Headers de segurança configurados
- [ ] Banco de dados de produção configurado
- [ ] Backup automático configurado
- [ ] Logs configurados
- [ ] Monitoramento configurado

### App Mobile
- [ ] URL de produção configurada
- [ ] `cleartextTrafficPermitted="false"` (apenas HTTPS)
- [ ] APK assinado corretamente
- [ ] Build de release testado
- [ ] Versão atualizada no `pubspec.yaml`
- [ ] Ícone e nome do app configurados

### Segurança
- [ ] Senhas padrão alteradas
- [ ] JWT_SECRET forte e único
- [ ] ENCRYPTION_KEY gerada e segura
- [ ] Firewall configurado
- [ ] Acesso SSH restrito
- [ ] Updates de segurança aplicados

---

## 🔍 Testes Pós-Deploy

1. **Testar Login no App**
   - Abrir app instalado
   - Tentar fazer login
   - Verificar se conecta ao servidor HTTPS

2. **Verificar Certificado SSL**
   - Acessar `https://api.suaigreja.com` no navegador
   - Verificar se o certificado é válido
   - Testar endpoints da API

3. **Testar CORS**
   - Verificar se requisições do app funcionam
   - Verificar se requisições de outros domínios são bloqueadas

4. **Monitorar Logs**
   - Verificar logs do servidor
   - Verificar logs do app (se possível)
   - Monitorar erros

---

## 🆘 Troubleshooting

### Erro: "Certificate not trusted"
- Verificar se o certificado SSL é válido
- Verificar se a cadeia de certificados está completa
- Verificar se o domínio corresponde ao certificado

### Erro: "Connection refused"
- Verificar se o servidor está rodando
- Verificar firewall e portas
- Verificar se o domínio está apontando corretamente

### Erro: "CORS policy blocked"
- Verificar configuração de CORS no servidor
- Verificar se o domínio do app está na lista de permitidos
- Verificar headers CORS nas respostas

---

## 📚 Recursos Adicionais

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Flutter Build and Release](https://docs.flutter.dev/deployment/android)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Android Network Security Config](https://developer.android.com/training/articles/security-config)

---

**Última atualização:** $(date)

