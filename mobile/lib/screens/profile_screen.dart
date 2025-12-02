import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../providers/auth_provider.dart';
import '../utils/translations.dart';
import '../services/profile_image_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  File? _profileImage;
  bool _isLoadingImage = false;

  @override
  void initState() {
    super.initState();
    _loadProfileImage();
  }

  Future<void> _loadProfileImage() async {
    setState(() {
      _isLoadingImage = true;
    });

    try {
      final imageFile = await ProfileImageService.getProfileImageFile();
      if (mounted) {
        setState(() {
          _profileImage = imageFile;
          _isLoadingImage = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingImage = false;
        });
      }
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 85,
    );

    if (pickedFile != null) {
      setState(() {
        _isLoadingImage = true;
      });

      try {
        final imageFile = File(pickedFile.path);
        final savedPath = await ProfileImageService.saveImageToLocal(imageFile);
        await ProfileImageService.saveProfileImagePath(savedPath);
        
        if (mounted) {
          setState(() {
            _profileImage = File(savedPath);
            _isLoadingImage = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoadingImage = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erro ao salvar imagem: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _removeImage() async {
    await ProfileImageService.removeProfileImage();
    if (mounted) {
      setState(() {
        _profileImage = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final member = authProvider.member;

    if (member == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meu Perfil'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card de informações básicas
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: _pickImage,
                          child: Stack(
                            children: [
                              CircleAvatar(
                                radius: 30,
                                backgroundColor: Theme.of(context).colorScheme.primary,
                                backgroundImage: _profileImage != null
                                    ? FileImage(_profileImage!)
                                    : null,
                                child: _profileImage == null
                                    ? Text(
                                        member.name[0].toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 24,
                                          color: Colors.white,
                                        ),
                                      )
                                    : null,
                              ),
                              if (_isLoadingImage)
                                Positioned.fill(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.3),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Center(
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    ),
                                  ),
                                ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).colorScheme.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.camera_alt,
                                    size: 16,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                member.name,
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              if (member.email != null)
                                Text(
                                  member.email!,
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (_profileImage != null)
                          IconButton(
                            icon: const Icon(Icons.delete_outline),
                            onPressed: _removeImage,
                            tooltip: 'Remover foto',
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Informações de contato
            _SectionTitle('Contato'),
            Card(
              child: Column(
                children: [
                  if (member.phone != null)
                    _InfoTile(
                      icon: Icons.phone,
                      label: 'Telefone',
                      value: member.phone!,
                    ),
                  if (member.phone2 != null)
                    _InfoTile(
                      icon: Icons.phone,
                      label: 'Telefone 2',
                      value: member.phone2!,
                    ),
                  if (member.email != null)
                    _InfoTile(
                      icon: Icons.email,
                      label: 'Email',
                      value: member.email!,
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Informações pessoais
            _SectionTitle('Informações Pessoais'),
            Card(
              child: Column(
                children: [
                  if (member.birthDate != null)
                    _InfoTile(
                      icon: Icons.cake,
                      label: 'Data de Nascimento',
                      value: DateFormat('dd/MM/yyyy').format(member.birthDate!),
                    ),
                  if (member.maritalStatus != null)
                    _InfoTile(
                      icon: Icons.favorite,
                      label: 'Estado Civil',
                      value: Translations.translateMaritalStatus(member.maritalStatus),
                    ),
                  if (member.profession != null)
                    _InfoTile(
                      icon: Icons.work,
                      label: 'Profissão',
                      value: member.profession!,
                    ),
                  if (member.education != null)
                    _InfoTile(
                      icon: Icons.school,
                      label: 'Escolaridade',
                      value: member.education!,
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Endereço
            if (member.address != null || member.city != null)
              _SectionTitle('Endereço'),
            if (member.address != null || member.city != null)
              Card(
                child: Column(
                  children: [
                    if (member.address != null)
                      _InfoTile(
                        icon: Icons.location_on,
                        label: 'Endereço',
                        value: member.address!,
                      ),
                    if (member.city != null)
                      _InfoTile(
                        icon: Icons.location_city,
                        label: 'Cidade',
                        value: '${member.city}${member.state != null ? " - ${member.state}" : ""}',
                      ),
                    if (member.zipCode != null)
                      _InfoTile(
                        icon: Icons.pin,
                        label: 'CEP',
                        value: member.zipCode!,
                      ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
            
            // Informações da igreja
            if (member.church != null)
              _SectionTitle('Igreja'),
            if (member.church != null)
              Card(
                child: _InfoTile(
                  icon: Icons.church,
                  label: 'Igreja',
                  value: member.church!.name,
                ),
              ),
            const SizedBox(height: 16),
            
            // Botão de logout
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Sair'),
                      content: const Text('Tem certeza que deseja sair?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Cancelar'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('Sair'),
                        ),
                      ],
                    ),
                  );
                  
                  if (confirm == true && context.mounted) {
                    await authProvider.logout();
                    if (context.mounted) {
                      Navigator.of(context).pushReplacementNamed('/login');
                    }
                  }
                },
                icon: const Icon(Icons.logout),
                label: const Text('Sair'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      subtitle: Text(value),
    );
  }
}

