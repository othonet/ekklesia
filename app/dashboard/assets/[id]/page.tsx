'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Package } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { AssetDialog } from '@/components/asset-dialog'

interface Asset {
  id: string
  name: string
  description: string | null
  category: string
  type: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  purchaseDate: string | null
  purchaseValue: number | null
  currentValue: number | null
  location: string | null
  status: string
  condition: string
  notes: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  area: number | null
  responsible: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  createdAt: string
  updatedAt: string
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { fetchWithAuth } = useApi()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAsset()
    }
  }, [params.id])

  const fetchAsset = async () => {
    try {
      setLoading(true)
      const { data, response } = await fetchWithAuth(
        `/api/assets/${params.id}`,
        { showErrorToast: false }
      )

      if (response.ok) {
        setAsset(data)
      } else {
        router.push('/dashboard/assets')
      }
    } catch (error) {
      router.push('/dashboard/assets')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      EQUIPMENT: 'Equipamento',
      INSTRUMENT: 'Instrumento',
      PROPERTY: 'Imóvel',
      FURNITURE: 'Mobiliário',
      VEHICLE: 'Veículo',
      TECHNOLOGY: 'Tecnologia',
      OTHER: 'Outro',
    }
    return labels[category] || category
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SOUND_SYSTEM: 'Sistema de Som',
      VIDEO_SYSTEM: 'Sistema de Vídeo',
      LIGHTING: 'Iluminação',
      PIANO: 'Piano',
      GUITAR: 'Guitarra',
      DRUMS: 'Bateria',
      KEYBOARD: 'Teclado',
      BUILDING: 'Prédio',
      LAND: 'Terreno',
      CHAIR: 'Cadeira',
      TABLE: 'Mesa',
      PEW: 'Banco',
      CAR: 'Carro',
      VAN: 'Van',
      BUS: 'Ônibus',
      COMPUTER: 'Computador',
      PROJECTOR: 'Projetor',
      OTHER: 'Outro',
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      MAINTENANCE: 'Em Manutenção',
      DISPOSED: 'Descartado',
      LOST: 'Perdido',
    }
    return labels[status] || status
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      EXCELLENT: 'Excelente',
      GOOD: 'Bom',
      REGULAR: 'Regular',
      POOR: 'Ruim',
      CRITICAL: 'Crítico',
    }
    return labels[condition] || condition
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Não informado'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              <div className="space-y-2">
                <div className="h-9 w-64 bg-muted animate-pulse rounded" />
                <div className="h-5 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-4">
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!asset) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Patrimônio não encontrado</p>
          <Button onClick={() => router.push('/dashboard/assets')} className="mt-4">
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/assets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{asset.name}</h1>
              <p className="text-muted-foreground">Detalhes do patrimônio</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Categoria:</span>
                <p className="text-sm">{getCategoryLabel(asset.category)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
                <p className="text-sm">{getTypeLabel(asset.type)}</p>
              </div>
              {asset.brand && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Marca:</span>
                  <p className="text-sm">{asset.brand}</p>
                </div>
              )}
              {asset.model && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Modelo:</span>
                  <p className="text-sm">{asset.model}</p>
                </div>
              )}
              {asset.serialNumber && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Número de Série:</span>
                  <p className="text-sm font-mono">{asset.serialNumber}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <p className="text-sm">{getStatusLabel(asset.status)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Condição:</span>
                <p className="text-sm">{getConditionLabel(asset.condition)}</p>
              </div>
              {asset.location && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Localização:</span>
                  <p className="text-sm">{asset.location}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {asset.purchaseDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Data de Compra:</span>
                  <p className="text-sm">{formatDate(asset.purchaseDate)}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-muted-foreground">Valor de Compra:</span>
                <p className="text-sm">{formatCurrency(asset.purchaseValue)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Valor Atual:</span>
                <p className="text-sm font-semibold">{formatCurrency(asset.currentValue)}</p>
              </div>
              {asset.purchaseValue && asset.currentValue && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Depreciação:</span>
                  <p className={`text-sm ${asset.currentValue < asset.purchaseValue ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(asset.currentValue - asset.purchaseValue)}
                    {' '}
                    ({((asset.currentValue / asset.purchaseValue - 1) * 100).toFixed(1)}%)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {asset.category === 'PROPERTY' && (asset.address || asset.city || asset.area) && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Imóvel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {asset.address && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Endereço:</span>
                    <p className="text-sm">{asset.address}</p>
                  </div>
                )}
                {(asset.city || asset.state) && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Cidade/Estado:</span>
                    <p className="text-sm">
                      {asset.city || ''} {asset.state ? `- ${asset.state}` : ''}
                    </p>
                  </div>
                )}
                {asset.zipCode && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">CEP:</span>
                    <p className="text-sm">{asset.zipCode}</p>
                  </div>
                )}
                {asset.area && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Área:</span>
                    <p className="text-sm">{asset.area.toLocaleString('pt-BR')} m²</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {asset.responsible && (
            <Card>
              <CardHeader>
                <CardTitle>Responsável</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Nome:</span>
                  <p className="text-sm">{asset.responsible.name}</p>
                </div>
                {asset.responsible.email && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <p className="text-sm">{asset.responsible.email}</p>
                  </div>
                )}
                {asset.responsible.phone && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Telefone:</span>
                    <p className="text-sm">{asset.responsible.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(asset.description || asset.notes) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Descrição e Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {asset.description && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Descrição:</span>
                    <p className="text-sm whitespace-pre-wrap">{asset.description}</p>
                  </div>
                )}
                {asset.notes && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Observações:</span>
                    <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Cadastrado em:</span>
                <p className="text-sm">{formatDate(asset.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Última atualização:</span>
                <p className="text-sm">{formatDate(asset.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AssetDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          asset={asset}
          onSuccess={() => {
            fetchAsset()
            setDialogOpen(false)
          }}
        />
      </div>
    </DashboardLayout>
  )
}

