import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class ConfigService {
  static const String _apiUrlKey = 'api_base_url';
  // Para emulador Android: use http://10.0.2.2:3000
  // Para dispositivo físico: use http://SEU_IP:3000 (ex: http://192.168.1.161:3000)
  // Para web/desktop: use http://localhost:3000
  
  /// Retorna a URL padrão baseada na plataforma
  static String get _defaultApiUrl {
    if (kIsWeb) {
      // Web: usa produção
      return 'https://enord.app';
    } else {
      // Mobile/APK: URL de produção
      return 'https://enord.app';
    }
  }

  /// Obtém a URL base da API
  static Future<String> getApiBaseUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString(_apiUrlKey);
      // Se não houver URL salva, usa a padrão baseada na plataforma
      return savedUrl ?? _defaultApiUrl;
    } catch (e) {
      // Em caso de erro, retorna a URL padrão baseada na plataforma
      return _defaultApiUrl;
    }
  }

  /// Salva a URL base da API
  static Future<void> setApiBaseUrl(String url) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_apiUrlKey, url);
    } catch (e) {
      // Ignorar erros ao salvar
    }
  }

  /// Valida se a URL é válida
  static bool isValidUrl(String url) {
    try {
      final uri = Uri.parse(url);
      return uri.hasScheme && (uri.scheme == 'http' || uri.scheme == 'https');
    } catch (e) {
      return false;
    }
  }

  /// Limpa a URL salva (volta para o padrão)
  static Future<void> clearApiBaseUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_apiUrlKey);
    } catch (e) {
      // Ignorar erros
    }
  }
}

