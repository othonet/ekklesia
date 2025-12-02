'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Search, Eye, Package, Filter } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApi } from '@/hooks/use-api'
import { useCache } from '@/hooks/use-cache'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  area: number | null
  responsible: {
    id: string
    name: string
  } | null
}

export default function AssetsPage() {
  const router = useRouter()
  const { fetchWithAuth } = useApi()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Debounce da busca
  const debouncedSearch = useDebounce(search, 500)

  // Cache de assets com filtros e paginação
  const cacheKey = `assets_page_${page}_search_${debouncedSearch}_cat_${categoryFilter}_status_${statusFilter}`
  const { data: assetsData, loading, refresh: refreshAssets } = useCache<{
    data: Asset[]
    pagination?: { totalPages: number }
  }>(
    cacheKey,
    async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (categoryFilter) params.append('category', categoryFilter)
      if (statusFilter) params.append('status', statusFilter)

      const { data, response } = await fetchWithAuth(
        `/api/assets?${params.toString()}`,
        { showErrorToast: false }
      )

      if (response.ok) {
        if (data && data.pagination) {
          return { data: data.data || [], pagination: data.pagination }
        } else if (Array.isArray(data)) {
          return { data, pagination: { totalPages: 1 } }
        }
      }
      return { data: [], pagination: { totalPages: 1 } }
    },
    { cacheDuration: 2 * 60 * 1000 } // 2 minutos
  )

  const assets = assetsData?.data || []
  const pagination = assetsData?.pagination

  useEffect(() => {
    if (pagination) {
      setTotalPages(pagination.totalPages || 1)
    }
  }, [pagination])

  // Resetar página quando filtros mudarem
  useEffect(() => {
    if (page !== 1) {
      setPage(1)
    }
  }, [debouncedSearch, categoryFilter, statusFilter])

  const fetchAssets = async () => {
    await refreshAssets()
  }

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!assetToDelete) return

    try {
      const { response } = await fetchWithAuth(
        `/api/assets/${assetToDelete.id}`,
        {
          method: 'DELETE',
          showSuccessToast: true,
          successMessage: 'Patrimônio excluído com sucesso',
        }
      )

      if (response.ok) {
        fetchAssets()
      }
    } catch (error) {
      // Erro já tratado pelo hook
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      DISPOSED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || colors.INACTIVE
  }

  const getConditionBadge = (condition: string) => {
    const colors: Record<string, string> = {
      EXCELLENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      GOOD: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      REGULAR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      POOR: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[condition] || colors.REGULAR
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      MAINTENANCE: 'Manutenção',
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
    if (value === null) return 'N/D'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // A busca já é feita pela API, então usamos assets diretamente
  const filteredAssets = assets

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Patrimônio</h1>
            <p className="text-muted-foreground">Gerencie o inventário de bens da igreja</p>
          </div>
          <Button onClick={() => { setSelectedAsset(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Bem
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar patrimônio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={categoryFilter || 'ALL'} onValueChange={(value) => setCategoryFilter(value === 'ALL' ? '' : value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas as categorias</SelectItem>
                    <SelectItem value="EQUIPMENT">Equipamento</SelectItem>
                    <SelectItem value="INSTRUMENT">Instrumento</SelectItem>
                    <SelectItem value="PROPERTY">Imóvel</SelectItem>
                    <SelectItem value="FURNITURE">Mobiliário</SelectItem>
                    <SelectItem value="VEHICLE">Veículo</SelectItem>
                    <SelectItem value="TECHNOLOGY">Tecnologia</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter || 'ALL'} onValueChange={(value) => setStatusFilter(value === 'ALL' ? '' : value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os status</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                    <SelectItem value="MAINTENANCE">Em Manutenção</SelectItem>
                    <SelectItem value="DISPOSED">Descartado</SelectItem>
                    <SelectItem value="LOST">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-5 w-24 bg-muted animate-pulse rounded-full" />
                        <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                        <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                      <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                      <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <EmptyState
                icon={Package}
                title={search ? "Nenhum patrimônio encontrado" : "Nenhum patrimônio cadastrado ainda"}
                description={search ? "Tente buscar com outros termos." : "Comece cadastrando o primeiro bem do patrimônio."}
              />
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{asset.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryLabel(asset.category) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}`}>
                          {getCategoryLabel(asset.category)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(asset.status)}`}>
                          {getStatusLabel(asset.status)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getConditionBadge(asset.condition)}`}>
                          {getConditionLabel(asset.condition)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {asset.brand && asset.model && (
                          <span>{asset.brand} {asset.model}</span>
                        )}
                        {asset.location && (
                          <span className="ml-2">📍 {asset.location}</span>
                        )}
                        {asset.responsible && (
                          <span className="ml-2">👤 {asset.responsible.name}</span>
                        )}
                        {asset.currentValue && (
                          <span className="ml-2">💰 {formatCurrency(asset.currentValue)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/assets/${asset.id}`)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedAsset(asset); setDialogOpen(true) }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(asset)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AssetDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          asset={selectedAsset}
          onSuccess={fetchAssets}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Excluir Patrimônio"
          description={`Tem certeza que deseja excluir o patrimônio "${assetToDelete?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
        />

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


