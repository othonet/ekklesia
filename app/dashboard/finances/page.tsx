'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Heart, Users, DollarSign } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { useCache } from '@/hooks/use-cache'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Finance {
  id: string
  description: string
  amount: number
  type: string
  category: string | null
  date: string
  donationType?: string | null
  method?: string | null
  memberId?: string | null
  member?: {
    id: string
    name: string
    email: string | null
  } | null
}

export default function FinancesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Finance | null>(null)
  const [formData, setFormData] = useState({ 
    description: '', 
    amount: '', 
    type: 'INCOME', 
    category: '', 
    date: '',
    donationType: '',
    method: '',
    memberId: ''
  })

  // Cache de finanças
  const { data: financesData, loading, refresh: refreshFinances } = useCache<Finance[]>(
    'finances',
    async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/finances?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const response = await res.json()
        const financesData = response?.data || response
        return Array.isArray(financesData) ? financesData : []
      }
      return []
    },
    { cacheDuration: 3 * 60 * 1000 } // 3 minutos
  )

  // Cache de membros (carregado em paralelo)
  const { data: membersData } = useCache<Array<{ id: string; name: string }>>(
    'members_list',
    async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/members?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const response = await res.json()
        const membersData = response?.data || response
        return Array.isArray(membersData) ? membersData : []
      }
      return []
    },
    { cacheDuration: 10 * 60 * 1000 } // 10 minutos (membros mudam menos)
  )

  const finances = financesData || []
  const members = membersData || []

  const fetchData = async () => {
    await refreshFinances()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = selected?.id ? `/api/finances/${selected.id}` : '/api/finances'
      const res = await fetch(url, {
        method: selected?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        fetchData()
        setDialogOpen(false)
        setSelected(null)
        setFormData({ 
          description: '', 
          amount: '', 
          type: 'INCOME', 
          category: '', 
          date: '',
          donationType: '',
          method: '',
          memberId: ''
        })
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        alert(errorData.error || 'Erro ao salvar registro financeiro')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar registro financeiro. Tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir registro?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/finances/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      if (res.ok) {
        fetchData()
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        alert(errorData.error || 'Erro ao excluir registro')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir registro. Tente novamente.')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Finanças</h1>
            <p className="text-muted-foreground">Gerencie receitas (dízimos, ofertas, doações) e despesas</p>
          </div>
          <Button onClick={() => { 
            setSelected(null)
            setFormData({ 
              description: '', 
              amount: '', 
              type: 'INCOME', 
              category: '', 
              date: '',
              donationType: '',
              method: '',
              memberId: ''
            })
            setDialogOpen(true) 
          }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Registro
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : finances.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Nenhum registro financeiro ainda"
            description="Comece registrando receitas (dízimos, ofertas, doações) ou despesas para manter o controle financeiro."
          />
        ) : (
          <div className="space-y-2">
            {finances.map((f) => (
              <Card key={f.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                      {f.type === 'INCOME' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{f.description}</h3>
                          {f.donationType && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {f.donationType === 'TITHE' ? 'Dízimo' : f.donationType === 'OFFERING' ? 'Oferta' : 'Contribuição'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(f.date)}
                          {f.category && ` • ${f.category}`}
                          {f.method && ` • ${f.method}`}
                          {f.member && f.member.name && (
                            <span className="flex items-center gap-1 ml-1">
                              <Users className="h-3 w-3" /> {f.member.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${f.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {f.type === 'INCOME' ? '+' : '-'} {formatCurrency(Math.abs(f.amount))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => { 
                        setSelected(f)
                        setFormData({ 
                          description: f.description, 
                          amount: f.amount.toString(), 
                          type: f.type, 
                          category: f.category || '', 
                          date: f.date.split('T')[0],
                          donationType: f.donationType || '',
                          method: f.method || '',
                          memberId: f.memberId || ''
                        })
                        setDialogOpen(true) 
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(f.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Receita</SelectItem>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.type === 'INCOME' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Doação</Label>
                      <Select 
                        value={formData.donationType || 'none'} 
                        onValueChange={(v) => setFormData({ ...formData, donationType: v === 'none' ? '' : v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não é doação</SelectItem>
                          <SelectItem value="TITHE">Dízimo</SelectItem>
                          <SelectItem value="OFFERING">Oferta</SelectItem>
                          <SelectItem value="CONTRIBUTION">Contribuição</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Método de Pagamento</Label>
                      <Input 
                        value={formData.method} 
                        onChange={(e) => setFormData({ ...formData, method: e.target.value })} 
                        placeholder="Ex: PIX, Dinheiro, Cartão"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Membro (opcional)</Label>
                    <Select 
                      value={formData.memberId || 'none'} 
                      onValueChange={(v) => setFormData({ ...formData, memberId: v === 'none' ? '' : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um membro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não especificado</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                {formData.type === 'EXPENSE' ? (
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select 
                      value={formData.category || 'none'} 
                      onValueChange={(v) => setFormData({ ...formData, category: v === 'none' ? '' : v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        <SelectItem value="Despesa fixa">Despesa fixa</SelectItem>
                        <SelectItem value="Despesas variável">Despesas variável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Manutenção, Eventos" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

