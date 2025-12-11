# 🔧 Corrigir Nginx para VPS

## ✅ Status Atual
- ✅ PM2 está rodando (`ekklesia` online)
- ✅ Next.js está respondendo em `localhost:3000`
- ❌ Nginx provavelmente não está configurado ou não está apontando corretamente

## 🔍 Comandos para Verificar Nginx

Execute estes comandos na VPS:

```bash
# 1. Verificar se Nginx está rodando
sudo systemctl status nginx

# 2. Verificar configuração do Nginx
sudo nginx -t

# 3. Verificar se existe configuração para enord.app
sudo ls -la /etc/nginx/sites-available/ | grep enord
sudo ls -la /etc/nginx/sites-enabled/ | grep enord

# 4. Ver logs do Nginx
sudo tail -20 /var/log/nginx/error.log
sudo tail -20 /var/log/nginx/access.log

# 5. Testar se a aplicação responde localmente
curl -v http://localhost:3000
```

## 🔧 Criar/Corrigir Configuração do Nginx

Se não existir configuração para `enord.app`, crie:

```bash
sudo nano /etc/nginx/sites-available/enord.app
```

Cole esta configuração:

```nginx
server {
    listen 80;
    server_name enord.app www.enord.app;

    # Logs
    access_log /var/log/nginx/enord.app.access.log;
    error_log /var/log/nginx/enord.app.error.log;

    # Tamanho máximo de upload
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers importantes
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Depois, ative a configuração:

```bash
# Criar link simbólico
sudo ln -sf /etc/nginx/sites-available/enord.app /etc/nginx/sites-enabled/

# Remover default se estiver interferindo
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Se tudo estiver OK, recarregar Nginx
sudo systemctl reload nginx
```

## 🔒 Configurar SSL (Opcional mas Recomendado)

Se quiser HTTPS:

```bash
# Instalar Certbot se não tiver
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d enord.app -d www.enord.app

# O Certbot vai modificar automaticamente a configuração do Nginx
```

## ✅ Verificar se Funcionou

```bash
# Testar localmente
curl http://localhost:3000

# Testar via domínio (se DNS estiver configurado)
curl http://enord.app

# Ver logs em tempo real
sudo tail -f /var/log/nginx/enord.app.error.log
```

## 🐛 Troubleshooting

### Erro: "502 Bad Gateway"
- Verifique se a aplicação está rodando: `pm2 status`
- Verifique se a porta 3000 está acessível: `curl http://localhost:3000`

### Erro: "Connection refused"
- A aplicação pode não estar rodando: `pm2 restart ekklesia`
- Verifique os logs: `pm2 logs ekklesia`

### Erro: "No such file or directory"
- Verifique o caminho do proxy_pass: deve ser `http://localhost:3000`
- Verifique se não há espaços extras na configuração

### Nginx não recarrega
- Verifique erros: `sudo nginx -t`
- Veja logs: `sudo journalctl -u nginx -n 50`
