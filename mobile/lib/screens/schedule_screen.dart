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
                                _showScheduleDetails(context, schedule);
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
                                        if (schedule.confirmed)
                                          Icon(
                                            Icons.check_circle,
                                            color: Colors.green,
                                            size: 20,
                                          )
                                        else if (schedule.declineReason != null)
                                          Icon(
                                            Icons.cancel,
                                            color: Colors.red,
                                            size: 20,
                                          )
                                        else if (!isPast)
                                          Icon(
                                            Icons.pending,
                                            color: Colors.orange,
                                            size: 20,
                                          ),
                                        const SizedBox(width: 8),
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

  void _showScheduleDetails(BuildContext context, Schedule schedule) {
    final isPast = schedule.date.isBefore(DateTime.now());
    final canConfirm = !isPast && schedule.status != 'CANCELLED';

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
              const SizedBox(height: 16),
              // Status de confirmação
              if (schedule.confirmed)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: Colors.green, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Confirmada',
                          style: TextStyle(color: Colors.green[700], fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                )
              else if (schedule.declineReason != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.cancel, color: Colors.red, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Recusada',
                            style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      if (schedule.declineReason!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Motivo: ${schedule.declineReason}',
                          style: TextStyle(color: Colors.red[700], fontSize: 12),
                        ),
                      ],
                    ],
                  ),
                )
              else if (canConfirm)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.pending, color: Colors.orange, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Aguardando confirmação',
                          style: TextStyle(color: Colors.orange[700], fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fechar'),
          ),
          if (canConfirm && !schedule.confirmed && schedule.declineReason == null) ...[
            // Botão para recusar
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _showDeclineDialog(context, schedule);
              },
              child: const Text('Não Posso', style: TextStyle(color: Colors.red)),
            ),
            // Botão para confirmar
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _confirmSchedule(context, schedule, true);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
              child: const Text('Confirmar'),
            ),
          ] else if (canConfirm && (schedule.confirmed || schedule.declineReason != null)) ...[
            // Botão para alterar confirmação
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                if (schedule.confirmed) {
                  _showDeclineDialog(context, schedule);
                } else {
                  _confirmSchedule(context, schedule, true);
                }
              },
              child: const Text('Alterar'),
            ),
          ],
        ],
      ),
    );
  }

  void _showDeclineDialog(BuildContext context, Schedule schedule) {
    final reasonController = TextEditingController();
    bool includeReason = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Recusar Escala'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Você não poderá comparecer a esta escala?'),
                const SizedBox(height: 16),
                CheckboxListTile(
                  title: const Text('Informar motivo (opcional)'),
                  value: includeReason,
                  onChanged: (value) {
                    setState(() {
                      includeReason = value ?? false;
                    });
                  },
                  controlAffinity: ListTileControlAffinity.leading,
                ),
                if (includeReason) ...[
                  const SizedBox(height: 8),
                  TextField(
                    controller: reasonController,
                    decoration: const InputDecoration(
                      labelText: 'Motivo',
                      hintText: 'Ex: Estarei viajando, compromisso familiar, etc.',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                    maxLength: 500,
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _confirmSchedule(
                  context,
                  schedule,
                  false,
                  declineReason: includeReason ? reasonController.text.trim() : null,
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Recusar'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmSchedule(
    BuildContext context,
    Schedule schedule,
    bool confirmed, {
    String? declineReason,
  }) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);

      await apiService.confirmSchedule(
        schedule.id,
        confirmed,
        declineReason: declineReason,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            confirmed
                ? 'Escala confirmada com sucesso!'
                : 'Escala recusada com sucesso!',
          ),
          backgroundColor: confirmed ? Colors.green : Colors.orange,
        ),
      );

      // Recarregar escalas
      await _loadSchedules();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao ${confirmed ? 'confirmar' : 'recusar'} escala: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

