import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import 'config_service.dart';

class AuthService {
  Dio _dio;
  final FlutterSecureStorage _storage;
  static const String _tokenKey = 'jwt_token';

  AuthService({
    Dio? dio,
    FlutterSecureStorage? storage,
  })  : _dio = dio ?? Dio(
          BaseOptions(
            baseUrl: ApiConfig.defaultBaseUrl,
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
            sendTimeout: const Duration(seconds: 30),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ),
        _storage = storage ?? const FlutterSecureStorage() {
    _initializeDio();
  }

  /// Inicializa o Dio com a URL salva
  Future<void> _initializeDio() async {
    final baseUrl = await ConfigService.getApiBaseUrl();
    _dio.options.baseUrl = baseUrl;
  }

  /// Atualiza a URL base do Dio
  Future<void> updateBaseUrl(String newUrl) async {
    await ConfigService.setApiBaseUrl(newUrl);
    _dio.options.baseUrl = newUrl;
  }

  /// Obtém a URL base atual
  Future<String> getBaseUrl() async {
    return await ConfigService.getApiBaseUrl();
  }

  /// Faz login usando email e senha
  /// Retorna o JWT token para uso nas requisições
  Future<String?> loginWithEmailPassword(String email, String password) async {
    try {
      // Limpar email (remover espaços e converter para lowercase)
      final cleanEmail = email.trim().toLowerCase();
      
      // Atualizar URL antes de fazer login (garantir que está atualizada)
      final baseUrl = await ConfigService.getApiBaseUrl();
      _dio.options.baseUrl = baseUrl;
      
      print('🔐 Tentando login com email: $cleanEmail');
      print('🌐 URL Base: $baseUrl');
      print('🌐 URL Completa: $baseUrl${ApiConfig.memberLogin}');
      
      // Preparar dados
      final requestData = {
        'email': cleanEmail,
        'password': password,
      };
      
      print('📤 Dados enviados: ${requestData.toString().replaceAll(password, '***')}');
      
      final response = await _dio.post(
        ApiConfig.memberLogin,
        data: requestData,
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          validateStatus: (status) => status! < 500, // Aceitar status < 500
          followRedirects: false,
        ),
      );

      print('✅ Status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final token = response.data['token'] as String?;
        if (token != null && token.isNotEmpty) {
          await _storage.write(key: _tokenKey, value: token);
          print('✅ Token armazenado com sucesso');
          return token;
        }
        print('❌ Token não encontrado na resposta');
        return null;
      }
      print('❌ Status code inválido: ${response.statusCode}');
      return null;
    } catch (e) {
      print('❌ Erro no login: $e');
      if (e is DioException) {
        print('❌ DioException: ${e.response?.statusCode}');
        print('❌ Resposta: ${e.response?.data}');
        final errorMsg = await _handleDioError(e);
        throw Exception(errorMsg);
      }
      throw Exception('Erro ao fazer login: ${e.toString()}');
    }
  }

  /// Obtém o token JWT armazenado
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  /// Verifica se o usuário está autenticado
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Faz logout
  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
  }

  /// Obtém os headers de autenticação
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    print('🔑 Token obtido do storage: ${token != null ? 'Presente (${token.substring(0, 20)}...)' : 'Ausente'}');
    if (token == null || token.isEmpty) {
      print('⚠️ Token não encontrado no storage');
      return {
        'Content-Type': 'application/json',
      };
    }
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
    print('🔑 Headers preparados com Authorization: Bearer ${token.substring(0, 20)}...');
    return headers;
  }

  Future<String> _handleDioError(DioException error) async {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final data = error.response!.data;
      
      print('❌ Erro HTTP $statusCode: $data');
      
      if (statusCode == 401) {
        final errorMsg = data is Map ? (data['error'] ?? 'Email ou senha inválidos') : 'Email ou senha inválidos';
        return errorMsg.toString();
      } else if (statusCode == 400) {
        final errorMsg = data is Map ? (data['error'] ?? 'Requisição inválida') : 'Requisição inválida';
        return errorMsg.toString();
      } else if (statusCode == 404) {
        return 'Endpoint não encontrado. Verifique a URL da API.';
      } else if (statusCode == 500) {
        final errorMsg = data is Map ? (data['error'] ?? 'Erro interno do servidor') : 'Erro interno do servidor';
        return errorMsg.toString();
      } else {
        final errorMsg = data is Map ? (data['error'] ?? 'Erro ao fazer login') : 'Erro ao fazer login';
        return errorMsg.toString();
      }
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return 'Tempo de conexão esgotado. Verifique sua internet e a URL da API.';
    } else if (error.type == DioExceptionType.connectionError) {
      final baseUrl = await ConfigService.getApiBaseUrl();
      String errorMsg = 'Erro de conexão. Verifique sua internet e se o servidor está rodando em $baseUrl';
      
      // Se estiver usando a URL padrão do emulador em dispositivo físico, dar dica específica
      if (baseUrl.contains('10.0.2.2')) {
        errorMsg += '\n\n⚠️ Você está usando a URL do emulador. Para dispositivo físico, configure o IP do seu computador nas Configurações.';
      }
      
      return errorMsg;
    } else {
      return 'Erro inesperado: ${error.message}';
    }
  }
}

