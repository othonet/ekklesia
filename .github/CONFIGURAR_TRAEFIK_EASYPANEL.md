# 🔧 Configurar Traefik no EasyPanel para enord.app

## ✅ Situação Identificada
Você está usando **EasyPanel** que gerencia o Traefik. A configuração está em `/etc/easypanel/traefik`.

## 🎯 Opções

### Opção 1: Configurar via EasyPanel (Recomendado)

Se você tem acesso à interface do EasyPanel:

1. Acesse o painel do EasyPanel
2. Vá para a aplicação `ekklesia` ou crie uma nova
3. Configure o domínio `enord.app` apontando para `localhost:3000`
4. O EasyPanel configurará automaticamente o Traefik

### Opção 2: Configurar Manualmente no Traefik

Adicione a configuração diretamente nos arquivos do Traefik:

```bash
# Ver estrutura de configuração
ls -la /etc/easypanel/traefik/

# Ver arquivos de configuração
cat /etc/easypanel/traefik/traefik.yml
cat /etc/easypanel/traefik/dynamic/*.yml 2>/dev/null || echo "Nenhum arquivo dynamic encontrado"
```

Crie um arquivo de configuração dinâmica:

```bash
# Criar diretório se não existir
sudo mkdir -p /etc/easypanel/traefik/dynamic

# Criar arquivo de configuração para enord.app
sudo nano /etc/easypanel/traefik/dynamic/enord-app.yml
```

Cole esta configuração:

```yaml
http:
  routers:
    enord-app:
      rule: "Host(`enord.app`) || Host(`www.enord.app`)"
      service: enord-app
      entryPoints:
        - web
      # Se tiver SSL configurado
      # entryPoints:
      #   - websecure
      # tls:
      #   certResolver: letsencrypt

  services:
    enord-app:
      loadBalancer:
        servers:
          - url: "http://host.docker.internal:3000"
        # Ou se não funcionar, tente:
        # - url: "http://172.17.0.1:3000"
```

**Nota:** O Traefik está rodando no Docker, então precisa acessar o host. Use:
- `host.docker.internal` (Docker Desktop / versões recentes)
- `172.17.0.1` (IP padrão do Docker bridge)
- Ou o IP real do host

Para descobrir o IP do host:

```bash
# Ver IP do host a partir do container
docker exec traefik.1.u1g4jju5q9dgrnb6719sacydf ip route | grep default | awk '{print $3}'
```

Depois, recarregue o Traefik:

```bash
# Recarregar Traefik (ele detecta mudanças automaticamente ou precisa reiniciar)
docker restart traefik.1.u1g4jju5q9dgrnb6719sacydf
```

### Opção 3: Parar Traefik e Usar Nginx (Mais Simples)

Se preferir usar Nginx diretamente:

```bash
# 1. Parar o Traefik
docker stop traefik.1.u1g4jju5q9dgrnb6719sacydf

# 2. Verificar se porta está livre
sudo netstat -tlnp | grep :80

# 3. Iniciar Nginx
sudo systemctl start nginx
sudo systemctl status nginx
sudo systemctl enable nginx

# 4. Configurar Nginx para enord.app
cd /root/ekklesia
sudo ./scripts/vps/configurar-nginx-enord.sh
```

## 🔍 Verificar Configuração Atual

```bash
# Ver estrutura de configuração do Traefik
ls -la /etc/easypanel/traefik/

# Ver configuração principal
cat /etc/easypanel/traefik/traefik.yml

# Ver logs do Traefik
docker logs traefik.1.u1g4jju5q9dgrnb6719sacydf --tail 50
```

## 🎯 Recomendação

**Para solução rápida:** Use a **Opção 3** (parar Traefik e usar Nginx)

**Para manter EasyPanel:** Use a **Opção 1** (configurar via interface do EasyPanel) ou **Opção 2** (configuração manual)

## 📝 Nota sobre EasyPanel

Se você está usando EasyPanel para gerenciar aplicações, pode ser melhor:
1. Adicionar a aplicação `ekklesia` no EasyPanel
2. Configurar o domínio `enord.app` na interface
3. O EasyPanel configurará automaticamente o Traefik

Mas se você já tem a aplicação rodando com PM2, a Opção 3 (Nginx) é mais direta.
