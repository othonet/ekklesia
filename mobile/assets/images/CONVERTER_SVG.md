# Converter SVG para PNG

## Método 1: Online (Mais Fácil) ⭐

1. Acesse: https://convertio.co/svg-png/
2. Faça upload do arquivo `app_icon.svg`
3. Configure:
   - **Largura:** 1024
   - **Altura:** 1024
4. Clique em "Converter"
5. Baixe o arquivo PNG
6. Renomeie para `app_icon.png`
7. Copie o mesmo arquivo e renomeie para `app_icon_foreground.png`

## Método 2: Usando Python

Se você tem Python instalado:

```bash
pip install cairosvg pillow
python assets/images/gerar_icone.py
```

## Método 3: Usando Inkscape (Windows)

1. Baixe e instale Inkscape: https://inkscape.org/
2. Abra o arquivo `app_icon.svg`
3. Vá em: File > Export PNG Image
4. Configure:
   - **Width:** 1024
   - **Height:** 1024
5. Salve como `app_icon.png`
6. Copie e renomeie para `app_icon_foreground.png`

## Método 4: Usando Node.js

Se você tem Node.js instalado:

```bash
npm install -g svg2png-cli
svg2png app_icon.svg --output app_icon.png --width 1024 --height 1024
```

## Após Converter

1. Coloque os arquivos em `mobile/assets/images/`:
   - `app_icon.png`
   - `app_icon_foreground.png` (pode ser o mesmo arquivo)

2. Execute:
   ```bash
   cd mobile
   flutter pub get
   flutter pub run flutter_launcher_icons
   ```

