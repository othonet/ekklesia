'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, Loader2, Award, QrCode, Camera, X, ArrowLeft } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

interface ValidationResult {
  isValid: boolean
  certificate?: {
    number: string
    type: string
    title: string
    description?: string
    issuedDate: string
    issuedBy?: string
    member: {
      name: string
    }
    baptism?: {
      date: string
      location?: string
      minister?: string
    }
    course?: {
      name: string
      description?: string
    }
    event?: {
      title: string
      date: string
      type: string
    }
    church: {
      name: string
    }
  }
  error?: string
  revoked?: boolean
  expired?: boolean
}

export default function ValidateCertificatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [number, setNumber] = useState(searchParams.get('number') || '')
  const [hash, setHash] = useState(searchParams.get('hash') || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrCodeRegionId = 'qr-reader'

  useEffect(() => {
    if (number && hash) {
      validateCertificate()
    }
  }, [])

  useEffect(() => {
    // Cleanup ao desmontar
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setScanError(null)
      setScanning(true)
      
      const html5QrCode = new Html5Qrcode(qrCodeRegionId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' }, // Usar câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR Code escaneado com sucesso
          handleQRCodeScanned(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Ignorar erros de leitura (normal durante o scan)
        }
      )
    } catch (error: any) {
      console.error('Erro ao iniciar scanner:', error)
      setScanError(error.message || 'Erro ao acessar a câmera. Verifique as permissões.')
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch (error) {
      console.error('Erro ao parar scanner:', error)
    } finally {
      setScanning(false)
    }
  }

  const handleQRCodeScanned = (url: string) => {
    try {
      // Extrair parâmetros da URL
      const urlObj = new URL(url)
      const numberParam = urlObj.searchParams.get('number')
      const hashParam = urlObj.searchParams.get('hash')

      if (numberParam && hashParam) {
        setNumber(numberParam)
        setHash(hashParam)
        // Validar automaticamente após escanear
        setTimeout(() => {
          validateCertificate()
        }, 100)
      } else {
        setScanError('QR Code inválido. Certifique-se de que é um certificado válido.')
      }
    } catch (error) {
      setScanError('Erro ao processar QR Code. Verifique se é um certificado válido.')
    }
  }

  const validateCertificate = async () => {
    if (!number || !hash) {
      setResult({ isValid: false, error: 'Por favor, preencha o número do certificado e o hash' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/certificates/validate?number=${encodeURIComponent(number)}&hash=${encodeURIComponent(hash)}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ isValid: false, error: 'Erro ao validar certificado' })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getTypeLabel = (type: string) => {
    const types = {
      BAPTISM: 'Certificado de Batismo',
      COURSE: 'Certificado de Conclusão de Curso',
      EVENT: 'Certificado de Participação em Evento',
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/certificates')}
            title="Voltar para Certificados"
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Validação de Certificado</h1>
            <p className="text-muted-foreground">Verifique a autenticidade de um certificado emitido pela igreja</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Certificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botão para escanear QR Code */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={scanning ? "destructive" : "outline"}
                onClick={scanning ? stopScanning : startScanning}
                className="flex-1"
                disabled={loading}
              >
                {scanning ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Parar Scanner
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Escanear QR Code
                  </>
                )}
              </Button>
            </div>

            {/* Área do scanner */}
            {scanning && (
              <div className="space-y-2">
                <Label>Posicione o QR Code do certificado na câmera</Label>
                <div className="relative border-2 border-dashed border-primary rounded-lg overflow-hidden">
                  <div id={qrCodeRegionId} className="w-full" style={{ minHeight: '300px' }} />
                </div>
                {scanError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {scanError}
                  </div>
                )}
              </div>
            )}

            {/* Divisor */}
            {scanning && (
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t" />
                <span className="text-sm text-muted-foreground">OU</span>
                <div className="flex-1 border-t" />
              </div>
            )}

            {/* Campos de entrada manual */}
            <div className="space-y-2">
              <Label htmlFor="number">Número do Certificado</Label>
              <Input
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="CERT-1234567890-ABCDEF"
                disabled={scanning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hash">Hash de Validação</Label>
              <Input
                id="hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Hash de validação do certificado"
                disabled={scanning}
              />
            </div>
            <Button 
              onClick={validateCertificate} 
              disabled={loading || !number || !hash || scanning} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Validar Certificado
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.isValid ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Certificado Válido
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-600" />
                    Certificado Inválido
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.isValid && result.certificate ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Award className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="font-semibold text-lg">{result.certificate.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {getTypeLabel(result.certificate.type)}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Membro</div>
                      <div className="text-lg">{result.certificate.member.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Igreja</div>
                      <div className="text-lg">{result.certificate.church.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Número do Certificado</div>
                      <div className="text-lg font-mono">{result.certificate.number}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Data de Emissão</div>
                      <div className="text-lg">{formatDate(result.certificate.issuedDate)}</div>
                    </div>
                    {result.certificate.issuedBy && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Emitido por</div>
                        <div className="text-lg">{result.certificate.issuedBy}</div>
                      </div>
                    )}
                  </div>

                  {result.certificate.baptism && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-semibold mb-2">Informações do Batismo</div>
                      <div className="text-sm space-y-1">
                        <div>Data: {formatDate(result.certificate.baptism.date)}</div>
                        {result.certificate.baptism.location && (
                          <div>Local: {result.certificate.baptism.location}</div>
                        )}
                        {result.certificate.baptism.minister && (
                          <div>Ministro: {result.certificate.baptism.minister}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {result.certificate.course && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-semibold mb-2">Informações do Curso</div>
                      <div className="text-sm space-y-1">
                        <div>Curso: {result.certificate.course.name}</div>
                        {result.certificate.course.description && (
                          <div>{result.certificate.course.description}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {result.certificate.event && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="font-semibold mb-2">Informações do Evento</div>
                      <div className="text-sm space-y-1">
                        <div>Evento: {result.certificate.event.title}</div>
                        <div>Data: {formatDate(result.certificate.event.date)}</div>
                        <div>Tipo: {result.certificate.event.type}</div>
                      </div>
                    </div>
                  )}

                  {result.certificate.description && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <div className="text-sm">{result.certificate.description}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    {result.error || 'Certificado inválido'}
                  </div>
                  {result.revoked && (
                    <div className="text-sm text-muted-foreground">
                      Este certificado foi revogado e não é mais válido.
                    </div>
                  )}
                  {result.expired && (
                    <div className="text-sm text-muted-foreground">
                      Este certificado expirou e não é mais válido.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

