import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/member.dart';
import '../utils/translations.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  List<CourseInfo>? _courses;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  Future<void> _loadCourses() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authService: authProvider.authService);
      final courses = await apiService.getCourses();
      
      if (!mounted) return;
      
      setState(() {
        _courses = courses;
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
        title: const Text('Meus Cursos'),
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
                        onPressed: _loadCourses,
                        child: const Text('Tentar Novamente'),
                      ),
                    ],
                  ),
                )
              : _courses == null || _courses!.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.school_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Nenhum curso encontrado',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadCourses,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _courses!.length,
                        itemBuilder: (context, index) {
                          final course = _courses![index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.green.withValues(alpha: 0.1),
                                child: const Icon(Icons.school, color: Colors.green),
                              ),
                              title: Text(
                                course.name,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (course.description != null) ...[
                                    const SizedBox(height: 4),
                                    Text(course.description!),
                                  ],
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Chip(
                                        label: Text(
                                          _getStatusLabel(course.status),
                                          style: const TextStyle(fontSize: 12),
                                        ),
                                        padding: EdgeInsets.zero,
                                      ),
                                      if (course.certificate)
                                        const Padding(
                                          padding: EdgeInsets.only(left: 8),
                                          child: Icon(
                                            Icons.verified,
                                            color: Colors.green,
                                            size: 20,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Início: ${DateFormat('MM/yyyy').format(course.startDate)}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  if (course.endDate != null)
                                    Text(
                                      'Término: ${DateFormat('MM/yyyy').format(course.endDate!)}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  if (course.grade != null)
                                    Text(
                                      'Nota: ${course.grade}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
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

  String _getStatusLabel(String status) {
    return Translations.translateCourseStatus(status);
  }
}

