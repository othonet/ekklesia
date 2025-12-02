# Como Criar o Ícone do App

O ícone do app precisa ser criado como uma imagem PNG de **1024x1024 pixels**.

## Opções para Criar o Ícone:

### Opção 1: Usar um Gerador Online (Recomendado)
1. Acesse: https://www.figma.com ou https://www.canva.com
2. Crie um design de 1024x1024 pixels
3. Use o tema de uma igreja com cruz
4. Cores sugeridas: Azul (#007BFF) como cor primária do app
5. Exporte como PNG

### Opção 2: Usar um Gerador de Ícones
1. Acesse: https://www.appicon.co ou https://icon.kitchen
2. Faça upload de uma imagem ou crie um ícone
3. Baixe o ícone de 1024x1024

### Opção 3: Criar Manualmente
1. Use qualquer editor de imagens (Photoshop, GIMP, etc.)
2. Crie uma imagem de 1024x1024 pixels
3. Design sugerido:
   - Fundo: Azul (#007BFF) ou gradiente azul
   - Ícone: Silhueta de igreja com cruz no topo
   - Estilo: Moderno e minimalista
4. Salve como `app_icon.png` e `app_icon_foreground.png` (mesmo arquivo)

## Após Criar o Ícone:

1. Coloque o arquivo `app_icon.png` (1024x1024) em `mobile/assets/images/`
2. Coloque o arquivo `app_icon_foreground.png` (1024x1024) em `mobile/assets/images/`
   (pode ser o mesmo arquivo do app_icon.png)
3. Execute: `flutter pub get`
4. Execute: `flutter pub run flutter_launcher_icons`

Os ícones serão gerados automaticamente para todas as resoluções necessárias!

