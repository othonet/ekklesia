# 🧪 Como Testar a Conexão do App

## Teste Rápido (2 minutos)

### 1. Verificar se o servidor está acessível

**No navegador do celular:**
- Abra o navegador
- Digite: `http://192.168.1.161:3000`
- **Deve carregar a página do sistema**

**Se não carregar:**
- O servidor não está acessível na rede
- Veja `../DIAGNOSTICO_CONEXAO.md`

### 2. Verificar se a API responde

**No navegador do celular:**
- Digite: `http://192.168.1.161:3000/api/auth/member/login`
- **Deve retornar um JSON** (mesmo que seja erro, isso é bom!)

### 3. Verificar configuração no app

1. Abra o app
2. Na tela de login, toque em **"Configurações da API"**
3. Verifique se a URL está: `http://192.168.1.161:3000`
4. Se não estiver, configure e salve

### 4. Tentar fazer login

- Use as credenciais criadas pelo administrador
- Verifique os logs no console do app

## 🔍 Logs do App

O app mostra informações detalhadas:

```
🔐 Tentando login com email: seu@email.com
🌐 URL Base: http://192.168.1.161:3000
🌐 URL Completa: http://192.168.1.161:3000/api/auth/member/login
✅ Status: 200
✅ Token armazenado com sucesso
```

Ou se houver erro:

```
❌ Erro: Erro de conexão. Verifique sua internet...
```

## ❌ Problemas Comuns

### "Erro de conexão"
- Servidor não está rodando
- IP incorreto
- Firewall bloqueando
- Rede diferente

### "Endpoint não encontrado"
- URL incorreta
- Servidor não está acessível externamente

### "Tempo de conexão esgotado"
- Servidor não está respondendo
- IP incorreto
- Firewall bloqueando

## ✅ Checklist

- [ ] Servidor rodando com `npm run dev -- -H 0.0.0.0`
- [ ] Acessível no navegador do celular: `http://192.168.1.161:3000`
- [ ] API responde: `http://192.168.1.161:3000/api/auth/member/login`
- [ ] App configurado com URL correta
- [ ] Celular e computador na mesma rede Wi-Fi
- [ ] Firewall permitindo porta 3000

