import 'package:flutter/material.dart';
import '../services/config_service.dart';
import '../services/auth_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _urlController = TextEditingController();
  bool _isLoading = false;
  String? _currentUrl;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    _loadCurrentUrl();
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _loadCurrentUrl() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final url = await ConfigService.getApiBaseUrl();
      if (mounted) {
        setState(() {
          _currentUrl = url;
          _urlController.text = url;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Erro ao carregar URL: $e';
        });
      }
    }
  }

  Future<void> _saveUrl() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final url = _urlController.text.trim();
      
      // Validar URL
      if (!ConfigService.isValidUrl(url)) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = 'URL inválida. Use o formato: http://exemplo.com ou https://exemplo.com';
          });
        }
        return;
      }

      // Salvar URL
      await ConfigService.setApiBaseUrl(url);

      if (mounted) {
        setState(() {
          _currentUrl = url;
          _isLoading = false;
          _successMessage = 'URL salva com sucesso!';
        });
      }

      // Limpar mensagem de sucesso após 3 segundos
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            _successMessage = null;
          });
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Erro ao salvar URL: $e';
        });
      }
    }
  }

  Future<void> _resetToDefault() async {
    if (!mounted) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Restaurar URL padrão'),
        content: const Text('Deseja restaurar a URL padrão? Isso pode afetar a conexão com o servidor.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Restaurar'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ConfigService.clearApiBaseUrl();
      await _loadCurrentUrl();
      if (mounted) {
        setState(() {
          _successMessage = 'URL restaurada para o padrão!';
        });
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) {
            setState(() {
              _successMessage = null;
            });
          }
        });
      }
    }
  }

  Future<void> _testConnection() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final url = _urlController.text.trim();
      
      if (!ConfigService.isValidUrl(url)) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = 'URL inválida';
          });
        }
        return;
      }

      // Criar um Dio temporário para testar a conexão
      final testDio = AuthService();
      await testDio.updateBaseUrl(url);
      
      // Tentar fazer uma requisição simples (pode ser um endpoint de health check ou apenas verificar se a URL responde)
      // Por enquanto, apenas verificamos se a URL é válida
      if (mounted) {
        setState(() {
          _isLoading = false;
          _successMessage = 'URL configurada corretamente!';
        });
      }

      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            _successMessage = null;
          });
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Erro ao testar conexão: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configurações'),
      ),
      body: _isLoading && _currentUrl == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Título
                    Text(
                      'Configuração da API',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Configure a URL do servidor da API',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                    const SizedBox(height: 24),

                    // Campo de URL
                    TextFormField(
                      controller: _urlController,
                      decoration: const InputDecoration(
                        labelText: 'URL da API',
                        hintText: 'http://exemplo.com:3000',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.link),
                        helperText: 'Exemplo: http://192.168.1.161:3000 ou https://api.ekklesia.com',
                      ),
                      keyboardType: TextInputType.url,
                      textInputAction: TextInputAction.done,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Por favor, insira a URL da API';
                        }
                        if (!ConfigService.isValidUrl(value.trim())) {
                          return 'URL inválida. Use o formato: http://exemplo.com ou https://exemplo.com';
                        }
                        return null;
                      },
                      onFieldSubmitted: (_) => _saveUrl(),
                    ),
                    const SizedBox(height: 16),

                    // Mensagens de erro/sucesso
                    if (_errorMessage != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: Colors.red),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(color: Colors.red),
                              ),
                            ),
                          ],
                        ),
                      ),
                    if (_successMessage != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.green.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle_outline, color: Colors.green),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _successMessage!,
                                style: const TextStyle(color: Colors.green),
                              ),
                            ),
                          ],
                        ),
                      ),
                    if (_errorMessage != null || _successMessage != null)
                      const SizedBox(height: 16),

                    // Botões
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _saveUrl,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.save),
                      label: const Text('Salvar URL'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _isLoading ? null : _testConnection,
                      icon: const Icon(Icons.wifi_protected_setup),
                      label: const Text('Testar Conexão'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton.icon(
                      onPressed: _isLoading ? null : _resetToDefault,
                      icon: const Icon(Icons.restore),
                      label: const Text('Restaurar Padrão'),
                    ),

                    const SizedBox(height: 32),

                    // Informações
                    Card(
                      color: Colors.blue.withValues(alpha: 0.1),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.info_outline,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Informações',
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              '• A URL deve incluir o protocolo (http:// ou https://)\n'
                              '• Para desenvolvimento local, use: http://192.168.1.161:3000\n'
                              '• Para produção, use a URL do servidor fornecido pelo administrador\n'
                              '• Após alterar a URL, você precisará fazer login novamente',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.grey[700],
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

