# Como Gerar o APK do App Ekklesia

## Pré-requisitos

1. **Flutter instalado e configurado** ✅ (já verificado)
2. **Android SDK instalado** ✅ (já verificado)
3. **Java JDK instalado** (necessário para compilar)

## Passos para Gerar o APK

### 1. Navegar para o diretório do projeto mobile

```bash
cd mobile
```

### 2. Verificar se há dispositivos conectados (opcional)

```bash
flutter devices
```

### 3. Limpar o projeto (recomendado antes de gerar o APK)

```bash
flutter clean
flutter pub get
```

### 4. Gerar o APK de Debug (para testes)

```bash
flutter build apk --debug
```

O APK será gerado em: `build/app/outputs/flutter-apk/app-debug.apk`

### 5. Gerar o APK de Release (para distribuição)

```bash
flutter build apk --release
```

O APK será gerado em: `build/app/outputs/flutter-apk/app-release.apk`

### 6. Gerar APK Split por ABI (recomendado - menor tamanho)

Gera APKs separados para cada arquitetura (arm64-v8a, armeabi-v7a, x86_64):

```bash
flutter build apk --split-per-abi --release
```

Os APKs serão gerados em:
- `build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk`
- `build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`
- `build/app/outputs/flutter-apk/app-x86_64-release.apk`

## Configurações Importantes

### Application ID (Package Name)

O Application ID atual é: `com.example.mobile`

**⚠️ IMPORTANTE:** Antes de publicar, você deve alterar para um ID único, por exemplo:
- `com.ekklesia.members`
- `com.suaigreja.ekklesia.members`

Para alterar, edite o arquivo: `android/app/build.gradle.kts`

```kotlin
applicationId = "com.ekklesia.members"
```

### Nome do App

O nome do app já está configurado como "Ekklesia - Membros" no AndroidManifest.xml.

### Versão do App

A versão atual é: `1.0.0+1`

Para alterar, edite o arquivo: `mobile/pubspec.yaml`

```yaml
version: 1.0.0+1  # Formato: versionName+versionCode
```

## Assinatura do APK (Para Produção)

Para distribuir o app na Google Play Store, você precisa assinar o APK com uma chave de assinatura.

### Criar uma chave de assinatura:

```bash
keytool -genkey -v -keystore ~/ekklesia-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ekklesia
```

### Configurar assinatura no build.gradle.kts:

1. Crie o arquivo `android/key.properties`:
```properties
storePassword=sua_senha
keyPassword=sua_senha
keyAlias=ekklesia
storeFile=C:\\Users\\Othon Felipe\\ekklesia-key.jks
```

2. Atualize `android/app/build.gradle.kts` para usar a chave.

## Comandos Rápidos

### APK Debug (testes)
```bash
cd mobile
flutter build apk --debug
```

### APK Release (distribuição)
```bash
cd mobile
flutter build apk --release
```

### APK Release Split (recomendado)
```bash
cd mobile
flutter build apk --split-per-abi --release
```

## Localização do APK Gerado

Após a compilação, o APK estará em:
- **Debug:** `mobile/build/app/outputs/flutter-apk/app-debug.apk`
- **Release:** `mobile/build/app/outputs/flutter-apk/app-release.apk`
- **Split:** `mobile/build/app/outputs/flutter-apk/app-[abi]-release.apk`

## Instalar o APK no Dispositivo

### Via ADB (Android Debug Bridge):
```bash
flutter install
```

### Ou manualmente:
1. Copie o APK para o dispositivo Android
2. Abra o arquivo no dispositivo
3. Permita instalação de fontes desconhecidas se solicitado
4. Instale o app

## Troubleshooting

### Erro: "Gradle build failed"
- Execute `flutter clean` e tente novamente
- Verifique se o Android SDK está atualizado

### Erro: "SDK location not found"
- Verifique se o arquivo `android/local.properties` existe e contém:
  ```
  sdk.dir=C:\\Users\\Othon Felipe\\AppData\\Local\\Android\\Sdk
  ```

### APK muito grande
- Use `--split-per-abi` para gerar APKs menores
- Remova assets não utilizados
- Use ProGuard para ofuscar e otimizar o código

