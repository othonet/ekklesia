import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/member.dart';
import '../models/schedule.dart';
import 'auth_service.dart';
import 'config_service.dart';

class ApiService {
  Dio _dio;
  final AuthService _authService;

  ApiService({
    Dio? dio,
    required AuthService authService,
  })  : _dio = dio ?? Dio(BaseOptions(baseUrl: ApiConfig.defaultBaseUrl)),
        _authService = authService {
    _setupInterceptors();
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

  /// Configura interceptors para adicionar token automaticamente
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          try {
            final headers = await _authService.getAuthHeaders();
            print('🔑 Headers de autenticação: ${headers.containsKey('Authorization') ? 'Token presente' : 'Token ausente'}');
            if (headers.containsKey('Authorization')) {
              print('🔑 Enviando token no header Authorization');
            }
            options.headers.addAll(headers);
            print('📤 Requisição para: ${options.path}');
            print('📤 Headers finais: ${options.headers.keys.toList()}');
            handler.next(options);
          } catch (e) {
            print('❌ Erro no interceptor: $e');
            handler.next(options);
          }
        },
        onError: (error, handler) {
          print('❌ Erro na requisição: ${error.response?.statusCode}');
          print('❌ URL: ${error.requestOptions.path}');
          if (error.response?.statusCode == 401) {
            // Token expirado - fazer logout
            _authService.logout();
          }
          handler.next(error);
        },
      ),
    );
  }

  /// Busca dados completos do membro
  Future<Member> getMember() async {
    try {
      await _initializeDio();
      print('📥 Buscando dados do membro em: ${_dio.options.baseUrl}${ApiConfig.memberMe}');
      final headers = await _authService.getAuthHeaders();
      print('📥 Headers preparados: ${headers.keys.toList()}');
      
      final response = await _dio.get(
        ApiConfig.memberMe,
        options: Options(headers: headers),
      );

      print('✅ Resposta recebida: Status ${response.statusCode}');
      print('✅ Dados recebidos: ${response.data != null ? 'Presente' : 'Ausente'}');
      
      if (response.statusCode == 200) {
        print('✅ Convertendo dados para Member...');
        print('📋 Dados recebidos (keys): ${response.data.keys.toList()}');
        try {
          final member = Member.fromJson(response.data);
          print('✅ Member criado: ${member.name}');
          return member;
        } catch (e, stackTrace) {
          print('❌ Erro ao converter JSON para Member: $e');
          print('❌ Stack trace: $stackTrace');
          print('📋 Dados que causaram erro: ${response.data}');
          rethrow;
        }
      }
      print('❌ Status code inválido: ${response.statusCode}');
      throw Exception('Erro ao buscar dados do membro: Status ${response.statusCode}');
    } catch (e) {
      print('❌ Erro ao buscar membro: $e');
      if (e is DioException) {
        print('❌ DioException: ${e.response?.statusCode}');
        print('❌ Resposta: ${e.response?.data}');
        throw _handleDioError(e);
      }
      throw Exception('Erro ao buscar dados: ${e.toString()}');
    }
  }


  /// Busca ministérios do membro
  Future<List<MinistryInfo>> getMinistries() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.memberMinistries,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => MinistryInfo.fromJson(json)).toList();
      }
      throw Exception('Erro ao buscar ministérios');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao buscar ministérios: ${e.toString()}');
    }
  }

  /// Busca cursos do membro
  Future<List<CourseInfo>> getCourses() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.memberCourses,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => CourseInfo.fromJson(json)).toList();
      }
      throw Exception('Erro ao buscar cursos');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao buscar cursos: ${e.toString()}');
    }
  }

  /// Busca certificados do membro
  Future<List<Certificate>> getCertificates() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.memberCertificates,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Certificate.fromJson(json)).toList();
      }
      throw Exception('Erro ao buscar certificados');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao buscar certificados: ${e.toString()}');
    }
  }

  /// Busca escalas do membro
  Future<List<Schedule>> getSchedules() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.memberSchedules,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Schedule.fromJson(json)).toList();
      }
      throw Exception('Erro ao buscar escalas');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao buscar escalas: ${e.toString()}');
    }
  }

  /// Busca eventos da igreja para o membro
  Future<List<EventInfo>> getEvents() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.memberEvents,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => EventInfo.fromJson(json)).toList();
      }
      throw Exception('Erro ao buscar eventos');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao buscar eventos: ${e.toString()}');
    }
  }

  /// Confirma ou cancela presença em um evento
  Future<Map<String, dynamic>> confirmEventAttendance(String eventId, bool willAttend) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.post(
        ApiConfig.eventAttendance(eventId),
        data: {'willAttend': willAttend},
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Erro ao confirmar presença');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao confirmar presença: ${e.toString()}');
    }
  }

  /// Atualiza dados do membro
  Future<Member> updateMember(Map<String, dynamic> data) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.put(
        ApiConfig.memberMe,
        data: data,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        return Member.fromJson(response.data);
      }
      throw Exception('Erro ao atualizar dados');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao atualizar dados: ${e.toString()}');
    }
  }

  String _handleDioError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final data = error.response!.data;
      
      if (statusCode == 401) {
        return 'Não autorizado. Faça login novamente.';
      } else if (statusCode == 404) {
        return 'Recurso não encontrado';
      } else if (statusCode == 400) {
        return data['error'] ?? 'Requisição inválida';
      } else {
        return data['error'] ?? 'Erro na requisição';
      }
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return 'Tempo de conexão esgotado. Verifique sua internet.';
    } else if (error.type == DioExceptionType.connectionError) {
      return 'Erro de conexão. Verifique sua internet.';
    } else {
      return 'Erro inesperado: ${error.message}';
    }
  }
}

