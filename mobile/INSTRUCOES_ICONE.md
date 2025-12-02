# 🎨 Instruções para Criar o Ícone do App

## ✅ Status Atual

- ✅ Pacote `flutter_launcher_icons` instalado
- ✅ Configuração no `pubspec.yaml` pronta
- ✅ SVG de referência criado (`assets/images/app_icon.svg`)
- ⏳ **Falta:** Converter SVG para PNG

## 🚀 Passos Finais (5 minutos)

### 1. Converter SVG para PNG

**Opção A - Online (Mais Rápido):**

1. Acesse: **https://convertio.co/svg-png/** ou **https://cloudconvert.com/svg-to-png**
2. Faça upload do arquivo: `mobile/assets/images/app_icon.svg`
3. Configure:
   - **Largura:** 1024
   - **Altura:** 1024
4. Clique em **"Converter"**
5. Baixe o arquivo PNG
6. Renomeie para `app_icon.png`
7. **Copie** o mesmo arquivo e renomeie para `app_icon_foreground.png`

**Opção B - Usando Inkscape (se tiver instalado):**

```bash
inkscape app_icon.svg --export-filename=app_icon.png --export-width=1024 --export-height=1024
```

### 2. Colocar os Arquivos

Coloque os dois arquivos PNG em:
```
mobile/assets/images/
  ├── app_icon.png          ← Ícone principal (1024x1024)
  └── app_icon_foreground.png ← Foreground (1024x1024)
```

**Nota:** Os dois arquivos podem ser idênticos. O `app_icon_foreground.png` é usado para o adaptive icon do Android.

### 3. Gerar os Ícones

Execute os comandos:

```bash
cd mobile
flutter pub run flutter_launcher_icons
```

Isso irá gerar automaticamente todos os tamanhos necessários:
- mipmap-hdpi (72x72)
- mipmap-mdpi (48x48)
- mipmap-xhdpi (96x96)
- mipmap-xxhdpi (144x144)
- mipmap-xxxhdpi (192x192)
- Adaptive icon (foreground + background)

### 4. Verificar

Após executar o comando, verifique se os ícones foram criados em:
```
android/app/src/main/res/
  ├── mipmap-hdpi/ic_launcher.png
  ├── mipmap-mdpi/ic_launcher.png
  ├── mipmap-xhdpi/ic_launcher.png
  ├── mipmap-xxhdpi/ic_launcher.png
  ├── mipmap-xxxhdpi/ic_launcher.png
  └── mipmap-anydpi-v26/ic_launcher.xml (adaptive icon)
```

## 🎨 Design do Ícone

O SVG fornecido contém:
- **Fundo:** Gradiente azul (#007BFF → #0056B3)
- **Ícone:** Igreja branca com cruz no topo
- **Estilo:** Moderno e minimalista

Você pode editar o SVG antes de converter, se desejar personalizar.

## 📝 Resumo dos Comandos

```bash
# 1. Converter SVG para PNG (online ou usando ferramenta)
# 2. Colocar app_icon.png e app_icon_foreground.png em mobile/assets/images/

# 3. Gerar ícones
cd mobile
flutter pub run flutter_launcher_icons

# 4. Build do APK (depois que os ícones estiverem prontos)
flutter build apk --release
```

## ❓ Problemas Comuns

**Erro: "Image path does not exist"**
- Verifique se os arquivos `app_icon.png` e `app_icon_foreground.png` estão em `mobile/assets/images/`

**Erro: "Invalid image dimensions"**
- Certifique-se de que as imagens são exatamente 1024x1024 pixels

**Ícones não aparecem no app**
- Execute `flutter clean` e depois `flutter pub run flutter_launcher_icons` novamente
- Reinstale o app no dispositivo

