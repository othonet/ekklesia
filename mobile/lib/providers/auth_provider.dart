import 'package:flutter/foundation.dart';
import '../models/member.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService;
  final ApiService _apiService;
  
  // Tornar authService público para uso em outras telas
  AuthService get authService => _authService;
  
  Member? _member;
  bool _isLoading = false;
  String? _error;

  AuthProvider({
    required AuthService authService,
    required ApiService apiService,
  })  : _authService = authService,
        _apiService = apiService {
    _checkAuth();
  }

  Member? get member => _member;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool _isAuthenticated = false;
  
  bool get isAuthenticated => _isAuthenticated;

  Future<void> _checkAuth() async {
    _isLoading = true;
    notifyListeners();
    
    final isAuth = await _authService.isAuthenticated();
    _isAuthenticated = isAuth;
    
    if (isAuth) {
      await loadMember();
    } else {
      // Garantir que não há token antigo armazenado
      await _authService.logout();
      _member = null;
    }
    
    _isLoading = false;
    notifyListeners();
  }

  /// Login com email e senha
  Future<bool> loginWithEmailPassword(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final token = await _authService.loginWithEmailPassword(email, password);
      if (token != null) {
        // Login bem-sucedido
        _isAuthenticated = true;
        _isLoading = false;
        _error = null;
        notifyListeners();
        
        // Carregar membro em background (não bloqueia a navegação)
        loadMember().catchError((e) {
          print('Erro ao carregar membro após login: $e');
          // Não é crítico - o membro será carregado quando a home screen aparecer
        });
        
        return true;
      } else {
        _error = 'Email ou senha inválidos';
        _isAuthenticated = false;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      // Extrair apenas a mensagem da exceção, removendo o prefixo "Exception: "
      String errorMessage = e.toString();
      if (errorMessage.startsWith('Exception: ')) {
        errorMessage = errorMessage.substring(11);
      }
      _error = errorMessage;
      _isAuthenticated = false;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadMember() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('📥 Carregando dados do membro...');
      _member = await _apiService.getMember();
      print('✅ Dados do membro carregados: ${_member?.name}');
      _isLoading = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      print('❌ Erro ao carregar membro: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _member = null;
    _isAuthenticated = false;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

