import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_service.dart';
import 'profile_screen.dart';
import 'ministries_screen.dart';
import 'courses_screen.dart';
import 'certificates_screen.dart';
import 'events_screen.dart';
import 'privacy_screen.dart';
import 'schedule_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const DashboardTab(),
    const MinistriesScreen(),
    const CoursesScreen(),
    const EventsScreen(),
    const CertificatesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Início',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.group),
            label: 'Ministérios',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.school),
            label: 'Cursos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.event),
            label: 'Eventos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.verified),
            label: 'Certificados',
          ),
        ],
      ),
    );
  }
}

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  bool _hasTriedLoad = false;

  @override
  void initState() {
    super.initState();
    // Garantir que o membro seja carregado quando a tela aparecer
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.member == null && !authProvider.isLoading && !_hasTriedLoad) {
        _hasTriedLoad = true;
        authProvider.loadMember();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final member = authProvider.member;
    final isLoading = authProvider.isLoading;
    final error = authProvider.error;

    if (isLoading && member == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null && member == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Início')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Erro ao carregar dados',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                error,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => authProvider.loadMember(),
                child: const Text('Tentar Novamente'),
              ),
            ],
          ),
        ),
      );
    }

    if (member == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Início')),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Início'),
        actions: [
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, _) {
              return IconButton(
                icon: Icon(
                  themeProvider.themeMode == ThemeMode.dark
                      ? Icons.light_mode
                      : themeProvider.themeMode == ThemeMode.light
                          ? Icons.dark_mode
                          : Icons.brightness_auto,
                ),
                onPressed: () => themeProvider.toggleTheme(),
                tooltip: 'Alternar tema',
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              );
            },
            tooltip: 'Perfil',
          ),
          IconButton(
            icon: const Icon(Icons.security),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PrivacyScreen()),
              );
            },
            tooltip: 'Privacidade',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => authProvider.loadMember(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Card de boas-vindas otimizado
              Card(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: LinearGradient(
                      colors: [
                        Theme.of(context).colorScheme.primary,
                        Theme.of(context).colorScheme.primary.withOpacity(0.8),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Olá,',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              member.name,
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (member.church != null) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(
                                    Icons.church,
                                    size: 16,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    member.church!.name,
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.white.withOpacity(0.9),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.person,
                          size: 32,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Resumo
              Text(
                'Resumo',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: _SummaryCard(
                      icon: Icons.group,
                      label: 'Ministérios',
                      value: member.ministries?.length.toString() ?? '0',
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _SummaryCard(
                      icon: Icons.school,
                      label: 'Cursos',
                      value: member.courses?.length.toString() ?? '0',
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _SummaryCard(
                      icon: Icons.verified,
                      label: 'Certificados',
                      value: member.certificates?.length.toString() ?? '0',
                      color: Colors.orange,
                    ),
                  ),
                  if (member.ministries != null && member.ministries!.isNotEmpty)
                    const SizedBox(width: 12),
                  if (member.ministries != null && member.ministries!.isNotEmpty)
                    Expanded(
                      child: _ScheduleCard(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const ScheduleScreen(),
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Próximas escalas (se houver ministérios)
              if (member.ministries != null && member.ministries!.isNotEmpty) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Próximas Escalas',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ScheduleScreen(),
                          ),
                        );
                      },
                      child: const Text('Ver todas'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Placeholder - será preenchido quando a tela de escalas for criada
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Suas escalas',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Toque para ver suas escalas de ministério',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          Icons.chevron_right,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _SummaryCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _ScheduleCard extends StatefulWidget {
  final VoidCallback onTap;

  const _ScheduleCard({required this.onTap});

  @override
  State<_ScheduleCard> createState() => _ScheduleCardState();
}

class _ScheduleCardState extends State<_ScheduleCard> {
  int _scheduleCount = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadScheduleCount();
  }

  Future<void> _loadScheduleCount() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final schedules = await apiService.getSchedules();
      
      if (mounted) {
        setState(() {
          _scheduleCount = schedules.length;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(Icons.calendar_today, color: Colors.purple, size: 32),
              const SizedBox(height: 8),
              _isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(
                      _scheduleCount.toString(),
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.purple,
                      ),
                    ),
              const SizedBox(height: 4),
              Text(
                'Escalas',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

