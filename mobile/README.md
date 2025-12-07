# Ekklesia Mobile - Aplicativo de Membros

Aplicativo mobile desenvolvido em Flutter para membros da igreja acessarem suas informações pessoais.

## Funcionalidades

- ✅ Login com token de privacidade
- ✅ Visualização de perfil completo
- ✅ Histórico de doações
- ✅ Ministérios participados
- ✅ Cursos realizados
- ✅ Certificados obtidos
- ✅ Gerenciamento de privacidade (LGPD)
  - Consentimento de dados
  - Exportação de dados
  - Solicitação de exclusão de dados

## Configuração

### 1. Instalar dependências

```bash
cd mobile
flutter pub get
```

### 2. Configurar URL da API

Edite o arquivo `lib/config/api_config.dart` e altere a URL base da API:

```dart
static const String baseUrl = 'http://seu-servidor.com';
```

Ou configure via variável de ambiente ao executar:

```bash
flutter run --dart-define=API_BASE_URL=http://seu-servidor.com
```

### 3. Gerar código JSON (opcional)

Se você modificou os modelos, execute:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## Como Usar

1. O administrador gera um token de privacidade para o membro no sistema web
2. O token é enviado ao membro (email, SMS, WhatsApp, etc.)
3. O membro abre o app e cola o token na tela de login
4. O app converte o token de privacidade em JWT e armazena de forma segura
5. O membro pode acessar todas as suas informações

## Estrutura do Projeto

```
lib/
├── config/          # Configurações (API, etc.)
├── models/          # Modelos de dados
├── providers/       # Gerenciamento de estado (Provider)
├── screens/         # Telas do aplicativo
├── services/       # Serviços (API, autenticação, etc.)
└── main.dart       # Ponto de entrada
```

## Dependências Principais

- `provider` - Gerenciamento de estado
- `dio` - Cliente HTTP
- `flutter_secure_storage` - Armazenamento seguro de tokens
- `intl` - Formatação de datas e números
- `url_launcher` - Abrir links externos
- `share_plus` - Compartilhar dados

## Desenvolvimento

### Executar em modo debug

```bash
flutter run
```

### Build para produção

```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release
```

## Segurança

- Tokens são armazenados usando `flutter_secure_storage` (Keychain/Keystore)
- Todas as requisições usam HTTPS em produção
- Token JWT é renovado automaticamente quando necessário
- Dados sensíveis não são armazenados localmente

## Notas

- O token de privacidade expira após 90 dias (configurável no backend)
- O app verifica automaticamente se o token está válido
- Em caso de token expirado, o membro precisa solicitar um novo token ao administrador
