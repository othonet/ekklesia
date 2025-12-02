import 'package:shared_preferences/shared_preferences.dart';

class ConfigService {
  static const String _apiUrlKey = 'api_base_url';
  static const String _defaultApiUrl = 'http://192.168.1.161:3000';

  /// Obtém a URL base da API
  static Future<String> getApiBaseUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString(_apiUrlKey);
      return savedUrl ?? _defaultApiUrl;
    } catch (e) {
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

