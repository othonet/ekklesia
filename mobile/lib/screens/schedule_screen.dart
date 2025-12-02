import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/schedule.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  List<Schedule>? _schedules;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSchedules();
  }

  Future<void> _loadSchedules() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final schedules = await apiService.getSchedules();
      
      if (!mounted) return;
      
      setState(() {
        _schedules = schedules;
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
        title: const Text('Minhas Escalas'),
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
                        onPressed: _loadSchedules,
                        child: const Text('Tentar Novamente'),
                      ),
                    ],
                  ),
                )
              : _schedules == null || _schedules!.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Nenhuma escala encontrada',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadSchedules,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _schedules!.length,
                        itemBuilder: (context, index) {
                          final schedule = _schedules![index];
                          final isPast = schedule.date.isBefore(DateTime.now());
                          
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              onTap: () {
                                // Mostrar detalhes da escala
                                showDialog(
                                  context: context,
                                  builder: (context) => AlertDialog(
                                    title: Text(schedule.title),
                                    content: SingleChildScrollView(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          if (schedule.description != null) ...[
                                            Text(
                                              schedule.description!,
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                            const SizedBox(height: 16),
                                          ],
                                          _buildDetailRow(
                                            Icons.group,
                                            'Ministério',
                                            schedule.ministryName,
                                          ),
                                          if (schedule.role != null)
                                            _buildDetailRow(
                                              Icons.person,
                                              'Função',
                                              schedule.role!,
                                            ),
                                          _buildDetailRow(
                                            Icons.calendar_today,
                                            'Data',
                                            DateFormat('dd/MM/yyyy').format(schedule.date),
                                          ),
                                          if (schedule.startTime != null)
                                            _buildDetailRow(
                                              Icons.access_time,
                                              'Horário',
                                              '${schedule.startTime}${schedule.endTime != null ? ' - ${schedule.endTime}' : ''}',
                                            ),
                                          if (schedule.location != null)
                                            _buildDetailRow(
                                              Icons.location_on,
                                              'Local',
                                              schedule.location!,
                                            ),
                                          _buildDetailRow(
                                            Icons.info,
                                            'Status',
                                            _getStatusLabel(schedule.status),
                                          ),
                                        ],
                                      ),
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () => Navigator.pop(context),
                                        child: const Text('Fechar'),
                                      ),
                                    ],
                                  ),
                                );
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            schedule.title,
                                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Chip(
                                          label: Text(
                                            _getStatusLabel(schedule.status),
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                          backgroundColor: _getStatusColor(schedule.status).withOpacity(0.1),
                                          labelStyle: TextStyle(
                                            color: _getStatusColor(schedule.status),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.group,
                                          size: 16,
                                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          schedule.ministryName,
                                          style: Theme.of(context).textTheme.bodySmall,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.calendar_today,
                                          size: 16,
                                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          DateFormat('dd/MM/yyyy').format(schedule.date),
                                          style: Theme.of(context).textTheme.bodySmall,
                                        ),
                                        if (schedule.startTime != null) ...[
                                          const SizedBox(width: 16),
                                          Icon(
                                            Icons.access_time,
                                            size: 16,
                                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            schedule.startTime!,
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                        ],
                                      ],
                                    ),
                                    if (schedule.role != null) ...[
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.person,
                                            size: 16,
                                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            schedule.role!,
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.onSurfaceVariant),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'SCHEDULED':
        return 'Agendada';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Concluída';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'SCHEDULED':
        return Colors.blue;
      case 'CONFIRMED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      case 'COMPLETED':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }
}

