# Scripts Úteis

## Gerar Chave de Criptografia

Para gerar uma chave de criptografia de 32 bytes (256 bits) em formato hexadecimal:

```bash
npm run generate:encryption-key
```

Ou diretamente:

```bash
node scripts/generate-encryption-key.js
```

### O que fazer com a chave gerada:

1. Copie a chave gerada
2. Adicione ao arquivo `.env`:
   ```
   ENCRYPTION_KEY=sua-chave-aqui
   ```
3. **IMPORTANTE**: Mantenha esta chave em segredo e faça backup seguro

### Alternativas para gerar a chave:

#### Opção 1: Usando Node.js (recomendado)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Opção 2: Usando OpenSSL
```bash
openssl rand -hex 32
```

#### Opção 3: Usando PowerShell (Windows)
```powershell
-join ((1..64) | ForEach-Object {'{0:X}' -f (Get-Random -Maximum 16)})
```

### ⚠️ Avisos Importantes:

- **Nunca compartilhe** a chave publicamente
- **Faça backup** da chave em local seguro
- **Se perder a chave**, não será possível descriptografar dados antigos
- Use uma chave **diferente para cada ambiente** (desenvolvimento, produção)
- A chave deve ter **exatamente 64 caracteres hexadecimais** (32 bytes)

