# 🚀 Guia Rápido de Deploy na VPS

Este guia fornece instruções rápidas para provisionar a aplicação Ekklesia em uma VPS.

## ⚡ Deploy Rápido (Recomendado)

Execute o script de deploy completo que automatiza todo o processo:

```bash
./scripts/vps/deploy-completo.sh
```

O script irá guiá-lo através de todos os passos necessários.

## 📋 Deploy Manual Passo a Passo

Se preferir fazer manualmente ou entender cada etapa:

### 1. Provisionamento Inicial

Instala Node.js, Nginx, MySQL, PM2 e outras dependências:

```bash
sudo ./scripts/vps/provisionar-vps.sh
```

### 2. Configurar Banco de Dados

Cria o banco de dados e usuário MySQL:

```bash
sudo ./scripts/vps/configurar-banco.sh
```

Você será solicitado a fornecer:
- Nome do banco de dados
- Nome do usuário
- Senha do usuário
- Senha root do MySQL

### 3. Configurar Nginx

Configura o Nginx como proxy reverso:

```bash
sudo ./scripts/vps/configurar-nginx.sh seu-dominio.com
```

### 4. Configurar SSL (Recomendado)

Obtém certificado SSL gratuito do Let's Encrypt:

```bash
sudo ./scripts/vps/configurar-ssl.sh seu-dominio.com
```

**⚠️ Importante:** O domínio deve estar apontando para o IP da VPS antes de executar este passo.

### 5. Gerar Variáveis de Ambiente

Gera o arquivo `.env.production` com todas as chaves necessárias:

```bash
./scripts/vps/gerar-env-producao.sh
```

Você será solicitado a fornecer:
- Domínio da aplicação
- DATABASE_URL (ou será carregada do passo 2)

### 6. Deploy da Aplicação

Faz o build e inicia a aplicação:

```bash
./scripts/vps/deploy.sh
```

## 🔍 Verificação

Após o deploy, verifique se tudo está funcionando:

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs ekklesia

# Testar localmente
curl http://localhost:3000

# Testar via domínio (se configurado)
curl https://seu-dominio.com
```

## 🔄 Atualizar Aplicação

Para atualizar a aplicação após mudanças no código:

```bash
# Opção 1: Script automatizado
./scripts/vps/deploy-completo.sh
# Escolha opção 3

# Opção 2: Manual
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart ekklesia
```

## 🛠️ Comandos Úteis

### PM2 (Gerenciador de Processos)

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs ekklesia

# Monitorar recursos
pm2 monit

# Reiniciar
pm2 restart ekklesia

# Parar
pm2 stop ekklesia

# Iniciar
pm2 start ekklesia

# Deletar
pm2 delete ekklesia
```

### Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Ver status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Banco de Dados

```bash
# Acessar MySQL
mysql -u ekklesia_user -p ekklesia

# Executar migrações
npx prisma migrate deploy

# Abrir Prisma Studio (interface visual)
npx prisma studio
```

### SSL (Let's Encrypt)

```bash
# Ver certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Testar renovação automática
sudo certbot renew --dry-run
```

## 🐛 Troubleshooting

### Aplicação não inicia

1. Verifique os logs:
   ```bash
   pm2 logs ekklesia
   ```

2. Verifique as variáveis de ambiente:
   ```bash
   cat .env.production
   ```

3. Verifique a conexão com o banco:
   ```bash
   npx prisma studio
   ```

### Erro 502 Bad Gateway

1. Verifique se a aplicação está rodando:
   ```bash
   pm2 status
   ```

2. Verifique se a porta 3000 está acessível:
   ```bash
   curl http://localhost:3000
   ```

3. Verifique os logs do Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Erro de conexão com banco de dados

1. Verifique se o MySQL está rodando:
   ```bash
   sudo systemctl status mysql
   ```

2. Teste a conexão:
   ```bash
   mysql -u ekklesia_user -p ekklesia
   ```

3. Verifique a DATABASE_URL no `.env.production`

### Certificado SSL não funciona

1. Verifique se o domínio está apontando para o servidor:
   ```bash
   dig seu-dominio.com
   ```

2. Verifique o certificado:
   ```bash
   sudo certbot certificates
   ```

3. Renove o certificado se necessário:
   ```bash
   sudo certbot renew
   ```

## 📚 Documentação Adicional

- `GUIA_DEPLOY_VPS.md` - Guia completo e detalhado
- `scripts/vps/README.md` - Documentação dos scripts
- `README.md` - Documentação geral do projeto

## 🔐 Segurança

Após o deploy, certifique-se de:

- [ ] Alterar senhas padrão do banco de dados
- [ ] Alterar credenciais padrão do sistema (admin@ekklesia.com)
- [ ] Configurar backup automático do banco de dados
- [ ] Configurar monitoramento e alertas
- [ ] Manter o sistema atualizado
- [ ] Configurar firewall adequadamente
- [ ] Revisar permissões de arquivos

## 📞 Suporte

Em caso de problemas, consulte:
- Logs da aplicação: `pm2 logs ekklesia`
- Logs do Nginx: `/var/log/nginx/error.log`
- Documentação completa: `GUIA_DEPLOY_VPS.md`

