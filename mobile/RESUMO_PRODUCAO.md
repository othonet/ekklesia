# 📱 Resumo Rápido - Configuração para Produção

## ✅ Checklist Essencial

### 1. Servidor Next.js

- [ ] **HTTPS configurado** - Certificado SSL válido (Let's Encrypt recomendado)
- [ ] **URL de produção** - Ex: `https://api.suaigreja.com`
- [ ] **Variáveis de ambiente** configuradas no `.env`:
  ```env
  NODE_ENV=production
  APP_URL=https://api.suaigreja.com
  ALLOWED_ORIGINS=https://suaigreja.com,https://app.suaigreja.com
  ```
- [ ] **CORS configurado** - Apenas domínios permitidos (não usar `*`)

### 2. App Flutter

- [ ] **URL padrão atualizada** em `config_service.dart`:
  ```dart
  static const String _defaultApiUrl = 'https://api.suaigreja.com';
  ```
- [ ] **Network Security Config** - Apenas HTTPS permitido:
  ```xml
  <base-config cleartextTrafficPermitted="false">
  ```
- [ ] **AndroidManifest** - Remover `usesCleartextTraffic="true"`
- [ ] **APK assinado** - Usar keystore para assinar o APK

### 3. Build e Deploy

```bash
# Servidor
npm run build
npm start

# App
cd mobile
flutter clean
flutter pub get
flutter build apk --release
```

---

## 🔐 Segurança

1. **HTTPS obrigatório** - Nunca use HTTP em produção
2. **CORS restritivo** - Apenas domínios específicos
3. **Certificados válidos** - Verificar expiração regularmente
4. **Senhas fortes** - JWT_SECRET, ENCRYPTION_KEY, etc.

---

## 📚 Documentação Completa

Consulte `CONFIGURACAO_PRODUCAO.md` para guia detalhado.

