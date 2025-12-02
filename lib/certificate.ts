import crypto from 'crypto'

/**
 * Gera um número único de certificado
 */
export function generateCertificateNumber(): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `CERT-${timestamp}-${random}`
}

/**
 * Gera um hash de validação único para o certificado
 * Inclui informações críticas para detectar falsificações
 */
export function generateValidationHash(
  certificateNumber: string,
  memberId: string,
  memberName: string,
  type: string,
  title: string,
  issuedDate: Date,
  secret: string
): string {
  // Incluir informações críticas no hash para detectar alterações
  // Se alguém alterar o nome ou título, o hash não corresponderá
  const normalizedName = memberName.trim().toUpperCase()
  const normalizedTitle = title.trim().toUpperCase()
  const data = `${certificateNumber}-${memberId}-${normalizedName}-${type}-${normalizedTitle}-${issuedDate.toISOString()}-${secret}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Gera hash no formato antigo (compatibilidade retroativa)
 */
function generateValidationHashLegacy(
  certificateNumber: string,
  memberId: string,
  type: string,
  issuedDate: Date,
  secret: string
): string {
  const data = `${certificateNumber}-${memberId}-${type}-${issuedDate.toISOString()}-${secret}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Valida um hash de certificado
 * Verifica se o hash corresponde às informações do certificado
 * Suporta tanto o formato novo (com nome e título) quanto o formato antigo (compatibilidade retroativa)
 */
export function validateCertificateHash(
  hash: string,
  certificateNumber: string,
  memberId: string,
  memberName: string,
  type: string,
  title: string,
  issuedDate: Date,
  secret: string
): boolean {
  // Tentar validação com formato novo (mais seguro)
  const expectedHashNew = generateValidationHash(
    certificateNumber,
    memberId,
    memberName,
    type,
    title,
    issuedDate,
    secret
  )
  
  if (hash === expectedHashNew) {
    return true
  }
  
  // Se falhar, tentar formato antigo (compatibilidade retroativa)
  const expectedHashLegacy = generateValidationHashLegacy(
    certificateNumber,
    memberId,
    type,
    issuedDate,
    secret
  )
  
  return hash === expectedHashLegacy
}

/**
 * Gera URL do QR Code para validação
 */
export function generateQRCodeUrl(certificateNumber: string, hash: string, baseUrl: string): string {
  return `${baseUrl}/validate-certificate?number=${certificateNumber}&hash=${hash}`
}

