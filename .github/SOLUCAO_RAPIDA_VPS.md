# 🚀 Solução Rápida: VPS não está exibindo o sistema

## ⚡ Comandos Rápidos para Executar na VPS

Conecte-se via SSH e execute estes comandos na ordem:

### 1. Verificar Status Básico

```bash
# Verificar PM2
pm2 status
pm2 logs ekklesia --lines 50

# Testar aplicação localmente
curl http://localhost:3000

# Verificar Nginx
sudo systemctl status nginx
sudo nginx -t
```

### 2. Se PM2 não estiver rodando ou estiver com erro:

```bash
cd /root/ekklesia  # ou o caminho configurado em VPS_DEPLOY_PATH

# Verificar se .env existe
ls -la .env .env.production

# Se não existir, criar
if [ -f .env.production ]; then
  cp .env.production .env
fi

# Reinstalar dependências
npm ci

# Gerar Prisma
npx prisma generate

# Fazer build
npm run build

# Reiniciar PM2
pm2 delete ekklesia || true
pm2 start npm --name "ekklesia" -- start
pm2 save

# Ver logs
pm2 logs ekklesia --lines 50
```

### 3. Se a aplicação não responder em localhost:3000:

```bash
# Verificar se a porta está em uso
sudo netstat -tlnp | grep 3000

# Verificar logs detalhados
pm2 logs ekklesia --lines 100

# Verificar variáveis de ambiente
cat .env | grep -E "DATABASE_URL|JWT_SECRET|APP_URL|NEXTAUTH_URL"
```

### 4. Se Nginx não estiver configurado:

```bash
# Verificar configuração
sudo cat /etc/nginx/sites-available/enord.app
# ou
sudo cat /etc/nginx/sites-available/default

# Se não existir, criar configuração básica:
sudo nano /etc/nginx/sites-available/enord.app
```

Cole esta configuração:

```nginx
server {
    listen 80;
    server_name enord.app www.enord.app;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Depois:
```bash
sudo ln -sf /etc/nginx/sites-available/enord.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Verificar Logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 6. Script de Diagnóstico Automático

Execute o script de diagnóstico:

```bash
cd /root/ekklesia  # ou caminho da aplicação
./scripts/vps/diagnosticar-vps.sh
```

## 🔧 Problemas Comuns e Soluções

### Problema: Página em branco

**Causas possíveis:**
1. PM2 não está rodando
2. Build não foi feito
3. Nginx não está configurado
4. Erro de JavaScript no cliente
5. Erro de conexão com banco

**Solução:**
```bash
# 1. Verificar PM2
pm2 status
pm2 logs ekklesia

# 2. Se necessário, reiniciar
pm2 restart ekklesia

# 3. Verificar console do navegador (F12)
# Procure por erros JavaScript
```

### Problema: Erro 502 Bad Gateway

**Causa:** Nginx não consegue conectar ao Next.js

**Solução:**
```bash
# Verificar se Next.js está rodando
curl http://localhost:3000

# Se não responder, verificar PM2
pm2 status
pm2 logs ekklesia

# Reiniciar se necessário
pm2 restart ekklesia
```

### Problema: Erro de conexão com banco

**Solução:**
```bash
# Verificar DATABASE_URL
cat .env | grep DATABASE_URL

# Testar conexão
mysql -u root -padmin123 -h localhost -e "USE ekklesia; SHOW TABLES;"

# Se falhar, verificar MySQL
sudo systemctl status mysql
```

## 📞 Informações para Debug

Se o problema persistir, execute e compartilhe:

```bash
# Status completo
pm2 status
pm2 logs ekklesia --lines 100
curl -v http://localhost:3000
sudo nginx -t
sudo systemctl status nginx
cat .env | grep -v "SECRET\|KEY\|PASSWORD"
```
