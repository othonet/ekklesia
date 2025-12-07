import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/member.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  List<EventInfo>? _events;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final events = await apiService.getEvents();
      
      if (!mounted) return;
      
      setState(() {
        _events = events;
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

  String _formatEventDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDate = DateTime(date.year, date.month, date.day);
    
    if (eventDate == today) {
      return 'Hoje, ${DateFormat('HH:mm').format(date)}';
    } else if (eventDate == today.add(const Duration(days: 1))) {
      return 'Amanhã, ${DateFormat('HH:mm').format(date)}';
    } else {
      return DateFormat('dd/MM/yyyy, HH:mm').format(date);
    }
  }

  String _getEventTypeLabel(String? type) {
    switch (type) {
      case 'SERVICE':
        return 'Culto';
      case 'MEETING':
        return 'Reunião';
      case 'EVENT':
        return 'Evento';
      case 'CONFERENCE':
        return 'Conferência';
      case 'RETREAT':
        return 'Retiro';
      default:
        return 'Evento';
    }
  }

  Color _getEventTypeColor(String? type) {
    switch (type) {
      case 'SERVICE':
        return Colors.blue;
      case 'MEETING':
        return Colors.green;
      case 'EVENT':
        return Colors.orange;
      case 'CONFERENCE':
        return Colors.purple;
      case 'RETREAT':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Eventos'),
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
                        onPressed: _loadEvents,
                        child: const Text('Tentar Novamente'),
                      ),
                    ],
                  ),
                )
              : _events == null || _events!.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.event_busy,
                            size: 64,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Nenhum evento encontrado',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadEvents,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _events!.length,
                        itemBuilder: (context, index) {
                          final event = _events![index];
                          final eventDate = event.date; // Já é DateTime
                          final eventColor = _getEventTypeColor(event.type);
                          final isPast = eventDate.isBefore(DateTime.now());
                          
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              onTap: () {
                                // Mostrar detalhes do evento
                                _showEventDetails(context, event);
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: eventColor.withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Icon(
                                            Icons.event,
                                            color: eventColor,
                                            size: 24,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                event.title,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 16,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Row(
                                                children: [
                                                  Icon(
                                                    Icons.calendar_today,
                                                    size: 14,
                                                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    _formatEventDate(eventDate),
                                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                        if (event.hasAttendance != null && event.hasAttendance!)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.green.withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.check_circle,
                                                  size: 16,
                                                  color: Colors.green,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  'Confirmado',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.green,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                      ],
                                    ),
                                    if (event.description != null && event.description!.isNotEmpty) ...[
                                      const SizedBox(height: 12),
                                      Text(
                                        event.description!,
                                        style: Theme.of(context).textTheme.bodyMedium,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                    if (event.location != null && event.location!.isNotEmpty) ...[
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.location_on,
                                            size: 16,
                                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                                          ),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Text(
                                              event.location!,
                                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Chip(
                                          label: Text(
                                            _getEventTypeLabel(event.type),
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                          backgroundColor: eventColor.withOpacity(0.1),
                                          labelStyle: TextStyle(
                                            color: eventColor,
                                            fontSize: 12,
                                          ),
                                          padding: EdgeInsets.zero,
                                        ),
                                        if (isPast) ...[
                                          const SizedBox(width: 8),
                                          Chip(
                                            label: Text(
                                              'Realizado',
                                              style: const TextStyle(fontSize: 12),
                                            ),
                                            backgroundColor: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.1),
                                            labelStyle: TextStyle(
                                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                                              fontSize: 12,
                                            ),
                                            padding: EdgeInsets.zero,
                                          ),
                                        ],
                                      ],
                                    ),
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

  Future<void> _confirmAttendance(BuildContext context, EventInfo event) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      
      await apiService.confirmEventAttendance(event.id, true);
      
      if (!mounted) return;
      
      // Fechar modal primeiro
      Navigator.of(context).pop();
      
      // Atualizar estado localmente para feedback imediato
      setState(() {
        if (_events != null) {
          final index = _events!.indexWhere((e) => e.id == event.id);
          if (index != -1) {
            // Criar novo objeto EventInfo com hasAttendance atualizado
            final updatedEvent = EventInfo(
              id: _events![index].id,
              title: _events![index].title,
              description: _events![index].description,
              dateString: _events![index].dateString,
              location: _events![index].location,
              type: _events![index].type,
              hasAttendance: true,
              attendance: _events![index].attendance,
            );
            _events![index] = updatedEvent;
          }
        }
      });
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Presença confirmada com sucesso!'),
          backgroundColor: Colors.green,
        ),
      );
      
      // Recarregar eventos em background para garantir sincronização
      _loadEvents();
    } catch (e) {
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao confirmar presença: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _cancelAttendance(BuildContext context, EventInfo event) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancelar Presença'),
        content: const Text('Tem certeza que deseja cancelar sua presença neste evento?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Não'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Sim'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      
      await apiService.confirmEventAttendance(event.id, false);
      
      if (!mounted) return;
      
      // Fechar modal primeiro
      Navigator.of(context).pop();
      
      // Atualizar estado localmente para feedback imediato
      setState(() {
        if (_events != null) {
          final index = _events!.indexWhere((e) => e.id == event.id);
          if (index != -1) {
            // Criar novo objeto EventInfo com hasAttendance atualizado
            final updatedEvent = EventInfo(
              id: _events![index].id,
              title: _events![index].title,
              description: _events![index].description,
              dateString: _events![index].dateString,
              location: _events![index].location,
              type: _events![index].type,
              hasAttendance: false,
              attendance: _events![index].attendance,
            );
            _events![index] = updatedEvent;
          }
        }
      });
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Presença cancelada com sucesso!'),
          backgroundColor: Colors.orange,
        ),
      );
      
      // Recarregar eventos em background para garantir sincronização
      _loadEvents();
    } catch (e) {
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao cancelar presença: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showEventDetails(BuildContext context, EventInfo event) {
    try {
      final eventDate = event.date; // Já é DateTime
      
      showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _getEventTypeColor(event.type).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.event,
                        color: _getEventTypeColor(event.type),
                        size: 32,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event.title,
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _getEventTypeLabel(event.type),
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _DetailRow(
                  icon: Icons.calendar_today,
                  label: 'Data e Hora',
                  value: _formatEventDate(eventDate),
                ),
                if (event.location != null && event.location!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _DetailRow(
                    icon: Icons.location_on,
                    label: 'Local',
                    value: event.location!,
                  ),
                ],
                if (event.description != null && event.description!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    'Descrição',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    event.description!,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
                const SizedBox(height: 24),
                // Botão de confirmação de presença
                if (event.hasAttendance != null && event.hasAttendance!) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.green),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Você confirmou presença neste evento',
                            style: TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () => _cancelAttendance(context, event),
                          child: const Text('Cancelar'),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _confirmAttendance(context, event),
                          icon: const Icon(Icons.check_circle),
                          label: const Text('Confirmar Presença'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
    } catch (e) {
      // Se houver erro ao abrir o modal, mostrar mensagem
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao exibir detalhes do evento: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: Theme.of(context).colorScheme.primary,
        ),
        const SizedBox(width: 12),
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
              const SizedBox(height: 4),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

