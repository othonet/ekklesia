import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';
import '../models/member.dart';

class CertificatesScreen extends StatefulWidget {
  const CertificatesScreen({super.key});

  @override
  State<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends State<CertificatesScreen> {
  List<Certificate>? _certificates;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCertificates();
  }

  Future<void> _loadCertificates() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final certificates = await apiService.getCertificates();
      
      if (!mounted) return;
      
      setState(() {
        _certificates = certificates;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _validateCertificate(Certificate certificate) async {
    // URL para validação do certificado
    final validationUrl = '${ApiConfig.baseUrl}/validate-certificate?hash=${certificate.validationHash}';
    
    if (await canLaunchUrl(Uri.parse(validationUrl))) {
      await launchUrl(Uri.parse(validationUrl), mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Não foi possível abrir o link de validação'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Certificados'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        _error!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadCertificates,
                        child: const Text('Tentar Novamente'),
                      ),
                    ],
                  ),
                )
              : _certificates == null || _certificates!.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.verified_user_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Nenhum certificado encontrado',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadCertificates,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _certificates!.length,
                        itemBuilder: (context, index) {
                          final certificate = _certificates![index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.orange.withValues(alpha: 0.1),
                                child: const Icon(Icons.verified, color: Colors.orange),
                              ),
                              title: Text(
                                certificate.title,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (certificate.description != null) ...[
                                    const SizedBox(height: 4),
                                    Text(certificate.description!),
                                  ],
                                  const SizedBox(height: 8),
                                  Text(
                                    'Número: ${certificate.certificateNumber}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  Text(
                                    'Emitido em: ${DateFormat('dd/MM/yyyy').format(certificate.issuedDate)}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  if (certificate.issuedBy != null)
                                    Text(
                                      'Emitido por: ${certificate.issuedBy}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  if (certificate.validUntil != null)
                                    Text(
                                      'Válido até: ${DateFormat('dd/MM/yyyy').format(certificate.validUntil!)}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                ],
                              ),
                              trailing: IconButton(
                                icon: const Icon(Icons.verified_user),
                                onPressed: () => _validateCertificate(certificate),
                                tooltip: 'Validar certificado',
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

