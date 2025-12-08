# 🔐 Recuperar/Redefinir Senha do MySQL

Este guia ajuda você a recuperar ou redefinir a senha do MySQL na VPS.

## 🔍 Opção 1: Verificar Senha Atual (Se Consegue Acessar)

Se você consegue acessar a VPS e tem acesso root:

```bash
# Conectar na VPS
ssh root@72.61.42.147

# Tentar acessar MySQL sem senha (pode funcionar se configurado assim)
mysql -u root

# Ou tentar com senha vazia
mysql -u root -p
# (pressione Enter quando pedir senha)
```

Se conseguir acessar, você pode ver/alterar usuários:

```sql
-- Ver usuários e hosts
SELECT user, host FROM mysql.user;

-- Ver usuário específico (ex: ekklesia_user)
SELECT user, host FROM mysql.user WHERE user = 'ekklesia_user';

-- Alterar senha de um usuário
ALTER USER 'ekklesia_user'@'localhost' IDENTIFIED BY 'nova_senha_forte_aqui';
FLUSH PRIVILEGES;
```

## 🔧 Opção 2: Redefinir Senha do Root (Recomendado)

### Passo 1: Parar MySQL

```bash
# Na VPS
sudo systemctl stop mysql
# ou
sudo systemctl stop mysqld
```

### Passo 2: Iniciar MySQL em Modo Seguro

```bash
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

### Passo 3: Conectar sem Senha

```bash
mysql -u root
```

### Passo 4: Redefinir Senha

```sql
-- No MySQL
USE mysql;

-- Redefinir senha do root
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nova_senha_forte_aqui';
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

### Passo 5: Reiniciar MySQL Normalmente

```bash
# Parar MySQL em modo seguro
sudo pkill mysqld

# Iniciar MySQL normalmente
sudo systemctl start mysql

# Verificar status
sudo systemctl status mysql
```

### Passo 6: Testar Nova Senha

```bash
mysql -u root -p
# Digite a nova senha quando solicitado
```

## 🔑 Opção 3: Redefinir Senha de Usuário Específico

Se você sabe a senha do root mas esqueceu a senha de outro usuário:

```bash
# Conectar como root
mysql -u root -p

# No MySQL
ALTER USER 'ekklesia_user'@'localhost' IDENTIFIED BY 'nova_senha_forte_aqui';
FLUSH PRIVILEGES;
EXIT;
```

## 📝 Opção 4: Criar Novo Usuário (Se Não Consegue Recuperar)

Se não conseguir recuperar a senha, crie um novo usuário:

```bash
# Conectar como root
mysql -u root -p

# Criar novo usuário
CREATE USER 'ekklesia_user_new'@'localhost' IDENTIFIED BY 'senha_forte_aqui';

# Dar permissões
GRANT ALL PRIVILEGES ON ekklesia.* TO 'ekklesia_user_new'@'localhost';
FLUSH PRIVILEGES;

# Verificar
SHOW GRANTS FOR 'ekklesia_user_new'@'localhost';
EXIT;
```

Depois atualize o `DATABASE_URL`:

```
mysql://ekklesia_user_new:senha_forte_aqui@localhost:3306/ekklesia
```

## 🔍 Opção 5: Verificar Arquivo de Configuração

Às vezes a senha pode estar em arquivos de configuração:

```bash
# Verificar se há arquivo .env ou .env.production na VPS
cd /root/ekklesia  # ou onde está sua aplicação
cat .env | grep DATABASE_URL
cat .env.production | grep DATABASE_URL

# Verificar scripts de configuração
grep -r "DATABASE_URL" scripts/
```

## 🛠️ Script Automatizado

Criei um script para facilitar. Execute na VPS:

```bash
# Criar script
cat > /tmp/reset-mysql-password.sh << 'EOF'
#!/bin/bash

echo "🔐 Redefinir Senha do MySQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Qual usuário deseja redefinir? [root]: " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -sp "Nova senha: " NEW_PASSWORD
echo ""

read -sp "Confirme a senha: " CONFIRM_PASSWORD
echo ""

if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    echo "❌ Senhas não coincidem!"
    exit 1
fi

echo ""
echo "Parando MySQL..."
sudo systemctl stop mysql

echo "Iniciando MySQL em modo seguro..."
sudo mysqld_safe --skip-grant-tables --skip-networking &

sleep 3

echo "Redefinindo senha..."
mysql -u root << SQL
USE mysql;
ALTER USER '$MYSQL_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EXIT;
SQL

echo "Parando MySQL em modo seguro..."
sudo pkill mysqld

echo "Iniciando MySQL normalmente..."
sudo systemctl start mysql

echo "✅ Senha redefinida com sucesso!"
echo ""
echo "Teste com: mysql -u $MYSQL_USER -p"
EOF

chmod +x /tmp/reset-mysql-password.sh
/tmp/reset-mysql-password.sh
```

## 📋 Após Redefinir a Senha

### 1. Atualizar DATABASE_URL

Se você redefiniu a senha, precisa atualizar:

**No GitHub Secrets:**
- Acesse: Settings → Secrets → Actions
- Edite `DATABASE_URL` com a nova senha

**Na VPS (se tiver .env):**
```bash
# Editar .env.production
nano .env.production

# Atualizar DATABASE_URL
DATABASE_URL="mysql://usuario:nova_senha@localhost:3306/ekklesia"

# Copiar para .env
cp .env.production .env
```

### 2. Testar Conexão

```bash
# Testar conexão
mysql -u ekklesia_user -p ekklesia
# Digite a nova senha

# Ou testar via Prisma
cd /root/ekklesia
npx prisma db pull
```

### 3. Reiniciar Aplicação

```bash
# Reiniciar PM2
pm2 restart ekklesia

# Verificar logs
pm2 logs ekklesia
```

## 🐛 Troubleshooting

### Erro: "Access denied"

**Causa:** Senha incorreta ou usuário sem permissões

**Solução:**
```sql
-- Verificar usuário existe
SELECT user, host FROM mysql.user WHERE user = 'seu_usuario';

-- Recriar usuário se necessário
DROP USER IF EXISTS 'seu_usuario'@'localhost';
CREATE USER 'seu_usuario'@'localhost' IDENTIFIED BY 'senha';
GRANT ALL PRIVILEGES ON ekklesia.* TO 'seu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Erro: "Can't connect to MySQL server"

**Causa:** MySQL não está rodando

**Solução:**
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### Erro: "Unknown database 'ekklesia'"

**Causa:** Banco de dados não existe

**Solução:**
```sql
CREATE DATABASE ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🔒 Boas Práticas

1. ✅ Use senhas fortes (mínimo 16 caracteres)
2. ✅ Guarde senhas em local seguro (password manager)
3. ✅ Use secrets do GitHub para produção
4. ✅ Rotacione senhas periodicamente
5. ✅ Não commite senhas no código

## 📚 Recursos

- [MySQL Password Reset](https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html)
- [MySQL User Management](https://dev.mysql.com/doc/refman/8.0/en/user-management.html)

---

**Última atualização:** $(date)

