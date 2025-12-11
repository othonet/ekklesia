# 🔧 Resolver: Docker está usando a porta 80

## ❌ Problema Identificado
O Docker está usando a porta 80 através de `docker-proxy`, impedindo o Nginx de iniciar.

## 🔍 Passo 1: Identificar o Container

Execute estes comandos para descobrir qual container está usando a porta 80:

```bash
# Ver todos os containers rodando
docker ps

# Ver containers com mapeamento de porta 80
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 80

# Ver detalhes de portas
docker ps --format "{{.Names}}: {{.Ports}}"
```

## 🔧 Passo 2: Resolver (escolha uma opção)

### Opção A: Parar o Container Docker (Recomendado se não precisar dele)

```bash
# Identificar o container
docker ps | grep 80

# Parar o container (substitua CONTAINER_NAME pelo nome real)
docker stop <CONTAINER_NAME>

# Remover o container se não precisar mais
docker rm <CONTAINER_NAME>
```

### Opção B: Remapear a Porta do Container

Se você precisa manter o container Docker rodando, remapeie para outra porta:

```bash
# Parar o container
docker stop <CONTAINER_NAME>

# Recriar com porta diferente (exemplo: usar porta 8080)
docker run -d -p 8080:80 <IMAGE_NAME>

# Ou se estiver usando docker-compose, edite o arquivo docker-compose.yml
# e mude "80:80" para "8080:80"
```

### Opção C: Parar Todos os Containers Docker (se não precisar de nenhum)

```bash
# Parar todos os containers
docker stop $(docker ps -q)

# Verificar se porta 80 está livre
sudo netstat -tlnp | grep :80
```

## ✅ Passo 3: Após Liberar a Porta, Iniciar Nginx

```bash
# Verificar se porta 80 está livre
sudo netstat -tlnp | grep :80

# Se estiver livre (sem saída), iniciar Nginx
sudo systemctl start nginx
sudo systemctl status nginx
sudo systemctl enable nginx
```

## 🔍 Diagnóstico Completo

Execute este script para ver todos os containers e suas portas:

```bash
echo "=== Containers Docker Rodando ==="
docker ps

echo ""
echo "=== Containers usando porta 80 ==="
docker ps --format "{{.Names}}: {{.Ports}}" | grep 80

echo ""
echo "=== Processos usando porta 80 ==="
sudo netstat -tlnp | grep :80
```

## 🎯 Solução Rápida

Se você não precisa do container Docker na porta 80:

```bash
# 1. Ver containers
docker ps

# 2. Parar o container que está usando porta 80
# (Substitua CONTAINER_NAME pelo nome real do container)
docker stop <CONTAINER_NAME>

# 3. Verificar se porta está livre
sudo netstat -tlnp | grep :80

# 4. Iniciar Nginx
sudo systemctl start nginx
sudo systemctl status nginx

# 5. Configurar Nginx para enord.app
cd /root/ekklesia
sudo ./scripts/vps/configurar-nginx-enord.sh
```

## 📝 Exemplo de Saída

Ao executar `docker ps`, você verá algo como:

```
CONTAINER ID   IMAGE          COMMAND                  PORTS                    NAMES
abc123def456   nginx:latest   "nginx -g 'daemon of…"   0.0.0.0:80->80/tcp      some-nginx
```

Isso mostra que o container `some-nginx` está mapeando a porta 80.
