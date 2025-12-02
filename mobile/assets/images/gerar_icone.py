#!/usr/bin/env python3
"""
Script para gerar o ícone do app Ekklesia a partir do SVG.
Requisitos: pip install cairosvg pillow

Execute: python assets/images/gerar_icone.py
"""

try:
    import cairosvg
    from PIL import Image
    import io
    import os
    
    # Caminho dos arquivos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    svg_path = os.path.join(script_dir, 'app_icon.svg')
    png_path = os.path.join(script_dir, 'app_icon.png')
    foreground_path = os.path.join(script_dir, 'app_icon_foreground.png')
    
    print(f"Convertendo {svg_path} para PNG...")
    
    # Converter SVG para PNG (1024x1024)
    png_data = cairosvg.svg2png(url=svg_path, output_width=1024, output_height=1024)
    
    # Salvar como app_icon.png
    with open(png_path, 'wb') as f:
        f.write(png_data)
    print(f"✅ Ícone criado: {png_path}")
    
    # Criar versão foreground (sem fundo, apenas o ícone)
    # Abrir a imagem
    img = Image.open(io.BytesIO(png_data))
    
    # Converter para RGBA se necessário
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Salvar como foreground também
    img.save(foreground_path, 'PNG')
    print(f"✅ Foreground criado: {foreground_path}")
    
    print("\n✅ Ícones gerados com sucesso!")
    print("Agora execute: flutter pub get")
    print("Depois execute: flutter pub run flutter_launcher_icons")
    
except ImportError:
    print("❌ Bibliotecas necessárias não instaladas.")
    print("Instale com: pip install cairosvg pillow")
    print("\nOu use uma das opções:")
    print("1. Use um gerador online: https://www.appicon.co")
    print("2. Use o arquivo SVG em um editor de imagens")
    print("3. Veja instruções em: assets/images/CRIAR_ICONE.md")

