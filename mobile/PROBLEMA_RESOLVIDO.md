# ✅ Problema Resolvido - Cleartext Traffic

## 🔍 Problema Identificado

O Android **bloqueia conexões HTTP** (cleartext traffic) por padrão a partir do Android 9 (API 28).

Como estamos usando `http://192.168.1.161:3000` (não HTTPS), o Android estava bloqueando todas as requisições do app.

## ✅ Solução Aplicada

### 1. Configuração no AndroidManifest.xml

Adicionado:
- `android:usesCleartextTraffic="true"` - Permite conexões HTTP
- `android:networkSecurityConfig="@xml/network_security_config"` - Configuração de segurança de rede

### 2. Arquivo network_security_config.xml

Criado arquivo de configuração de segurança de rede permitindo:
- Conexões HTTP para IPs locais (192.168.x.x)
- localhost e 127.0.0.1
- 10.0.2.2 (emulador Android)

### 3. Timeouts Aumentados

Aumentados os timeouts do Dio para 30 segundos para evitar timeouts prematuros.

## 🔨 Próximos Passos

**Você PRECISA fazer rebuild do APK** para que essas mudanças tenham efeito:

```bash
cd mobile
flutter clean
flutter pub get
flutter build apk --release
```

Depois:
1. Desinstale o app antigo
2. Instale o novo APK
3. Tente fazer login

## ✅ Verificação

Após instalar o novo APK:

1. **Abra o app**
2. **Tente fazer login**
3. **Deve funcionar agora!**

## 📝 O que foi alterado

1. `mobile/android/app/src/main/AndroidManifest.xml`
   - Adicionado `usesCleartextTraffic="true"`
   - Adicionado `networkSecurityConfig`

2. `mobile/android/app/src/main/res/xml/network_security_config.xml` (novo)
   - Configuração de segurança de rede

3. `mobile/lib/services/auth_service.dart`
   - Timeouts aumentados para 30 segundos

## 🎯 Por que isso resolve?

O Android 9+ bloqueia conexões HTTP por segurança. Ao permitir cleartext traffic especificamente para IPs locais, o app consegue se conectar ao servidor local sem problemas de segurança.

**Nota:** Em produção, use HTTPS para maior segurança!

