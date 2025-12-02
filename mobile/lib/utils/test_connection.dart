// Script para testar conexão com o servidor
// Execute: dart run lib/utils/test_connection.dart

import 'dart:io';

Future<void> main() async {
  final urls = [
    'http://192.168.1.161:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  print('🔍 Testando conexão com o servidor...\n');

  for (final url in urls) {
    print('Testando: $url');
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      
      final request = await client.getUrl(Uri.parse('$url/api/auth/member/login'));
      request.headers.set('Content-Type', 'application/json');
      
      final response = await request.close();
      print('✅ Status: ${response.statusCode}');
      print('✅ Headers: ${response.headers}');
      print('✅ Conexão OK!\n');
      
      client.close();
      break;
    } catch (e) {
      print('❌ Erro: $e\n');
    }
  }
}

