import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/auth_provider.dart';
import '../services/privacy_service.dart';
import '../services/auth_service.dart';

class PrivacyScreen extends StatefulWidget {
  const PrivacyScreen({super.key});

  @override
  State<PrivacyScreen> createState() => _PrivacyScreenState();
}

class _PrivacyScreenState extends State<PrivacyScreen> {
  final PrivacyService _privacyService = PrivacyService(
    authService: AuthService(),
  );
  
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadConsentStatus();
  }

  Future<void> _loadConsentStatus() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      await _privacyService.getConsentStatus();
      if (!mounted) return;
      
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao carregar status: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _updateConsent(bool granted) async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      await _privacyService.updateConsent(granted);
      
      // Recarregar dados do membro para atualizar o estado
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.loadMember();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              granted
                  ? 'Consentimento concedido com sucesso'
                  : 'Consentimento revogado',
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao atualizar consentimento: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (!mounted) return;
      
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _exportData() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final data = await _privacyService.exportData();
      
      if (mounted) {
        await Share.share(
          data,
          subject: 'Meus Dados - Ekklesia',
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao exportar dados: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (!mounted) return;
      
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _requestDeletion() async {
    final reasonController = TextEditingController();
    
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Solicitar Exclusão de Dados'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Você está prestes a solicitar a exclusão de seus dados pessoais. '
              'Esta ação será agendada para 30 dias a partir de hoje, conforme a LGPD.',
            ),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Motivo da solicitação',
                hintText: 'Informe o motivo da exclusão',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              if (reasonController.text.trim().isNotEmpty) {
                Navigator.pop(context, true);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Solicitar'),
          ),
        ],
      ),
    );

    if (confirmed == true && reasonController.text.trim().isNotEmpty) {
      if (!mounted) return;
      
      setState(() {
        _isLoading = true;
      });

      try {
        await _privacyService.requestDeletion(reasonController.text.trim());
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Solicitação de exclusão criada. Você receberá um email de confirmação.',
              ),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erro ao solicitar exclusão: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final member = authProvider.member;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacidade e LGPD'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Informações sobre consentimento
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.privacy_tip, color: Colors.blue),
                              const SizedBox(width: 8),
                              Text(
                                'Consentimento de Dados',
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (member != null)
                            SwitchListTile(
                              title: const Text('Consentimento para processamento de dados'),
                              subtitle: member.dataConsent
                                  ? Text(
                                      'Concedido em ${member.consentDate != null ? DateFormat('dd/MM/yyyy').format(member.consentDate!) : 'N/A'}',
                                    )
                                  : const Text('Não concedido'),
                              value: member.dataConsent,
                              onChanged: (value) => _updateConsent(value),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Exportar dados
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.download, color: Colors.green),
                      title: const Text('Exportar Meus Dados'),
                      subtitle: const Text(
                        'Baixe uma cópia de todos os seus dados pessoais',
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _exportData,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Solicitar exclusão
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.delete_forever, color: Colors.red),
                      title: const Text('Solicitar Exclusão de Dados'),
                      subtitle: const Text(
                        'Solicite a exclusão de seus dados pessoais (LGPD)',
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _requestDeletion,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Informações sobre LGPD
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.info_outline, color: Colors.blue),
                              const SizedBox(width: 8),
                              Text(
                                'Sobre a LGPD',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'A Lei Geral de Proteção de Dados (LGPD) garante seus direitos sobre seus dados pessoais. '
                            'Você pode a qualquer momento:\n\n'
                            '• Conceder ou revogar consentimento\n'
                            '• Exportar seus dados\n'
                            '• Solicitar exclusão de dados\n\n'
                            'A exclusão de dados é agendada para 30 dias após a solicitação, '
                            'conforme previsto na LGPD.',
                            style: TextStyle(fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

