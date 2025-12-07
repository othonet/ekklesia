# 📱 Guia Completo: Emulador Android

Passo a passo para usar o emulador Android com o app Ekklesia.

## 🎯 Passo 1: Verificar Emuladores Disponíveis

Primeiro, vamos ver quais emuladores você já tem configurados:

```powershell
flutter emulators
```

Se não aparecer nenhum, você precisa criar um (veja Passo 2).

---

## 🚀 Passo 2: Criar um Emulador (Se Não Tiver)

### Opção A: Via Android Studio (Recomendado - Mais Fácil)

1. **Abrir Android Studio**
   - Abra o Android Studio

2. **Abrir Device Manager**
   - No menu superior: `Tools` → `Device Manager`
   - Ou clique no ícone de dispositivo na barra de ferramentas

3. **Criar Novo Dispositivo**
   - Clique em `Create Device` (ou `+` no canto superior)
   
4. **Escolher Hardware**
   - Selecione um dispositivo (recomendo: **Pixel 5** ou **Pixel 6**)
   - Clique em `Next`

5. **Escolher Imagem do Sistema**
   - Escolha uma versão do Android (recomendo: **Android 13 (Tiramisu)** ou mais recente)
   - Se não tiver baixado, clique em `Download` ao lado da versão
   - Aguarde o download (pode demorar alguns minutos)
   - Clique em `Next`

6. **Configurar AVD**
   - Nome: Deixe o padrão ou escolha um nome (ex: "Pixel_5_API_33")
   - Verifique as configurações
   - Clique em `Finish`

### Opção B: Via Linha de Comando

```powershell
# Listar imagens disponíveis
flutter emulators --create

# Ou usar o AVD Manager diretamente
# No Android Studio: Tools → AVD Manager
```

---

## ▶️ Passo 3: Iniciar o Emulador

### Opção A: Via Android Studio

1. Abra o **Device Manager** (`Tools` → `Device Manager`)
2. Encontre o emulador que você criou
3. Clique no botão **▶️ (Play)** ao lado do emulador
4. Aguarde o emulador iniciar completamente (pode demorar 1-2 minutos na primeira vez)

### Opção B: Via Linha de Comando

```powershell
# Listar emuladores
flutter emulators

# Iniciar um emulador específico
flutter emulators --launch <nome_do_emulador>

# Exemplo:
flutter emulators --launch Pixel_5_API_33
```

### Opção C: Deixar o Flutter Iniciar Automaticamente

O Flutter pode iniciar o emulador automaticamente quando você executar o app:

```powershell
cd mobile
flutter run
```

Se houver apenas um emulador, ele será iniciado automaticamente.

---

## 🔧 Passo 4: Configurar URL da API para Emulador

O emulador Android usa um endereço especial para acessar o `localhost` do seu computador.

**Edite o arquivo:** `mobile/lib/config/api_config.dart`

```dart
class ApiConfig {
  // Para emulador Android, use 10.0.2.2 (não localhost!)
  static const String baseUrl = 'http://10.0.2.2:3000';
  
  // ... resto do código
}
```

**Por quê `10.0.2.2`?**
- O emulador Android roda em uma rede virtual
- `10.0.2.2` é o endereço especial que aponta para o `localhost` do seu computador
- `localhost` ou `127.0.0.1` não funcionam no emulador!

---

## 🎮 Passo 5: Executar o App no Emulador

### Verificar se o Emulador Está Rodando

```powershell
flutter devices
```

Você deve ver algo como:
```
sdk gphone64 arm64 (mobile) • emulator-5554 • android-arm64  • Android 13 (API 33)
```

### Executar o App

```powershell
cd mobile
flutter run
```

O Flutter vai:
1. Detectar o emulador automaticamente
2. Compilar o app
3. Instalar no emulador
4. Iniciar o app

**Primeira vez pode demorar alguns minutos!**

---

## 🔍 Passo 6: Verificar se Está Funcionando

### 1. Verificar se o Servidor Está Rodando

Em outro terminal, certifique-se de que o servidor Next.js está rodando:

```powershell
npm run dev
```

O servidor deve estar acessível em `http://localhost:3000`

### 2. Testar no Emulador

1. Abra o app no emulador
2. Tente fazer login
3. Verifique os logs no terminal do Flutter

### 3. Verificar Logs

No terminal onde você executou `flutter run`, você verá:
- Logs do app
- Erros (se houver)
- Requisições de rede

---

## 🛠️ Troubleshooting (Problemas Comuns)

### ❌ "No devices found"

**Solução:**
1. Certifique-se de que o emulador está rodando
2. Verifique com: `flutter devices`
3. Se não aparecer, reinicie o emulador

### ❌ "Connection refused" ou "Network error"

**Solução:**
1. Verifique se o servidor está rodando: `npm run dev`
2. Verifique se a URL está correta: `http://10.0.2.2:3000` (não `localhost`!)
3. Teste no navegador do emulador: Abra o Chrome no emulador e acesse `http://10.0.2.2:3000`

### ❌ Emulador muito lento

**Solução:**
1. Feche outros programas pesados
2. Aumente a RAM do emulador:
   - Android Studio → Device Manager
   - Clique em ✏️ (Edit) no emulador
   - Aumente a RAM (recomendo 2048 MB ou mais)
   - Salve e reinicie o emulador

### ❌ "HAXM is not installed" (Intel)

**Solução:**
1. Instale o HAXM (Intel Hardware Accelerated Execution Manager)
2. Ou use um emulador com Hypervisor diferente

### ❌ Emulador não inicia

**Solução:**
1. Verifique se a virtualização está habilitada no BIOS
2. Verifique se o Hyper-V está desabilitado (Windows)
3. Tente criar um novo emulador com menos recursos

---

## 📋 Checklist Rápido

Antes de executar o app:

- [ ] Android Studio instalado
- [ ] Emulador criado no Device Manager
- [ ] Emulador iniciado e rodando
- [ ] Servidor Next.js rodando (`npm run dev`)
- [ ] URL da API configurada: `http://10.0.2.2:3000`
- [ ] Executar: `cd mobile` → `flutter run`

---

## 🚀 Comandos Úteis

```powershell
# Ver dispositivos conectados
flutter devices

# Ver emuladores disponíveis
flutter emulators

# Iniciar emulador específico
flutter emulators --launch <nome>

# Executar app
cd mobile
flutter run

# Hot reload (quando app estiver rodando)
# Pressione 'r' no terminal do Flutter

# Hot restart
# Pressione 'R' no terminal do Flutter

# Ver logs detalhados
flutter run --verbose

# Limpar e reconstruir
flutter clean
flutter pub get
flutter run
```

---

## 💡 Dicas

1. **Deixe o emulador rodando** - Não precisa fechar toda vez, apenas pause quando não estiver usando
2. **Use Snapshots** - Crie um snapshot do emulador após a primeira configuração para iniciar mais rápido
3. **Hot Reload** - Quando o app estiver rodando, pressione `r` no terminal para recarregar mudanças instantaneamente
4. **Performance** - Se o emulador estiver lento, reduza a resolução ou use um dispositivo menor
5. **Primeira vez** - A primeira execução sempre demora mais (compilação, instalação, etc.)

---

## 🎯 Próximos Passos

Depois que o app estiver rodando no emulador:

1. Teste todas as funcionalidades
2. Verifique se a API está respondendo corretamente
3. Teste login, navegação, etc.
4. Use Hot Reload para testar mudanças rapidamente

**Pronto para usar o emulador!** 🎉

