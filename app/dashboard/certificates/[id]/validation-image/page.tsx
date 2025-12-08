'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'
import dynamic from 'next/dynamic'
import { toPng } from 'html-to-image'

// Carregar QRCode dinamicamente para evitar problemas de SSR
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="w-[200px] h-[200px] bg-gray-200 animate-pulse rounded" />
})

interface Certificate {
  id: string
  certificateNumber: string
  validationHash: string
}

export default function ValidationImagePage() {
  const params = useParams()
  const router = useRouter()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [validationUrl, setValidationUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (params.id) {
      fetchCertificate()
    }
  }, [params.id])

  useEffect(() => {
    if (certificate) {
      const baseUrl = window.location.origin
      const url = `${baseUrl}/validate-certificate?number=${certificate.certificateNumber}&hash=${certificate.validationHash}`
      setValidationUrl(url)
    }
  }, [certificate])

  const fetchCertificate = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/certificates/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCertificate({
          id: data.id,
          certificateNumber: data.certificateNumber,
          validationHash: data.validationHash,
        })
      } else {
        router.push('/dashboard/certificates')
      }
    } catch (error) {
      console.error('Erro ao buscar certificado:', error)
      router.push('/dashboard/certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadImage = async () => {
    if (!imageRef.current || !certificate) return

    setGenerating(true)
    try {
      const dataUrl = await toPng(imageRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })

      const link = document.createElement('a')
      link.download = `certificado-${certificate.certificateNumber}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
      alert('Erro ao gerar imagem. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-9 w-64 bg-muted animate-pulse rounded" />
              <div className="h-5 w-96 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="rounded-lg border p-8 flex items-center justify-center">
            <div className="space-y-4 w-full max-w-md">
              <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
              <div className="h-6 w-48 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!certificate) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/certificates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Imagem de Validação</h1>
            <p className="text-muted-foreground">Gere uma imagem com QR Code e dados de validação para inserir no Word</p>
          </div>
          <Button onClick={handleDownloadImage} disabled={generating || !validationUrl}>
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'Gerando...' : 'Baixar Imagem'}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-4">
              Esta imagem contém o QR Code e as informações de validação do certificado. 
              Você pode inserir esta imagem em um modelo Word personalizado.
            </div>

            {/* Container da imagem - será convertido em PNG */}
            <div 
              ref={imageRef}
              className="bg-white p-8 border-2 border-gray-300 rounded-lg inline-block"
              style={{ minWidth: '400px' }}
            >
              <div className="flex flex-col items-center gap-6">
                {/* QR Code */}
                {validationUrl && (
                  <div className="flex justify-center">
                    <QRCodeSVG 
                      value={validationUrl} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                )}

                {/* Informações de validação */}
                <div className="text-center space-y-3 w-full">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">Número do Certificado</div>
                    <div className="text-sm font-mono font-bold text-gray-900 break-all">
                      {certificate.certificateNumber}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">Hash de Validação</div>
                    <div className="text-xs font-mono text-gray-700 break-all">
                      {certificate.validationHash}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              <p className="font-semibold mb-2">Como usar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Clique em &quot;Baixar Imagem&quot; para salvar a imagem PNG</li>
                <li>Abra seu modelo de certificado no Word</li>
                <li>Insira a imagem no local desejado (Inserir → Imagem)</li>
                <li>Imprima o certificado normalmente pelo Word</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

