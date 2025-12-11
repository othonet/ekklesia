# 🔧 Resolver: Porta 80 já está em uso

## ❌ Problema
O Nginx não consegue iniciar porque a porta 80 já está sendo usada por outro processo.

Erro: `bind() to 0.0.0.0:80 failed (98: Address already in use)`

## 🔍 Passo 1: Identificar o Processo

Execute estes comandos para descobrir o que está usando a porta 80:

```bash
# Verificar qual processo está usando a porta 80
sudo netstat -tlnp | grep :80
# ou
sudo ss -tlnp | grep :80
# ou
sudo lsof -i :80
```

## 🔧 Passo 2: Resolver (escolha uma opção)

### Opção A: Parar o processo que está usando a porta 80

Se for outro servidor web (Apache, outro Nginx, etc.):

```bash
# Se for Apache
sudo systemctl stop apache2
sudo systemctl disable apache2

# Se for outro Nginx
sudo pkill nginx
# ou
sudo systemctl stop nginx

# Se for outro processo, identifique o PID e pare:
# sudo kill <PID>
```

### Opção B: Verificar se é outro servidor web

```bash
# Verificar Apache
sudo systemctl status apache2

# Verificar outros serviços web
sudo systemctl list-units | grep -E "apache|httpd|nginx|web"
```

### Opção C: Se for necessário manter o outro serviço

Se você precisa manter o outro serviço rodando, você pode:

1. **Configurar o Nginx para usar outra porta** (não recomendado para produção)
2. **Parar o outro serviço e usar apenas Nginx** (recomendado)

## ✅ Passo 3: Após resolver, iniciar Nginx

```bash
# Iniciar Nginx
sudo systemctl start nginx

# Verificar status
sudo systemctl status nginx

# Habilitar para iniciar automaticamente
sudo systemctl enable nginx
```

## 🔍 Diagnóstico Completo

Execute este script para diagnóstico completo:

```bash
# Ver todos os processos usando portas 80 e 443
echo "=== Porta 80 ==="
sudo netstat -tlnp | grep :80
echo ""
echo "=== Porta 443 ==="
sudo netstat -tlnp | grep :443
echo ""
echo "=== Serviços web ativos ==="
sudo systemctl list-units --type=service --state=running | grep -E "apache|httpd|nginx|web"
```

## 🎯 Solução Recomendada

Na maioria dos casos, você quer usar apenas o Nginx. Execute:

```bash
# 1. Parar Apache se estiver rodando
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl disable apache2 2>/dev/null || true

# 2. Parar qualquer outro Nginx
sudo pkill nginx 2>/dev/null || true

# 3. Verificar se porta 80 está livre
sudo netstat -tlnp | grep :80

# 4. Iniciar Nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

## 📝 Exemplo de Saída Esperada

Após identificar o processo, você verá algo como:

```
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      12345/apache2
```

Isso mostra que o Apache (PID 12345) está usando a porta 80.
