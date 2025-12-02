'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'

interface Asset {
  id?: string
  name?: string
  description?: string | null
  category?: string
  type?: string
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  purchaseDate?: string | null
  purchaseValue?: number | null
  currentValue?: number | null
  location?: string | null
  status?: string
  condition?: string
  notes?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  area?: number | null
  responsibleId?: string | null
}

interface Member {
  id: string
  name: string
}

interface AssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  onSuccess: () => void
}

export function AssetDialog({ open, onOpenChange, asset, onSuccess }: AssetDialogProps) {
  const { fetchWithAuth } = useApi()
  const [formData, setFormData] = useState<Asset>({
    name: '',
    description: '',
    category: 'EQUIPMENT',
    type: 'OTHER',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchaseValue: null,
    currentValue: null,
    location: '',
    status: 'ACTIVE',
    condition: 'GOOD',
    notes: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    area: null,
    responsibleId: '',
  })
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open])

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        description: asset.description || '',
        category: asset.category || 'EQUIPMENT',
        type: asset.type || 'OTHER',
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
        purchaseValue: asset.purchaseValue || null,
        currentValue: asset.currentValue || null,
        location: asset.location || '',
        status: asset.status || 'ACTIVE',
        condition: asset.condition || 'GOOD',
        notes: asset.notes || '',
        address: asset.address || '',
        city: asset.city || '',
        state: asset.state || '',
        zipCode: asset.zipCode || '',
        area: asset.area || null,
        responsibleId: asset.responsibleId || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'EQUIPMENT',
        type: 'OTHER',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        purchaseValue: null,
        currentValue: null,
        location: '',
        status: 'ACTIVE',
        condition: 'GOOD',
        notes: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        area: null,
        responsibleId: '',
      })
    }
  }, [asset, open])

  const fetchMembers = async () => {
    try {
      const { data, response } = await fetchWithAuth('/api/members?limit=1000', { showErrorToast: false })
      if (response.ok) {
        const membersData = data?.data || data
        setMembers(Array.isArray(membersData) ? membersData : [])
      }
    } catch (error) {
      // Erro já tratado
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = asset?.id ? `/api/assets/${asset.id}` : '/api/assets'
      const method = asset?.id ? 'PUT' : 'POST'

      // Limpar strings vazias e converter para null
      const submitData: any = {
        name: formData.name,
        category: formData.category,
        type: formData.type,
        status: formData.status || 'ACTIVE',
        condition: formData.condition || 'GOOD',
        description: formData.description && formData.description.trim() !== '' ? formData.description : null,
        brand: formData.brand && formData.brand.trim() !== '' ? formData.brand : null,
        model: formData.model && formData.model.trim() !== '' ? formData.model : null,
        serialNumber: formData.serialNumber && formData.serialNumber.trim() !== '' ? formData.serialNumber : null,
        purchaseDate: formData.purchaseDate && formData.purchaseDate.trim() !== '' ? formData.purchaseDate : null,
        purchaseValue: formData.purchaseValue ? parseFloat(String(formData.purchaseValue)) : null,
        currentValue: formData.currentValue ? parseFloat(String(formData.currentValue)) : null,
        location: formData.location && formData.location.trim() !== '' ? formData.location : null,
        notes: formData.notes && formData.notes.trim() !== '' ? formData.notes : null,
        address: formData.address && formData.address.trim() !== '' ? formData.address : null,
        city: formData.city && formData.city.trim() !== '' ? formData.city : null,
        state: formData.state && formData.state.trim() !== '' ? formData.state.toUpperCase() : null,
        zipCode: formData.zipCode && formData.zipCode.trim() !== '' ? formData.zipCode : null,
        area: formData.area ? parseFloat(String(formData.area)) : null,
        responsibleId: formData.responsibleId && formData.responsibleId !== '' && formData.responsibleId !== 'NONE' ? formData.responsibleId : null,
      }

      const { response } = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(submitData),
        showSuccessToast: true,
        successMessage: asset?.id ? 'Patrimônio atualizado com sucesso' : 'Patrimônio criado com sucesso',
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      // Erro já tratado pelo hook
    } finally {
      setLoading(false)
    }
  }

  const getTypeOptions = (category: string) => {
    const options: Record<string, Array<{ value: string; label: string }>> = {
      EQUIPMENT: [
        { value: 'SOUND_SYSTEM', label: 'Sistema de Som' },
        { value: 'VIDEO_SYSTEM', label: 'Sistema de Vídeo' },
        { value: 'LIGHTING', label: 'Iluminação' },
        { value: 'PROJECTOR', label: 'Projetor' },
        { value: 'OTHER', label: 'Outro' },
      ],
      INSTRUMENT: [
        { value: 'PIANO', label: 'Piano' },
        { value: 'GUITAR', label: 'Guitarra' },
        { value: 'DRUMS', label: 'Bateria' },
        { value: 'KEYBOARD', label: 'Teclado' },
        { value: 'OTHER', label: 'Outro' },
      ],
      PROPERTY: [
        { value: 'BUILDING', label: 'Prédio' },
        { value: 'LAND', label: 'Terreno' },
        { value: 'OTHER', label: 'Outro' },
      ],
      FURNITURE: [
        { value: 'CHAIR', label: 'Cadeira' },
        { value: 'TABLE', label: 'Mesa' },
        { value: 'PEW', label: 'Banco' },
        { value: 'OTHER', label: 'Outro' },
      ],
      VEHICLE: [
        { value: 'CAR', label: 'Carro' },
        { value: 'VAN', label: 'Van' },
        { value: 'BUS', label: 'Ônibus' },
        { value: 'OTHER', label: 'Outro' },
      ],
      TECHNOLOGY: [
        { value: 'COMPUTER', label: 'Computador' },
        { value: 'PROJECTOR', label: 'Projetor' },
        { value: 'OTHER', label: 'Outro' },
      ],
      OTHER: [
        { value: 'OTHER', label: 'Outro' },
      ],
    }
    return options[category] || options.OTHER
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? 'Editar Patrimônio' : 'Novo Patrimônio'}</DialogTitle>
          <DialogDescription>
            {asset ? 'Atualize as informações do patrimônio' : 'Cadastre um novo bem no inventário'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Sistema de Som Principal"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value, type: 'OTHER' })
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUIPMENT">Equipamento</SelectItem>
                  <SelectItem value="INSTRUMENT">Instrumento</SelectItem>
                  <SelectItem value="PROPERTY">Imóvel</SelectItem>
                  <SelectItem value="FURNITURE">Mobiliário</SelectItem>
                  <SelectItem value="VEHICLE">Veículo</SelectItem>
                  <SelectItem value="TECHNOLOGY">Tecnologia</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getTypeOptions(formData.category || 'EQUIPMENT').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                  <SelectItem value="MAINTENANCE">Em Manutenção</SelectItem>
                  <SelectItem value="DISPOSED">Descartado</SelectItem>
                  <SelectItem value="LOST">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condição</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCELLENT">Excelente</SelectItem>
                  <SelectItem value="GOOD">Bom</SelectItem>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="POOR">Ruim</SelectItem>
                  <SelectItem value="CRITICAL">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Sala de Som, Templo Principal"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ex: Yamaha"
              />
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Ex: MG16XU"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de Série</Label>
              <Input
                value={formData.serialNumber || ''}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Ex: SN123456"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data de Compra</Label>
              <Input
                type="date"
                value={formData.purchaseDate || ''}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor de Compra (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchaseValue || ''}
                onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Atual (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentValue || ''}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="0.00"
              />
            </div>
          </div>

          {formData.category === 'PROPERTY' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Informações do Imóvel</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={formData.zipCode || ''}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área (m²)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select
              value={formData.responsibleId || 'NONE'}
              onValueChange={(value) => setFormData({ ...formData, responsibleId: value === 'NONE' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um membro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Não especificado</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do bem"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : asset ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

