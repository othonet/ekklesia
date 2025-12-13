import '../services/config_service.dart';

class ApiConfig {
  // URL base padrão da API
  // Para emulador Android: use http://10.0.2.2:3000
  // Para dispositivo físico: use http://SEU_IP:3000
  // Para web/desktop: use http://localhost:3000
  // Nota: A URL real é obtida dinamicamente via ConfigService.getApiBaseUrl()
  // Este valor é apenas um fallback inicial (não afeta o APK)
  static const String defaultBaseUrl = 'http://10.0.2.2:3000';
  
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
  
  // Endpoint para confirmar/recusar escala
  static String confirmSchedule(String scheduleId) => '/api/members/me/ministry-schedules/$scheduleId/confirm';
  
  // Event attendance
  static String eventAttendance(String eventId) => '/api/members/me/events/$eventId/attendance';
  
      // Privacy endpoints
      static const String privacyConsent = '/api/privacy/consent';
      static const String privacyExport = '/api/privacy/export';
      static const String privacyDeleteRequest = '/api/privacy/delete-request';
      static const String privacyCancelDeletion = '/api/privacy/cancel-deletion';

      // Ministry leader endpoints
      static const String ministryLeader = '/api/members/me/ministry-leader';
      static String ministryMembers(String ministryId) => '/api/ministries/$ministryId/members';
      static String ministrySchedules(String ministryId) => '/api/ministries/$ministryId/schedules';
      
      // Leadership management endpoints (for members - mobile app)
      static String leadershipMinistries = '/api/members/me/ministry-leader';
      static String leadershipMinistryMembers(String ministryId) => '/api/members/me/leadership/ministries/$ministryId/members';
      static String leadershipMinistryMember(String ministryId, String memberId) => '/api/members/me/leadership/ministries/$ministryId/members/$memberId';
      static String leadershipMinistrySchedules(String ministryId) => '/api/members/me/leadership/ministries/$ministryId/schedules';
      static String leadershipMinistryAvailableMembers(String ministryId) => '/api/members/me/leadership/ministries/$ministryId/available-members';
    }

