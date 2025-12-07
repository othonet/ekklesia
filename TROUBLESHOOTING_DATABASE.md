# 🔧 Troubleshooting - Erro de Conexão com Banco de Dados

## ❌ Erro Encontrado

```
Can't reach database server at `localhost:3306`
```

Este erro significa que o Prisma não consegue se conectar ao MySQL.

---

## ✅ Soluções

### 1. Verificar se o MySQL está rodando

#### Windows
```powershell
# Verificar se o serviço MySQL está rodando
Get-Service -Name MySQL*

# Se não estiver rodando, iniciar:
Start-Service -Name MySQL80
# ou
Start-Service -Name MySQL
```

#### Linux/Mac
```bash
# Verificar status
sudo systemctl status mysql
# ou
sudo service mysql status

# Iniciar se necessário
sudo systemctl start mysql
# ou
sudo service mysql start
```

### 2. Verificar a configuração do `.env`

Crie ou verifique o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/ekklesia"
```

**Exemplos:**
```env
# Se usar root sem senha
DATABASE_URL="mysql://root@localhost:3306/ekklesia"

# Se usar root com senha
DATABASE_URL="mysql://root:suasenha@localhost:3306/ekklesia"

# Se usar outro usuário
DATABASE_URL="mysql://usuario:senha@localhost:3306/ekklesia"
```

### 3. Verificar se o banco de dados existe

Conecte-se ao MySQL e verifique:

```sql
-- Conectar ao MySQL
mysql -u root -p

-- Listar bancos de dados
SHOW DATABASES;

-- Se o banco 'ekklesia' não existir, criar:
CREATE DATABASE ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Testar conexão manualmente

```bash
# Testar conexão
mysql -u root -p -h localhost -P 3306

# Ou usando a URL completa
mysql -u usuario -p -h localhost -P 3306 ekklesia
```

### 5. Verificar porta do MySQL

O MySQL pode estar rodando em outra porta. Verifique:

```bash
# Windows
netstat -an | findstr 3306

# Linux/Mac
netstat -an | grep 3306
# ou
lsof -i :3306
```

Se estiver em outra porta, atualize o `.env`:
```env
DATABASE_URL="mysql://usuario:senha@localhost:PORTA/ekklesia"
```

### 6. Verificar firewall

Certifique-se de que o firewall não está bloqueando a porta 3306.

### 7. Verificar se o Prisma Client está atualizado

```bash
# Regenerar Prisma Client
npm run db:generate

# Ou
npx prisma generate
```

### 8. Aplicar migrações

Se o banco existe mas as tabelas não foram criadas:

```bash
# Aplicar schema
npm run db:push

# Ou criar migração
npm run db:migrate
```

---

## 🚀 Passo a Passo Completo

### 1. Instalar MySQL (se não tiver)

**Windows:**
- Baixe o MySQL Installer: https://dev.mysql.com/downloads/installer/
- Instale e configure

**Linux:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**Mac:**
```bash
brew install mysql
brew services start mysql
```

### 2. Criar banco de dados

```sql
CREATE DATABASE ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar `.env`

```env
DATABASE_URL="mysql://root:suasenha@localhost:3306/ekklesia"
JWT_SECRET="seu-jwt-secret-aqui"
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Aplicar schema

```bash
# Gerar Prisma Client
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

### 5. Testar

```bash
# Iniciar servidor
npm run dev

# Acessar http://localhost:3000
```

---

## 🔍 Verificações Rápidas

Execute estas verificações na ordem:

1. ✅ MySQL está rodando?
2. ✅ Arquivo `.env` existe?
3. ✅ `DATABASE_URL` está correto?
4. ✅ Banco de dados `ekklesia` existe?
5. ✅ Credenciais estão corretas?
6. ✅ Porta 3306 está acessível?
7. ✅ Prisma Client foi gerado?

---

## 💡 Dicas

- **Senha com caracteres especiais:** Use URL encoding ou coloque entre aspas
- **Host diferente:** Se MySQL estiver em outro servidor, use o IP/hostname
- **Porta diferente:** Verifique qual porta o MySQL está usando
- **Usuário sem senha:** Use `mysql://usuario@localhost:3306/ekklesia`

---

## 🆘 Ainda com problemas?

1. Verifique os logs do MySQL
2. Verifique se há outros processos usando a porta 3306
3. Tente conectar usando um cliente MySQL (MySQL Workbench, DBeaver, etc.)
4. Verifique as permissões do usuário MySQL

---

## 📝 Exemplo de `.env` Completo

```env
# Database
DATABASE_URL="mysql://root:senha123@localhost:3306/ekklesia"

# JWT
JWT_SECRET=seu-jwt-secret-forte-aqui
JWT_EXPIRES_IN=7d

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-nextauth-secret-aqui

# LGPD
ENCRYPTION_KEY=sua-chave-de-criptografia-32-bytes

# Application
APP_URL=http://localhost:3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=
```

