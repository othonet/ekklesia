import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/member.dart';

class DonationsScreen extends StatefulWidget {
  const DonationsScreen({super.key});

  @override
  State<DonationsScreen> createState() => _DonationsScreenState();
}

class _DonationsScreenState extends State<DonationsScreen> {
  List<Donation>? _donations;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDonations();
  }

  Future<void> _loadDonations() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final donations = await apiService.getDonations();
      
      if (!mounted) return;
      
      setState(() {
        _donations = donations;
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
        title: const Text('Minhas Doações'),
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
                        onPressed: _loadDonations,
                        child: const Text('Tentar Novamente'),
                      ),
                    ],
                  ),
                )
              : _donations == null || _donations!.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.favorite_border,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Nenhuma doação encontrada',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadDonations,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _donations!.length,
                        itemBuilder: (context, index) {
                          final donation = _donations![index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.red.withValues(alpha: 0.1),
                                child: const Icon(Icons.favorite, color: Colors.red),
                              ),
                              title: Text(
                                'R\$ ${donation.amount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text(
                                    DateFormat('dd/MM/yyyy').format(donation.date),
                                  ),
                                  if (donation.method != null) ...[
                                    const SizedBox(height: 4),
                                    Chip(
                                      label: Text(
                                        donation.method!,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Theme.of(context).colorScheme.onSurface,
                                        ),
                                      ),
                                      padding: EdgeInsets.zero,
                                    ),
                                  ],
                                  if (donation.notes != null && donation.notes!.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      donation.notes!,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              trailing: Text(
                                _getDonationTypeLabel(donation.type),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  String _getDonationTypeLabel(String type) {
    switch (type) {
      case 'TITHE':
        return 'Dízimo';
      case 'OFFERING':
        return 'Oferta';
      case 'CONTRIBUTION':
        return 'Contribuição';
      default:
        return type;
    }
  }
}

