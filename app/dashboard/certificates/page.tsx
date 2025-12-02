'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Download, Search, Eye, CheckCircle2 } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CertificateDialog } from '@/components/certificate-dialog'
import { useCache } from '@/hooks/use-cache'
import { useDebounce } from '@/hooks/use-debounce'

interface Certificate {
  id: string
  certificateNumber: string
  type: string
  title: string
  issuedDate: string
  member: {
    name: string
  }
  revoked: boolean
  active: boolean
}

export default function CertificatesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Debounce da busca
  const debouncedSearch = useDebounce(search, 500)

  // Cache de certificados
  const cacheKey = `certificates_type_${typeFilter}`
  const { data: certificates = [], loading, refresh: refreshCertificates } = useCache<Certificate[]>(
    cacheKey,
    async () => {
      const token = localStorage.getItem('token')
      const url = typeFilter !== 'all' 
        ? `/api/certificates?type=${typeFilter}`
        : '/api/certificates'
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data : []
      }
      return []
    },
    { cacheDuration: 5 * 60 * 1000 } // 5 minutos
  )

  // Filtrar localmente com debounce
  const filteredCertificates = (certificates || []).filter(cert =>
    (cert.member?.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (cert.certificateNumber || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (cert.title || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const fetchCertificates = async () => {
    await refreshCertificates()
  }

  const getTypeLabel = (type: string) => {
    const types = {
      BAPTISM: 'Batismo',
      COURSE: 'Curso',
      EVENT: 'Evento',
    }
    return types[type as keyof typeof types] || type
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      BAPTISM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      COURSE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      EVENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleView = (certificate: Certificate) => {
    const baseUrl = window.location.origin
    const url = `${baseUrl}/validate-certificate?number=${certificate.certificateNumber}&hash=${certificate.validationHash}`
    window.open(url, '_blank')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Certificados</h1>
            <p className="text-muted-foreground">Gerencie os certificados emitidos pela igreja</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/validate-certificate')}
              title="Validar certificado"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Validar Certificado
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Award className="h-4 w-4 mr-2" />
              Emitir Certificado
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar certificados..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="BAPTISM">Batismo</SelectItem>
                  <SelectItem value="COURSE">Curso</SelectItem>
                  <SelectItem value="EVENT">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCertificates.length === 0 ? (
              <EmptyState
                icon={Award}
                title={search || typeFilter !== 'all' ? "Nenhum certificado encontrado" : "Nenhum certificado emitido ainda"}
                description={search || typeFilter !== 'all' ? "Tente buscar com outros termos ou filtros." : "Comece emitindo certificados para membros da igreja."}
              />
            ) : (
              <div className="space-y-2">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cert.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${getTypeBadge(cert.type)}`}>
                            {getTypeLabel(cert.type)}
                          </span>
                          {cert.revoked && (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Revogado
                            </span>
                          )}
                          {!cert.active && (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                              Inativo
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {cert.member?.name || 'Membro não encontrado'} • Emitido em {formatDate(cert.issuedDate)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {cert.certificateNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/certificates/${cert.id}/validation-image`)}
                        title="Gerar imagem de validação"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(cert)}
                        title="Validar certificado"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CertificateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchCertificates}
        />
      </div>
    </DashboardLayout>
  )
}

