import 'dart:convert';
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class PrivacyService {
  final Dio _dio;
  final AuthService _authService;

  PrivacyService({
    Dio? dio,
    required AuthService authService,
  })  : _dio = dio ?? Dio(BaseOptions(baseUrl: ApiConfig.baseUrl)),
        _authService = authService;

  /// Obtém o status do consentimento
  Future<Map<String, dynamic>> getConsentStatus() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.privacyConsent,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Erro ao buscar status do consentimento');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao buscar consentimento: ${e.toString()}');
    }
  }

  /// Atualiza o consentimento
  Future<Map<String, dynamic>> updateConsent(bool granted) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.post(
        ApiConfig.privacyConsent,
        data: {'granted': granted},
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Erro ao atualizar consentimento');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao atualizar consentimento: ${e.toString()}');
    }
  }

  /// Exporta dados do membro
  Future<String> exportData() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.post(
        ApiConfig.privacyExport,
        options: Options(headers: headers, responseType: ResponseType.json),
      );

      if (response.statusCode == 200) {
        // Retorna o JSON como string formatada
        return const JsonEncoder.withIndent('  ').convert(response.data);
      }
      throw Exception('Erro ao exportar dados');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao exportar dados: ${e.toString()}');
    }
  }

  /// Solicita exclusão de dados
  Future<Map<String, dynamic>> requestDeletion(String reason) async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.post(
        ApiConfig.privacyDeleteRequest,
        data: {'reason': reason},
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Erro ao solicitar exclusão');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao solicitar exclusão: ${e.toString()}');
    }
  }

  /// Cancela solicitação de exclusão
  Future<Map<String, dynamic>> cancelDeletion() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await _dio.post(
        ApiConfig.privacyCancelDeletion,
        options: Options(headers: headers),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Erro ao cancelar exclusão');
    } catch (e) {
      if (e is DioException) {
        throw _handleDioError(e);
      }
      throw Exception('Erro ao cancelar exclusão: ${e.toString()}');
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

