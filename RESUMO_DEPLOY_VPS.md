# 🚀 Resumo: Deploy em VPS - O que Fazer

## 📋 Checklist Rápido

### No Servidor (VPS):

1. **Instalar dependências:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx mysql-server
   sudo npm install -g pm2
   ```

2. **Configurar SSL (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d api.seudominio.com.br
   ```

3. **Configurar Nginx** (ver `GUIA_DEPLOY_VPS.md` para configuração completa)

4. **Configurar variáveis de ambiente** (`.env.production`):
   - `APP_URL=https://api.seudominio.com.br`
   - `DATABASE_URL=mysql://...`
   - `JWT_SECRET=` (gerar com `openssl rand -hex 32`)
   - `ALLOWED_ORIGINS=https://seudominio.com.br`

5. **Deploy e iniciar:**
   ```bash
   npm install
   npx prisma migrate deploy
   npm run build
   pm2 start npm --name "ekklesia" -- start
   pm2 save
   ```

### No App Mobile:

1. **Atualizar URL padrão** em `mobile/lib/services/config_service.dart`:
   ```dart
   return 'https://api.seudominio.com.br';  // HTTPS obrigatório!
   ```

2. **Atualizar segurança** em `mobile/android/app/src/main/res/xml/network_security_config.xml`:
   - `cleartextTrafficPermitted="false"` (apenas HTTPS)
   - Adicionar seu domínio

3. **Remover HTTP** de `mobile/android/app/src/main/AndroidManifest.xml`:
   - Remover `android:usesCleartextTraffic="true"`

4. **Build:**
   ```bash
   cd mobile
   flutter clean
   flutter pub get
   flutter build apk --release
   ```

---

## ⚠️ Pontos Críticos

1. **HTTPS é OBRIGATÓRIO** - App mobile não funciona com HTTP em produção
2. **Certificado SSL válido** - Use Let's Encrypt (gratuito)
3. **CORS configurado** - Já está no `next.config.js`, mas verifique
4. **URL no app** - Deve ser `https://` e não `http://`
5. **Firewall** - Liberar portas 80 e 443

---

## 📚 Documentação Completa

- **Guia completo:** `GUIA_DEPLOY_VPS.md`
- **Configuração mobile:** `mobile/CONFIGURACAO_PRODUCAO_VPS.md`

---

## 🆘 Problemas Comuns

### App não conecta
- Verificar se URL está com `https://`
- Verificar se certificado SSL é válido
- Verificar se servidor está rodando (`pm2 status`)

### Erro de certificado
- Verificar se Let's Encrypt está configurado
- Verificar se domínio está correto
- Verificar renovação: `sudo certbot renew --dry-run`

### CORS bloqueado
- Verificar `next.config.js`
- Verificar `ALLOWED_ORIGINS` no `.env`
- Apps mobile não enviam Origin, então CORS deve permitir `*` ou não verificar origem

---

**Dica:** Teste primeiro no navegador acessando `https://api.seudominio.com.br/api/health` antes de testar no app!

