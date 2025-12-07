# 🚀 Iniciar Emulador Android - Passo a Passo Rápido

Você já tem um emulador configurado! Siga estes passos:

## ✅ Passo 1: Iniciar o Emulador

### Opção A: Via Flutter (Automático)
```powershell
cd mobile
flutter emulators --launch Smartphone_Virtual
```

### Opção B: Via Android Studio
1. Abra o Android Studio
2. Vá em: `Tools` → `Device Manager`
3. Encontre "Smartphone Virtual"
4. Clique no botão ▶️ (Play)

**Aguarde o emulador iniciar completamente** (pode demorar 1-2 minutos)

---

## ✅ Passo 2: Verificar se o Emulador Está Rodando

```powershell
flutter devices
```

Você deve ver algo como:
```
Smartphone_Virtual (mobile) • emulator-5554 • android-arm64
```

---

## ✅ Passo 3: Configurar URL da API para Emulador

O emulador precisa usar `10.0.2.2` em vez de `localhost` ou IP da rede.

**Edite:** `mobile/lib/services/config_service.dart`

Altere a linha 5:
```dart
static const String _defaultApiUrl = 'http://10.0.2.2:3000';
```

**Por quê?**
- `10.0.2.2` é o endereço especial do emulador que aponta para o `localhost` do seu PC
- `localhost` ou `192.168.x.x` não funcionam no emulador!

---

## ✅ Passo 4: Iniciar o Servidor

Em um terminal separado:
```powershell
npm run dev
```

Certifique-se de que está rodando em `http://localhost:3000`

---

## ✅ Passo 5: Executar o App

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

## 🎮 Comandos Úteis Durante o Desenvolvimento

Quando o app estiver rodando no emulador:

- **`r`** - Hot reload (recarrega mudanças rapidamente)
- **`R`** - Hot restart (reinicia o app)
- **`q`** - Sair
- **`h`** - Ver ajuda

---

## 🔍 Verificar se Está Funcionando

1. **Teste no navegador do emulador:**
   - Abra o Chrome no emulador
   - Acesse: `http://10.0.2.2:3000`
   - Deve carregar a página do sistema

2. **Teste no app:**
   - Abra o app Ekklesia no emulador
   - Tente fazer login
   - Verifique os logs no terminal

---

## ❌ Problemas Comuns

### "No devices found"
- Certifique-se de que o emulador está rodando
- Verifique com: `flutter devices`

### "Connection refused"
- Verifique se o servidor está rodando: `npm run dev`
- Verifique se a URL está correta: `http://10.0.2.2:3000`
- Teste no navegador do emulador primeiro

### Emulador muito lento
- Feche outros programas
- Aguarde alguns minutos (primeira vez é mais lento)

---

## 📋 Checklist Rápido

- [ ] Emulador iniciado e rodando
- [ ] URL da API configurada: `http://10.0.2.2:3000`
- [ ] Servidor rodando: `npm run dev`
- [ ] Executar: `cd mobile` → `flutter run`

**Pronto!** 🎉

