import '../services/config_service.dart';

class ApiConfig {
  // URL base padrão da API
  static const String defaultBaseUrl = 'http://192.168.1.161:3000';
  
  // Obtém a URL base da API (dinâmica via ConfigService)
  static Future<String> getBaseUrl() async {
    return await ConfigService.getApiBaseUrl();
  }
  
  // Mantém compatibilidade com código existente (usa padrão)
  static String get baseUrl => defaultBaseUrl;

  // Endpoints de autenticação
  static const String memberLogin = '/api/auth/member/login';
  static const String memberMe = '/api/members/me';
  static const String memberMinistries = '/api/members/me/ministries';
  static const String memberCourses = '/api/members/me/courses';
  static const String memberCertificates = '/api/members/me/certificates';
  static const String memberSchedules = '/api/members/me/schedules';
  static const String memberEvents = '/api/members/me/events';
  
  // Event attendance
  static String eventAttendance(String eventId) => '/api/members/me/events/$eventId/attendance';
  
  // Privacy endpoints
  static const String privacyConsent = '/api/privacy/consent';
  static const String privacyExport = '/api/privacy/export';
  static const String privacyDeleteRequest = '/api/privacy/delete-request';
  static const String privacyCancelDeletion = '/api/privacy/cancel-deletion';
}

