import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class MinistryManagementScreen extends StatefulWidget {
  final Map<String, dynamic> ministry;

  const MinistryManagementScreen({
    super.key,
    required this.ministry,
  });

  @override
  State<MinistryManagementScreen> createState() => _MinistryManagementScreenState();
}

class _MinistryManagementScreenState extends State<MinistryManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _members = [];
  List<dynamic> _schedules = [];
  List<dynamic> _availableMembers = [];
  String? _currentMemberId;
  String? _leaderId;
  bool _isLoadingMembers = true;
  bool _isLoadingSchedules = true;
  bool _isLoadingAvailableMembers = false;
  String? _errorMembers;
  String? _errorSchedules;
  
  // Formulários
  String? _selectedMemberId;
  String _memberRole = '';
  String _scheduleTitle = '';
  String _scheduleDescription = '';
  DateTime? _scheduleDate;
  TimeOfDay? _scheduleStartTime;
  TimeOfDay? _scheduleEndTime;
  String _scheduleLocation = '';
  String _scheduleNotes = '';
  List<String> _selectedMemberIdsForSchedule = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadCurrentMember();
    _loadMembers();
    _loadSchedules();
  }

  Future<void> _loadCurrentMember() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final member = authProvider.member;
      if (member != null) {
        setState(() {
          _currentMemberId = member.id;
        });
      }
    } catch (e) {
      print('Erro ao carregar membro atual: $e');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadMembers() async {
    if (!mounted) return;
    
    setState(() {
      _isLoadingMembers = true;
      _errorMembers = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final data = await apiService.getMinistryMembers(widget.ministry['id']);
      
      if (!mounted) return;
      
      setState(() {
        _members = data['members'] ?? [];
        // Obter o ID do líder da resposta da API
        _leaderId = data['leaderId'];
        _isLoadingMembers = false;
      });
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _errorMembers = e.toString();
        _isLoadingMembers = false;
      });
    }
  }

  Future<void> _loadSchedules() async {
    if (!mounted) return;
    
    setState(() {
      _isLoadingSchedules = true;
      _errorSchedules = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final data = await apiService.getMinistrySchedules(widget.ministry['id']);
      
      if (!mounted) return;
      
      setState(() {
        _schedules = data['schedules'] ?? [];
        _isLoadingSchedules = false;
      });
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _errorSchedules = e.toString();
        _isLoadingSchedules = false;
      });
    }
  }

  Future<void> _loadAvailableMembers() async {
    if (!mounted) return;
    
    setState(() {
      _isLoadingAvailableMembers = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final data = await apiService.getAvailableMembersForMinistry(widget.ministry['id']);
      
      if (!mounted) return;
      
      setState(() {
        _availableMembers = data['members'] ?? [];
        _isLoadingAvailableMembers = false;
      });
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _isLoadingAvailableMembers = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao buscar membros disponíveis: ${e.toString()}')),
      );
    }
  }

  Future<void> _showAddMemberDialog() async {
    await _loadAvailableMembers();
    
    if (_availableMembers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não há membros disponíveis para adicionar')),
      );
      return;
    }

    setState(() {
      _selectedMemberId = null;
      _memberRole = '';
    });

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Adicionar Membro'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Selecione o membro:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                if (_isLoadingAvailableMembers)
                  const Center(child: CircularProgressIndicator())
                else
                  DropdownButtonFormField<String>(
                    value: _selectedMemberId,
                    decoration: const InputDecoration(
                      labelText: 'Membro *',
                      border: OutlineInputBorder(),
                    ),
                    items: _availableMembers.map((member) {
                      return DropdownMenuItem<String>(
                        value: member['id'],
                        child: Text('${member['name']}${member['email'] != null ? ' (${member['email']})' : ''}'),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setDialogState(() {
                        _selectedMemberId = value;
                      });
                    },
                  ),
                const SizedBox(height: 16),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Função/Papel',
                    hintText: 'Ex: Coordenador, Ajudante, etc.',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    setDialogState(() {
                      _memberRole = value;
                    });
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: _selectedMemberId == null
                  ? null
                  : () => Navigator.pop(context, true),
              child: const Text('Adicionar'),
            ),
          ],
        ),
      ),
    );

    if (result != true || _selectedMemberId == null) return;

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      await apiService.addMemberToMinistry(
        widget.ministry['id'],
        _selectedMemberId!,
        role: _memberRole.isEmpty ? null : _memberRole,
      );
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Membro adicionado com sucesso')),
      );
      
      _loadMembers();
    } catch (e) {
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao adicionar membro: ${e.toString()}')),
      );
    }
  }

  Future<void> _showCreateScheduleDialog() async {
    setState(() {
      _scheduleTitle = '';
      _scheduleDescription = '';
      _scheduleDate = null;
      _scheduleStartTime = null;
      _scheduleEndTime = null;
      _scheduleLocation = '';
      _scheduleNotes = '';
      _selectedMemberIdsForSchedule = [];
    });

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Nova Escala'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Título *',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    setDialogState(() {
                      _scheduleTitle = value;
                    });
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Descrição',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                  onChanged: (value) {
                    setDialogState(() {
                      _scheduleDescription = value;
                    });
                  },
                ),
                const SizedBox(height: 16),
                ListTile(
                  title: const Text('Data e Hora *'),
                  subtitle: Text(_scheduleDate == null
                      ? 'Selecione a data'
                      : DateFormat('dd/MM/yyyy').format(_scheduleDate!)),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now(),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (date != null) {
                      setDialogState(() {
                        _scheduleDate = date;
                      });
                    }
                  },
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ListTile(
                        title: const Text('Início'),
                        subtitle: Text(_scheduleStartTime == null
                            ? 'Selecione'
                            : _scheduleStartTime!.format(context)),
                        trailing: const Icon(Icons.access_time),
                        onTap: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (time != null) {
                            setDialogState(() {
                              _scheduleStartTime = time;
                            });
                          }
                        },
                      ),
                    ),
                    Expanded(
                      child: ListTile(
                        title: const Text('Término'),
                        subtitle: Text(_scheduleEndTime == null
                            ? 'Selecione'
                            : _scheduleEndTime!.format(context)),
                        trailing: const Icon(Icons.access_time),
                        onTap: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (time != null) {
                            setDialogState(() {
                              _scheduleEndTime = time;
                            });
                          }
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Localização',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    setDialogState(() {
                      _scheduleLocation = value;
                    });
                  },
                ),
                const SizedBox(height: 16),
                const Text('Membros Escalados:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._members.map((member) {
                  final isSelected = _selectedMemberIdsForSchedule.contains(member['id']);
                  return CheckboxListTile(
                    title: Text(member['name'] ?? 'Membro'),
                    subtitle: member['role'] != null ? Text(member['role']) : null,
                    value: isSelected,
                    onChanged: (value) {
                      setDialogState(() {
                        if (value == true) {
                          _selectedMemberIdsForSchedule.add(member['id']);
                        } else {
                          _selectedMemberIdsForSchedule.remove(member['id']);
                        }
                      });
                    },
                  );
                }),
                const SizedBox(height: 8),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Observações',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                  onChanged: (value) {
                    setDialogState(() {
                      _scheduleNotes = value;
                    });
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: _scheduleTitle.isEmpty || _scheduleDate == null
                  ? null
                  : () => Navigator.pop(context, true),
              child: const Text('Criar Escala'),
            ),
          ],
        ),
      ),
    );

    if (result != true) return;

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      
      // Formatar data e hora
      DateTime scheduleDateTime = _scheduleDate!;
      if (_scheduleStartTime != null) {
        scheduleDateTime = DateTime(
          _scheduleDate!.year,
          _scheduleDate!.month,
          _scheduleDate!.day,
          _scheduleStartTime!.hour,
          _scheduleStartTime!.minute,
        );
      }

      await apiService.createMinistrySchedule(
        widget.ministry['id'],
        {
          'title': _scheduleTitle,
          'description': _scheduleDescription.isEmpty ? null : _scheduleDescription,
          'date': scheduleDateTime.toIso8601String(),
          'startTime': _scheduleStartTime != null
              ? '${_scheduleStartTime!.hour.toString().padLeft(2, '0')}:${_scheduleStartTime!.minute.toString().padLeft(2, '0')}'
              : null,
          'endTime': _scheduleEndTime != null
              ? '${_scheduleEndTime!.hour.toString().padLeft(2, '0')}:${_scheduleEndTime!.minute.toString().padLeft(2, '0')}'
              : null,
          'location': _scheduleLocation.isEmpty ? null : _scheduleLocation,
          'notes': _scheduleNotes.isEmpty ? null : _scheduleNotes,
          'assignedMemberIds': _selectedMemberIdsForSchedule,
        },
      );
      
      if (!mounted) return;
      
      // Limpar formulário
      setState(() {
        _scheduleTitle = '';
        _scheduleDescription = '';
        _scheduleDate = null;
        _scheduleStartTime = null;
        _scheduleEndTime = null;
        _scheduleLocation = '';
        _scheduleNotes = '';
        _selectedMemberIdsForSchedule = [];
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Escala criada com sucesso')),
      );
      
      // Recarregar escalas após um pequeno delay para garantir que o servidor processou
      await Future.delayed(const Duration(milliseconds: 500));
      await _loadSchedules();
    } catch (e) {
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao criar escala: ${e.toString()}')),
      );
    }
  }

  Future<void> _removeMember(String memberId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remover Membro'),
        content: const Text('Tem certeza que deseja remover este membro do ministério?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Remover', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      await apiService.removeMemberFromMinistry(widget.ministry['id'], memberId);
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Membro removido com sucesso')),
      );
      
      _loadMembers();
    } catch (e) {
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao remover membro: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.ministry['name'] ?? 'Ministério'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.people), text: 'Membros'),
            Tab(icon: Icon(Icons.calendar_today), text: 'Escalas'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Aba de Membros
          _buildMembersTab(),
          // Aba de Escalas
          _buildSchedulesTab(),
        ],
      ),
    );
  }

  Widget _buildMembersTab() {
    if (_isLoadingMembers) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMembers != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Erro ao carregar membros',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              _errorMembers!,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadMembers,
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            onPressed: _showAddMemberDialog,
            icon: const Icon(Icons.add),
            label: const Text('Adicionar Membro'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
        ),
        Expanded(
          child: _members.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.people_outline,
                        size: 64,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Nenhum membro cadastrado',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Adicione membros ao ministério',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _members.length,
                  itemBuilder: (context, index) {
                    final member = _members[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          child: Text(
                            (member['name'] ?? 'M').substring(0, 1).toUpperCase(),
                          ),
                        ),
                        title: Text(member['name'] ?? 'Membro'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (member['email'] != null)
                              Text(member['email']),
                            if (member['role'] != null)
                              Chip(
                                label: Text(member['role']),
                                padding: EdgeInsets.zero,
                                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                          ],
                        ),
                        trailing: member['memberId'] == _leaderId
                            ? const Chip(
                                label: Text('Líder'),
                                backgroundColor: Colors.blue,
                              )
                            : IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _removeMember(member['memberId']),
                              ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSchedulesTab() {
    if (_isLoadingSchedules) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorSchedules != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Erro ao carregar escalas',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              _errorSchedules!,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadSchedules,
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            onPressed: _showCreateScheduleDialog,
            icon: const Icon(Icons.add),
            label: const Text('Nova Escala'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
        ),
        Expanded(
          child: _schedules.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        size: 64,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Nenhuma escala agendada',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Crie escalas para organizar as atividades',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadSchedules,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _schedules.length,
                    itemBuilder: (context, index) {
                      final schedule = _schedules[index];
                      DateTime date;
                      try {
                        // Tentar parsear a data que pode vir em diferentes formatos
                        if (schedule['date'] is String) {
                          date = DateTime.parse(schedule['date']);
                        } else {
                          date = schedule['date'] as DateTime;
                        }
                      } catch (e) {
                        date = DateTime.now();
                      }
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const Icon(Icons.calendar_today),
                          title: Text(schedule['title'] ?? 'Escala'),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (schedule['description'] != null && schedule['description'].toString().isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Text(schedule['description']),
                                ),
                              Text(
                                DateFormat('dd/MM/yyyy').format(date),
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              if (schedule['startTime'] != null)
                                Text(
                                  '${schedule['startTime']}${schedule['endTime'] != null ? ' - ${schedule['endTime']}' : ''}',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              if (schedule['location'] != null && schedule['location'].toString().isNotEmpty)
                                Text(
                                  schedule['location'],
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              if (schedule['assignedMembers'] != null && schedule['assignedMembers'].isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text(
                                    '${schedule['assignedMembers'].length} membro(s) escalado(s)',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Theme.of(context).colorScheme.primary,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }
}

