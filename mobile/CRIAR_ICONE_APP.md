# 🎨 Criar Ícone do App Ekklesia

## 📋 Resumo Rápido

1. **Criar/Converter o ícone** para PNG 1024x1024
2. **Colocar** em `mobile/assets/images/app_icon.png` e `app_icon_foreground.png`
3. **Executar:** `flutter pub get` e `flutter pub run flutter_launcher_icons`

## 🚀 Método Mais Rápido (Recomendado)

### Opção A: Converter o SVG fornecido

1. **Acesse:** https://convertio.co/svg-png/ ou https://cloudconvert.com/svg-to-png
2. **Faça upload** do arquivo: `mobile/assets/images/app_icon.svg`
3. **Configure:**
   - Largura: **1024**
   - Altura: **1024**
4. **Baixe** o PNG
5. **Renomeie** para `app_icon.png`
6. **Copie** o mesmo arquivo e renomeie para `app_icon_foreground.png`
7. **Coloque ambos** em `mobile/assets/images/`

### Opção B: Usar Gerador Online

1. **Acesse:** https://www.appicon.co
2. **Crie ou faça upload** de uma imagem
3. **Baixe** o ícone de 1024x1024
4. **Renomeie** para `app_icon.png` e `app_icon_foreground.png`
5. **Coloque** em `mobile/assets/images/`

### Opção C: Criar Manualmente

1. Use **Figma**, **Canva**, **Photoshop** ou **GIMP**
2. Crie uma imagem de **1024x1024 pixels**
3. **Design sugerido:**
   - Fundo: Azul (#007BFF) ou gradiente azul
   - Ícone: Igreja com cruz (como no SVG fornecido)
   - Estilo: Moderno e minimalista
4. Exporte como PNG
5. Salve como `app_icon.png` e `app_icon_foreground.png`

## ✅ Após Criar os Ícones

Execute os seguintes comandos:

```bash
cd mobile
flutter pub get
flutter pub run flutter_launcher_icons
```

Isso irá gerar automaticamente todos os tamanhos de ícones necessários para Android!

## 📁 Estrutura de Arquivos

```
mobile/
  assets/
    images/
      app_icon.png          ← Ícone principal (1024x1024)
      app_icon_foreground.png ← Foreground (1024x1024)
      app_icon.svg          ← SVG original (referência)
```

## 🔍 Verificação

Após gerar os ícones, verifique se foram criados em:
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

## 🎨 Design do Ícone

O ícone deve representar:
- **Tema:** Igreja/Cristianismo
- **Cores:** Azul (#007BFF) - cor primária do app
- **Estilo:** Moderno, limpo, minimalista
- **Elementos:** Igreja com cruz no topo

O arquivo SVG fornecido (`app_icon.svg`) contém um design de referência que você pode usar como base.

