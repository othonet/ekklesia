import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileImageService {
  static const String _imagePathKey = 'profile_image_path';

  /// Salva o caminho da imagem de perfil
  static Future<void> saveProfileImagePath(String imagePath) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_imagePathKey, imagePath);
  }

  /// Obtém o caminho da imagem de perfil salva
  static Future<String?> getProfileImagePath() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_imagePathKey);
  }

  /// Remove a imagem de perfil
  static Future<void> removeProfileImage() async {
    final prefs = await SharedPreferences.getInstance();
    final imagePath = prefs.getString(_imagePathKey);
    
    if (imagePath != null) {
      try {
        final file = File(imagePath);
        if (await file.exists()) {
          await file.delete();
        }
      } catch (e) {
        // Ignorar erros ao deletar arquivo
      }
    }
    
    await prefs.remove(_imagePathKey);
  }

  /// Obtém o arquivo da imagem de perfil se existir
  static Future<File?> getProfileImageFile() async {
    final imagePath = await getProfileImagePath();
    if (imagePath == null) return null;
    
    final file = File(imagePath);
    if (await file.exists()) {
      return file;
    }
    
    return null;
  }

  /// Salva a imagem no diretório de documentos do app
  static Future<String> saveImageToLocal(File imageFile) async {
    final directory = await getApplicationDocumentsDirectory();
    final fileName = 'profile_image_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final savedImage = await imageFile.copy('${directory.path}/$fileName');
    return savedImage.path;
  }
}

