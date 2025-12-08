# 🚀 Scripts de Provisionamento VPS

Scripts automatizados para provisionar e fazer deploy da aplicação Ekklesia em uma VPS.

## 📋 Pré-requisitos

- VPS com acesso root/SSH
- Domínio configurado (opcional para início, necessário para SSL)
- Acesso à internet

## 🔧 Ordem de Execução

Execute os scripts na seguinte ordem:

### 1. Provisionamento Inicial

Instala todas as dependências do sistema (Node.js, Nginx, MySQL, PM2, etc.)

```bash
sudo ./scripts/vps/provisionar-vps.sh
```

### 2. Configurar Banco de Dados

Cria o banco de dados e usuário MySQL

```bash
sudo ./scripts/vps/configurar-banco.sh
```

### 3. Configurar Nginx

Cria a configuração do Nginx como proxy reverso

```bash
sudo ./scripts/vps/configurar-nginx.sh seu-dominio.com
```

### 4. Configurar SSL (Opcional mas Recomendado)

Obtém certificado SSL gratuito do Let's Encrypt

```bash
sudo ./scripts/vps/configurar-ssl.sh seu-dominio.com
```

**⚠️ Importante:** O domínio deve estar apontando para o IP da VPS antes de executar este script.

### 5. Gerar Variáveis de Ambiente

Gera o arquivo `.env.production` com todas as chaves necessárias

```bash
./scripts/vps/gerar-env-producao.sh
```

### 6. Deploy da Aplicação

Faz o build e inicia a aplicação com PM2

```bash
./scripts/vps/deploy.sh
```

## 📝 Configuração Manual (Alternativa)

Se preferir configurar manualmente, siga o guia completo em `GUIA_DEPLOY_VPS.md`.

## 🔍 Verificação

Após o deploy, verifique:

```bash
# Status da aplicação
pm2 status

# Logs da aplicação
pm2 logs ekklesia

# Testar endpoint
curl http://localhost:3000

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

## 🔄 Atualização

Para atualizar a aplicação:

```bash
# Fazer pull das mudanças
git pull

# Reinstalar dependências (se necessário)
npm ci

# Executar novas migrações
npx prisma migrate deploy

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart ekklesia
```

## 🛠️ Troubleshooting

### Aplicação não inicia

```bash
# Ver logs
pm2 logs ekklesia

# Verificar variáveis de ambiente
cat .env.production

# Verificar banco de dados
npx prisma studio
```

### Nginx não funciona

```bash
# Verificar configuração
sudo nginx -t

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL não funciona

```bash
# Verificar certificado
sudo certbot certificates

# Renovar manualmente (se necessário)
sudo certbot renew
```

## 📚 Documentação Adicional

- `GUIA_DEPLOY_VPS.md` - Guia completo de deploy
- `README.md` - Documentação geral do projeto

