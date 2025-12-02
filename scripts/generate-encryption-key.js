const crypto = require('crypto')

// Gerar uma chave de 32 bytes (256 bits) em formato hexadecimal
const encryptionKey = crypto.randomBytes(32).toString('hex')

console.log('\n🔐 Chave de Criptografia Gerada:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(encryptionKey)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n📝 Adicione esta linha ao seu arquivo .env:')
console.log(`ENCRYPTION_KEY=${encryptionKey}`)
console.log('\n⚠️  IMPORTANTE:')
console.log('   - Mantenha esta chave em segredo!')
console.log('   - Não compartilhe esta chave publicamente')
console.log('   - Faça backup seguro desta chave')
console.log('   - Se perder a chave, não será possível descriptografar dados antigos')
console.log('\n')

