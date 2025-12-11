# 🔧 Configurar Traefik para enord.app

## ✅ Situação Atual
Você já tem o Traefik rodando nas portas 80 e 443. Em vez de parar o Traefik e usar Nginx, vamos configurar o Traefik para fazer proxy para sua aplicação Next.js.

## 🎯 Opção 1: Usar Traefik (Recomendado)

O Traefik já está funcionando como reverse proxy. Você só precisa configurá-lo para rotear `enord.app` para `localhost:3000`.

### Passo 1: Verificar Configuração do Traefik

```bash
# Ver onde está a configuração do Traefik
docker inspect traefik.1.u1g4jju5q9dgrnb6719sacydf | grep -A 10 "Mounts"

# Verificar se há arquivo de configuração
ls -la /etc/traefik/
ls -la /var/lib/docker/volumes/ | grep traefik
```

### Passo 2: Configurar Rota no Traefik

O Traefik pode ser configurado via:
- Labels Docker (se usar Docker Compose/Swarm)
- Arquivo de configuração estático
- API do Traefik

**Se usar Docker Compose/Swarm**, adicione labels ao serviço da aplicação:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.ekklesia.rule=Host(`enord.app`)"
  - "traefik.http.routers.ekklesia.entrypoints=web"
  - "traefik.http.services.ekklesia.loadbalancer.server.port=3000"
```

**Se usar arquivo de configuração**, adicione em `traefik.yml`:

```yaml
http:
  routers:
    ekklesia:
      rule: "Host(`enord.app`)"
      service: ekklesia
      entryPoints:
        - web
  
  services:
    ekklesia:
      loadBalancer:
        servers:
          - url: "http://localhost:3000"
```

## 🎯 Opção 2: Parar Traefik e Usar Nginx

Se você preferir usar Nginx em vez do Traefik:

```bash
# 1. Parar o container Traefik
docker stop traefik.1.u1g4jju5q9dgrnb6719sacydf

# 2. Verificar se porta está livre
sudo netstat -tlnp | grep :80

# 3. Iniciar Nginx
sudo systemctl start nginx
sudo systemctl status nginx

# 4. Configurar Nginx para enord.app
cd /root/ekklesia
sudo ./scripts/vps/configurar-nginx-enord.sh
```

## 🔍 Verificar Qual Método o Traefik Está Usando

```bash
# Ver configuração do container Traefik
docker inspect traefik.1.u1g4jju5q9dgrnb6719sacydf

# Ver logs do Traefik
docker logs traefik.1.u1g4jju5q9dgrnb6719sacydf

# Verificar se há arquivo docker-compose.yml
find /root -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null
find /opt -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null
```

## 📝 Recomendação

Como o Traefik já está rodando e configurado, recomendo:

1. **Manter o Traefik** e configurá-lo para rotear `enord.app` → `localhost:3000`
2. Isso evita conflitos e aproveita a infraestrutura existente
3. O Traefik é mais moderno e tem recursos avançados (SSL automático, load balancing, etc.)

## 🚀 Próximos Passos

1. Identifique como o Traefik está configurado (Docker Compose, arquivo estático, etc.)
2. Adicione a rota para `enord.app` apontando para `localhost:3000`
3. Recarregue/Reinicie o Traefik se necessário

Se preferir usar Nginx, siga a Opção 2 acima.
