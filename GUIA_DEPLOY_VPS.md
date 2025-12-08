# 🚀 Guia Completo: Deploy em VPS com Domínio Público

Este guia detalha todos os passos necessários para fazer o app mobile funcionar perfeitamente quando a aplicação estiver hospedada em uma VPS com domínio público.

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Servidor (VPS)](#2-configuração-do-servidor-vps)
3. [Configuração do Next.js](#3-configuração-do-nextjs)
4. [Configuração do App Mobile](#4-configuração-do-app-mobile)
5. [Build e Deploy](#5-build-e-deploy)
6. [Testes e Validação](#6-testes-e-validação)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Pré-requisitos

### O que você precisa:

- ✅ VPS com acesso root/SSH
- ✅ Domínio configurado e apontando para o IP da VPS
- ✅ Node.js 18+ instalado na VPS
- ✅ MySQL/MariaDB instalado e configurado
- ✅ Nginx instalado (recomendado para proxy reverso)
- ✅ Certificado SSL (Let's Encrypt - gratuito)

### Exemplo de estrutura:

- **Domínio principal:** `ekklesia.com.br`
- **API/Backend:** `api.ekklesia.com.br` (ou `ekklesia.com.br/api`)
- **App Mobile:** Conecta em `https://api.ekklesia.com.br`

---

## 2. Configuração do Servidor (VPS)

### 2.1 Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Nginx
sudo apt install nginx -y

# Instalar MySQL (se ainda não tiver)
sudo apt install mysql-server -y

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### 2.2 Configurar Banco de Dados

```bash
# Criar banco de dados
sudo mysql -u root -p
```

```sql
CREATE DATABASE ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ekklesia_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON ekklesia.* TO 'ekklesia_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.3 Instalar Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL (substitua pelo seu domínio)
sudo certbot --nginx -d api.ekklesia.com.br

# Testar renovação automática
sudo certbot renew --dry-run
```

### 2.4 Configurar Nginx

Crie o arquivo `/etc/nginx/sites-available/ekklesia`:

```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name api.ekklesia.com.br;
    return 301 https://$server_name$request_uri;
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    server_name api.ekklesia.com.br;

    # Certificados SSL (ajustar caminho conforme Certbot)
    ssl_certificate /etc/letsencrypt/live/api.ekklesia.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ekklesia.com.br/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Tamanho máximo de upload (para imagens, etc)
    client_max_body_size 10M;

    # Proxy para Next.js
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Ativar a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/ekklesia /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar configuração
sudo systemctl reload nginx
```

---

## 3. Configuração do Next.js

### 3.1 Variáveis de Ambiente

Crie o arquivo `.env.production` na raiz do projeto:

```env
# Ambiente
NODE_ENV=production

# Database (ajustar conforme sua VPS)
DATABASE_URL="mysql://ekklesia_user:senha_forte_aqui@localhost:3306/ekklesia"

# JWT (GERAR UMA CHAVE FORTE E ÚNICA!)
JWT_SECRET="sua-chave-jwt-super-forte-e-aleatoria-aqui"
JWT_EXPIRES_IN=7d

# Application URL (seu domínio público)
APP_URL="https://api.ekklesia.com.br"
NEXTAUTH_URL="https://api.ekklesia.com.br"
NEXTAUTH_SECRET="sua-chave-nextauth-forte-aqui"

# LGPD Compliance
ENCRYPTION_KEY="sua-chave-de-criptografia-32-bytes-hex-aqui"

# CORS - Origens permitidas (separadas por vírgula)
# IMPORTANTE: Adicione o domínio do seu app web se tiver
ALLOWED_ORIGINS=https://ekklesia.com.br,https://app.ekklesia.com.br

# Email (opcional)
SENDGRID_API_KEY=""
EMAIL_FROM="noreply@ekklesia.com.br"
```

**⚠️ IMPORTANTE:** 
- Gere chaves fortes e únicas para `JWT_SECRET`, `NEXTAUTH_SECRET` e `ENCRYPTION_KEY`
- Use um gerador seguro: `openssl rand -hex 32`

### 3.2 Deploy do Código na VPS

```bash
# Na sua máquina local, fazer push para o repositório
git push origin main

# Na VPS, clonar ou fazer pull
cd /var/www
sudo git clone https://github.com/seu-usuario/ekklesia.git
cd ekklesia

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.production .env

# Executar migrações do Prisma
npx prisma migrate deploy
npx prisma generate

# Build do Next.js
npm run build
```

### 3.3 Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start npm --name "ekklesia" -- start

# Salvar configuração
pm2 save

# Configurar para iniciar automaticamente
pm2 startup
# Execute o comando que aparecer (algo como: sudo env PATH=... pm2 startup systemd -u seu-usuario --hp /home/seu-usuario)
```

### 3.4 Verificar se está funcionando

```bash
# Verificar logs
pm2 logs ekklesia

# Verificar status
pm2 status

# Testar localmente na VPS
curl http://localhost:3000/api/health
```

---

## 4. Configuração do App Mobile

### 4.1 Atualizar URL Padrão

Edite `mobile/lib/services/config_service.dart`:

```dart
static String get _defaultApiUrl {
  if (kIsWeb) {
    return 'https://api.ekklesia.com.br';  // HTTPS em produção
  } else {
    // Mobile/APK: URL de produção
    return 'https://api.ekklesia.com.br';  // HTTPS obrigatório
  }
}
```

### 4.2 Configurar Segurança de Rede (Android)

Edite `mobile/android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Configuração de produção: apenas HTTPS -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    
    <!-- Permitir apenas o domínio de produção -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.ekklesia.com.br</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
    
    <!-- Para desenvolvimento local (manter comentado em produção) -->
    <!-- 
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.161</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
    -->
</network-security-config>
```

### 4.3 Atualizar AndroidManifest.xml

Edite `mobile/android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:label="Ekklesia - Membros"
    android:name="${applicationName}"
    android:icon="@mipmap/ic_launcher"
    android:networkSecurityConfig="@xml/network_security_config">
    <!-- Remover ou comentar: android:usesCleartextTraffic="true" -->
    ...
</application>
```

### 4.4 Verificar CORS no Servidor

O arquivo `next.config.js` já está configurado para permitir CORS. Em produção, você pode querer restringir:

```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://api.ekklesia.com.br'  // Ajustar conforme necessário
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}
```

---

## 5. Build e Deploy

### 5.1 Build do App Mobile

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

### 5.2 Assinar o APK (Obrigatório)

```bash
# Gerar keystore (apenas uma vez - GUARDE A SENHA!)
keytool -genkey -v -keystore ~/ekklesia-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ekklesia

# Criar arquivo key.properties em mobile/android/
cat > mobile/android/key.properties << EOF
storePassword=SUA_SENHA_AQUI
keyPassword=SUA_SENHA_AQUI
keyAlias=ekklesia
storeFile=/caminho/completo/para/ekklesia-key.jks
EOF
```

Atualizar `mobile/android/app/build.gradle`:

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

### 5.3 Instalar o APK

O APK estará em: `mobile/build/app/outputs/flutter-apk/app-release.apk`

- Copie para o dispositivo
- Desinstale versões antigas
- Instale a nova versão
- Configure a URL se necessário (mas já deve estar com a URL de produção)

---

## 6. Testes e Validação

### 6.1 Testar API no Navegador

```bash
# Testar endpoint de saúde
curl https://api.ekklesia.com.br/api/health

# Testar login (substituir credenciais)
curl -X POST https://api.ekklesia.com.br/api/auth/member/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'
```

### 6.2 Testar Certificado SSL

Acesse no navegador: `https://api.ekklesia.com.br`

- Verificar se o cadeado aparece
- Verificar se não há avisos de certificado inválido
- Testar alguns endpoints da API

### 6.3 Testar no App Mobile

1. **Abrir o app** no dispositivo
2. **Verificar URL** nas configurações (deve estar `https://api.ekklesia.com.br`)
3. **Tentar fazer login**
4. **Verificar se todas as funcionalidades funcionam:**
   - Login
   - Visualizar perfil
   - Ver eventos
   - Ver ministérios
   - Ver certificados
   - Confirmar presença em eventos

### 6.4 Verificar Logs

```bash
# Logs do servidor (PM2)
pm2 logs ekklesia

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 7. Troubleshooting

### Erro: "Certificate not trusted" no app

**Causa:** Certificado SSL inválido ou auto-assinado

**Solução:**
- Verificar se o certificado Let's Encrypt está válido
- Verificar se o domínio está correto
- Verificar se o certificado não expirou: `sudo certbot certificates`

### Erro: "Connection refused" ou "Network error"

**Causa:** Servidor não está acessível ou firewall bloqueando

**Solução:**
```bash
# Verificar se o servidor está rodando
pm2 status

# Verificar se a porta 3000 está aberta
sudo netstat -tlnp | grep 3000

# Verificar firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Erro: "CORS policy blocked"

**Causa:** CORS não configurado corretamente

**Solução:**
- Verificar `next.config.js`
- Verificar variável `ALLOWED_ORIGINS` no `.env`
- Verificar se o middleware está adicionando headers CORS

### Erro: "Cleartext HTTP traffic not permitted"

**Causa:** App tentando usar HTTP em vez de HTTPS

**Solução:**
- Verificar se a URL no app está com `https://`
- Verificar `network_security_config.xml`
- Verificar se `cleartextTrafficPermitted="false"` está configurado

### App não conecta mesmo com tudo configurado

**Checklist:**
1. ✅ Servidor está rodando? (`pm2 status`)
2. ✅ Domínio está acessível? (testar no navegador)
3. ✅ Certificado SSL válido? (verificar cadeado no navegador)
4. ✅ URL no app está correta? (verificar nas configurações)
5. ✅ Firewall permite tráfego? (`sudo ufw status`)
6. ✅ Nginx está configurado corretamente? (`sudo nginx -t`)
7. ✅ Logs mostram algum erro? (`pm2 logs`)

---

## 📝 Checklist Final

### Servidor (VPS)
- [ ] Node.js instalado e funcionando
- [ ] MySQL configurado e banco criado
- [ ] Nginx instalado e configurado
- [ ] Certificado SSL válido (Let's Encrypt)
- [ ] Domínio apontando para o IP da VPS
- [ ] Variáveis de ambiente configuradas
- [ ] Prisma migrations executadas
- [ ] Next.js buildado e rodando (PM2)
- [ ] Firewall configurado (portas 80, 443)
- [ ] Logs sendo monitorados

### App Mobile
- [ ] URL padrão atualizada para HTTPS
- [ ] `network_security_config.xml` configurado
- [ ] `AndroidManifest.xml` sem `usesCleartextTraffic`
- [ ] APK assinado corretamente
- [ ] Build de release testado
- [ ] App instalado e testado em dispositivo real

### Segurança
- [ ] JWT_SECRET forte e único
- [ ] NEXTAUTH_SECRET forte e único
- [ ] ENCRYPTION_KEY gerada corretamente
- [ ] Senhas do banco de dados fortes
- [ ] CORS restrito em produção
- [ ] Headers de segurança configurados
- [ ] HTTPS obrigatório (sem HTTP)

---

## 🎉 Pronto!

Após seguir todos os passos, seu app mobile deve funcionar perfeitamente com o domínio público na VPS!

**Lembre-se:**
- Manter certificado SSL renovado (Let's Encrypt renova automaticamente)
- Monitorar logs regularmente
- Fazer backups do banco de dados
- Manter o sistema atualizado

---

**Última atualização:** $(date)

