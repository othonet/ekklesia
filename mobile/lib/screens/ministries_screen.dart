import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/member.dart';

class MinistriesScreen extends StatefulWidget {
  const MinistriesScreen({super.key});

  @override
  State<MinistriesScreen> createState() => _MinistriesScreenState();
}

class _MinistriesScreenState extends State<MinistriesScreen> {
  List<MinistryInfo>? _ministries;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMinistries();
  }

  Future<void> _loadMinistries() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final ministries = await apiService.getMinistries();
      
      if (!mounted) return;
      
      setState(() {
        _ministries = ministries;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Ministérios'),
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
                        onPressed: _loadMinistries,
                        child: const Text('Tentar Novamente'),
                      ),
                    ],
                  ),
                )
              : _ministries == null || _ministries!.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.group_off,
                            size: 64,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Você não está em nenhum ministério',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadMinistries,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _ministries!.length,
                        itemBuilder: (context, index) {
                          final ministry = _ministries![index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.blue.withValues(alpha: 0.1),
                                child: const Icon(Icons.group, color: Colors.blue),
                              ),
                              title: Text(
                                ministry.name,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (ministry.description != null) ...[
                                    const SizedBox(height: 4),
                                    Text(ministry.description!),
                                  ],
                                  if (ministry.role != null) ...[
                                    const SizedBox(height: 8),
                                    Chip(
                                      label: Text(
                                        ministry.role!,
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                      padding: EdgeInsets.zero,
                                    ),
                                  ],
                                  const SizedBox(height: 4),
                                  Text(
                                    'Desde ${DateFormat('MM/yyyy').format(ministry.joinedAt)}',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

