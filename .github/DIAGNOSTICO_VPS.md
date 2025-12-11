# 🔍 Diagnóstico: VPS não está exibindo o sistema

## 🚨 Problema
A página está em branco em `enord.app/dashboard` mesmo após o CI/CD passar.

## 📋 Checklist de Diagnóstico

Execute estes comandos na VPS via SSH para identificar o problema:

### 1. Verificar Status do PM2

```bash
pm2 status
pm2 logs ekklesia --lines 50
```

**O que verificar:**
- ✅ Aplicação deve estar com status `online`
- ❌ Se estiver `errored` ou `stopped`, verifique os logs

### 2. Verificar se a Aplicação está Respondendo Localmente

```bash
curl http://localhost:3000
curl -I http://localhost:3000
```

**O que verificar:**
- ✅ Deve retornar HTML ou status 200
- ❌ Se não responder, a aplicação não está rodando

### 3. Verificar Status do Nginx

```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**O que verificar:**
- ✅ Nginx deve estar `active (running)`
- ✅ Configuração deve estar válida
- ❌ Se houver erros, verifique a configuração do proxy

### 4. Verificar Configuração do Nginx

```bash
sudo cat /etc/nginx/sites-available/enord.app
# ou
sudo cat /etc/nginx/sites-available/default
```

**O que verificar:**
- ✅ Deve ter `proxy_pass http://localhost:3000`
- ✅ Deve ter configuração SSL se usar HTTPS

### 5. Verificar Variáveis de Ambiente

```bash
cd /root/ekklesia  # ou caminho configurado em VPS_DEPLOY_PATH
cat .env.production
cat .env
```

**O que verificar:**
- ✅ Todas as variáveis devem estar configuradas
- ✅ `DATABASE_URL` deve estar correto
- ✅ `APP_URL` e `NEXTAUTH_URL` devem apontar para o domínio correto

### 6. Verificar Build

```bash
cd /root/ekklesia  # ou caminho configurado
ls -la .next/
```

**O que verificar:**
- ✅ Diretório `.next` deve existir e ter conteúdo
- ❌ Se estiver vazio, o build falhou

### 7. Verificar Conexão com Banco de Dados

```bash
cd /root/ekklesia
npx prisma db pull
# ou
mysql -u root -padmin123 -h localhost -e "USE ekklesia; SHOW TABLES;"
```

**O que verificar:**
- ✅ Deve conectar ao banco
- ✅ Tabelas devem existir

### 8. Verificar Portas

```bash
sudo netstat -tlnp | grep 3000
sudo ss -tlnp | grep 3000
```

**O que verificar:**
- ✅ Porta 3000 deve estar em uso pelo Node.js
- ❌ Se não estiver, a aplicação não iniciou

### 9. Verificar Logs do Sistema

```bash
sudo journalctl -u nginx -n 50
sudo dmesg | tail -20
```

## 🔧 Soluções Comuns

### Problema 1: PM2 não está rodando

```bash
cd /root/ekklesia
pm2 start npm --name "ekklesia" -- start
pm2 save
pm2 logs ekklesia
```

### Problema 2: Build não foi feito

```bash
cd /root/ekklesia
npm run build
pm2 restart ekklesia
```

### Problema 3: Nginx não está configurado corretamente

Verifique se o Nginx está apontando para `http://localhost:3000`:

```bash
sudo nano /etc/nginx/sites-available/enord.app
```

Deve ter algo como:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Depois:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Problema 4: Variáveis de ambiente incorretas

```bash
cd /root/ekklesia
# Editar .env.production
nano .env.production
# Copiar para .env
cp .env.production .env
# Reiniciar aplicação
pm2 restart ekklesia
```

### Problema 5: Aplicação crashando

```bash
pm2 logs ekklesia --lines 100
# Verificar erros específicos e corrigir
```

## 🚀 Comando de Re-deploy Rápido

Se nada funcionar, faça um re-deploy completo:

```bash
cd /root/ekklesia
git pull
cp .env.production .env
npm ci
npx prisma generate
npm run build
pm2 restart ekklesia
pm2 logs ekklesia
```

## 📞 Informações para Debug

Ao reportar o problema, inclua:

1. Saída de `pm2 status`
2. Últimas 50 linhas de `pm2 logs ekklesia`
3. Saída de `curl http://localhost:3000`
4. Saída de `sudo nginx -t`
5. Últimas 20 linhas de `sudo tail /var/log/nginx/error.log`
