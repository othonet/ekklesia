# Debug de Login

## Problemas Comuns

### 1. URL da API Incorreta

Se você está testando em um dispositivo físico ou emulador, `localhost:3000` não funcionará!

**Para Android Emulador:**
- Use `http://10.0.2.2:3000` (endereço especial do emulador Android)

**Para iOS Simulador:**
- Use `http://localhost:3000` (funciona no simulador)

**Para Dispositivo Físico:**
- Use o IP da sua máquina na rede local (ex: `http://192.168.1.100:3000`)
- Descubra seu IP com: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)

**Para configurar a URL:**

Edite `mobile/lib/config/api_config.dart`:
```dart
static const String baseUrl = 'http://SEU_IP_AQUI:3000';
```

Ou use variável de ambiente ao executar:
```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:3000
```

### 2. Verificar Credenciais

- Confirme que o email está correto no banco de dados
- Confirme que a senha foi definida pelo administrador
- O email deve estar em lowercase (o app converte automaticamente)

### 3. Verificar Logs

O app agora mostra logs no console. Verifique:
- Se a URL está correta
- Se o email está sendo enviado corretamente
- Qual é o erro retornado pela API

### 4. Testar a API Diretamente

Teste o endpoint diretamente com curl ou Postman:
```bash
curl -X POST http://localhost:3000/api/auth/member/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@exemplo.com","password":"sua-senha"}'
```

### 5. Verificar se o Servidor está Rodando

Certifique-se de que o servidor Next.js está rodando:
```bash
npm run dev
```

