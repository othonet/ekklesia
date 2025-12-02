# Implementação da Camada Mobile - Ekklesia

## Resumo

Foi desenvolvida a camada mobile completa em Flutter para o sistema Ekklesia, permitindo que membros acessem suas informações através de um aplicativo mobile.

## Estrutura Implementada

### 1. Configuração e Dependências
- ✅ `pubspec.yaml` atualizado com todas as dependências necessárias
- ✅ Configuração de API (`lib/config/api_config.dart`)
- ✅ README com instruções de uso

### 2. Modelos de Dados
- ✅ `Member` - Modelo principal do membro
- ✅ `Church` - Informações da igreja
- ✅ `Donation` - Doações
- ✅ `MinistryInfo` - Ministérios
- ✅ `CourseInfo` - Cursos
- ✅ `Certificate` - Certificados
- ✅ Modelos auxiliares (BaptismInfo, EventInfo, etc.)

**Nota:** Os arquivos `.g.dart` precisam ser gerados executando:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. Serviços
- ✅ `AuthService` - Autenticação e gerenciamento de tokens
  - Login com privacy token
  - Armazenamento seguro de tokens
  - Gerenciamento de headers de autenticação
  
- ✅ `ApiService` - Comunicação com a API
  - Buscar dados do membro
  - Buscar doações
  - Buscar ministérios
  - Buscar cursos
  - Buscar certificados
  - Atualizar dados do membro
  
- ✅ `PrivacyService` - Serviços de privacidade (LGPD)
  - Gerenciar consentimento
  - Exportar dados
  - Solicitar exclusão
  - Cancelar exclusão

### 4. Providers (Gerenciamento de Estado)
- ✅ `AuthProvider` - Estado de autenticação
  - Gerenciamento de login/logout
  - Carregamento de dados do membro
  - Estado de loading e erros

### 5. Telas Implementadas
- ✅ `LoginScreen` - Tela de login com privacy token
- ✅ `HomeScreen` - Tela inicial com dashboard e navegação
- ✅ `ProfileScreen` - Perfil completo do membro
- ✅ `DonationsScreen` - Histórico de doações
- ✅ `MinistriesScreen` - Ministérios participados
- ✅ `CoursesScreen` - Cursos realizados
- ✅ `CertificatesScreen` - Certificados obtidos
- ✅ `PrivacyScreen` - Gerenciamento de privacidade (LGPD)

### 6. Endpoint na API
- ✅ `POST /api/auth/member/login-with-token` - Converte privacy token em JWT

## Fluxo de Autenticação

1. Administrador gera token de privacidade no sistema web
2. Token é enviado ao membro (email, SMS, WhatsApp)
3. Membro abre o app e cola o token
4. App envia token para `/api/auth/member/login-with-token`
5. API valida token e retorna JWT
6. App armazena JWT de forma segura (flutter_secure_storage)
7. Todas as requisições subsequentes usam o JWT no header Authorization

## Funcionalidades Implementadas

### Visualização de Dados
- ✅ Perfil completo do membro
- ✅ Histórico de doações com filtros
- ✅ Ministérios com informações detalhadas
- ✅ Cursos com status e certificados
- ✅ Certificados com validação online

### Privacidade (LGPD)
- ✅ Gerenciar consentimento de dados
- ✅ Exportar todos os dados pessoais
- ✅ Solicitar exclusão de dados
- ✅ Informações sobre LGPD

### UX/UI
- ✅ Interface moderna e intuitiva
- ✅ Navegação por abas
- ✅ Pull-to-refresh em todas as listas
- ✅ Tratamento de erros
- ✅ Estados de loading
- ✅ Mensagens de feedback

## Segurança

- ✅ Tokens armazenados usando `flutter_secure_storage` (Keychain/Keystore)
- ✅ JWT usado em todas as requisições
- ✅ Headers de autenticação automáticos
- ✅ Logout automático em caso de token expirado
- ✅ Validação de tokens antes de requisições

## Próximos Passos (Opcional)

1. **Gerar código JSON:**
   ```bash
   cd mobile
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

2. **Configurar URL da API:**
   - Editar `lib/config/api_config.dart`
   - Ou usar variável de ambiente: `--dart-define=API_BASE_URL=http://seu-servidor.com`

3. **Testar o aplicativo:**
   ```bash
   flutter run
   ```

4. **Melhorias futuras (opcional):**
   - Notificações push
   - Modo offline com cache
   - Biometria para login
   - Tema escuro
   - Internacionalização (i18n)

## Arquivos Criados

```
mobile/
├── lib/
│   ├── config/
│   │   └── api_config.dart
│   ├── models/
│   │   ├── member.dart
│   │   └── member.g.dart (gerar)
│   ├── providers/
│   │   └── auth_provider.dart
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── profile_screen.dart
│   │   ├── donations_screen.dart
│   │   ├── ministries_screen.dart
│   │   ├── courses_screen.dart
│   │   ├── certificates_screen.dart
│   │   └── privacy_screen.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── api_service.dart
│   │   └── privacy_service.dart
│   └── main.dart
├── pubspec.yaml
├── README.md
└── IMPLEMENTACAO.md
```

## Notas Importantes

1. **JSON Serialization:** Os modelos usam `json_annotation` e precisam ter os arquivos `.g.dart` gerados pelo `build_runner`.

2. **URL da API:** Por padrão está configurada para `http://localhost:3000`. Altere para a URL do seu servidor em produção.

3. **Token de Privacidade:** O token deve ser gerado pelo administrador no sistema web antes do membro poder fazer login.

4. **Dependências:** Execute `flutter pub get` antes de usar o aplicativo.

5. **Build:** Para produção, use `flutter build apk --release` (Android) ou `flutter build ios --release` (iOS).

## Compatibilidade

- Flutter SDK: ^3.10.1
- Android: Mínimo API 21
- iOS: Mínimo iOS 11.0

