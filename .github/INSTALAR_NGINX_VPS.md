# 📦 Instalar e Configurar Nginx na VPS

## ❌ Problema Identificado
O Nginx não está instalado na VPS (`Unit nginx.service could not be found`).

## 🔧 Solução: Instalar Nginx

Execute estes comandos na VPS:

### 1. Instalar Nginx

```bash
# Atualizar pacotes
sudo apt update

# Instalar Nginx
sudo apt install -y nginx

# Verificar instalação
sudo systemctl status nginx
```

### 2. Verificar se Nginx está rodando

```bash
# Ver status
sudo systemctl status nginx

# Iniciar se não estiver rodando
sudo systemctl start nginx

# Habilitar para iniciar automaticamente
sudo systemctl enable nginx
```

### 3. Configurar Nginx para enord.app

**Opção A: Usar o script automático (Recomendado)**

```bash
cd /root/ekklesia
sudo ./scripts/vps/configurar-nginx-enord.sh
```

**Opção B: Configuração manual**

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/enord.app
```

Cole esta configuração:

```nginx
server {
    listen 80;
    server_name enord.app www.enord.app;

    access_log /var/log/nginx/enord.app.access.log;
    error_log /var/log/nginx/enord.app.error.log;
    client_max_body_size 10M;

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

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Depois:

```bash
# Ativar configuração
sudo ln -sf /etc/nginx/sites-available/enord.app /etc/nginx/sites-enabled/

# Remover default se existir
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 4. Verificar Firewall

Se o firewall estiver ativo, libere as portas HTTP e HTTPS:

```bash
# Verificar se UFW está ativo
sudo ufw status

# Se estiver ativo, liberar portas
sudo ufw allow 'Nginx Full'
# ou
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 5. Testar

```bash
# Testar localmente
curl http://localhost:3000

# Testar via Nginx (se DNS estiver configurado)
curl http://enord.app

# Ver logs
sudo tail -f /var/log/nginx/enord.app.error.log
```

## ✅ Checklist de Verificação

Após instalar e configurar, verifique:

- [ ] Nginx está instalado: `sudo systemctl status nginx`
- [ ] Nginx está rodando: `sudo systemctl is-active nginx`
- [ ] Configuração está válida: `sudo nginx -t`
- [ ] Aplicação responde localmente: `curl http://localhost:3000`
- [ ] Nginx responde: `curl http://localhost` (deve retornar algo do Next.js)
- [ ] Firewall permite portas 80/443: `sudo ufw status`

## 🐛 Troubleshooting

### Nginx não inicia
```bash
# Ver logs de erro
sudo journalctl -u nginx -n 50
sudo tail -f /var/log/nginx/error.log
```

### Erro de permissão
```bash
# Verificar permissões
sudo ls -la /etc/nginx/sites-available/
sudo ls -la /etc/nginx/sites-enabled/
```

### Porta 80 já em uso
```bash
# Verificar o que está usando a porta 80
sudo netstat -tlnp | grep :80
sudo ss -tlnp | grep :80
```
