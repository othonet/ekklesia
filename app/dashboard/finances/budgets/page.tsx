'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Target, TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

interface Budget {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  totalAmount: number
  spentAmount: number
  category: string | null
  active: boolean
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Budget | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    totalAmount: '',
    category: '',
  })

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/budgets', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.startDate || !formData.endDate || !formData.totalAmount) {
      alert('Nome, datas e valor total são obrigatórios')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = selected?.id ? `/api/budgets/${selected.id}` : '/api/budgets'
      const method = selected?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchBudgets()
        setDialogOpen(false)
        setSelected(null)
        setFormData({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          totalAmount: '',
          category: '',
        })
      } else {
        const error = await res.json().catch(() => ({}))
        alert(error.error || 'Erro ao salvar orçamento')
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      alert('Erro ao salvar orçamento. Tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir orçamento?')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      fetchBudgets()
    } catch (error) {
      console.error(error)
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

  const getProgressPercentage = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600'
    if (percentage >= 70) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Orçamentos</h1>
            <p className="text-muted-foreground">Gerencie orçamentos e acompanhe gastos</p>
          </div>
          <Button onClick={() => { setSelected(null); setFormData({ name: '', description: '', startDate: '', endDate: '', totalAmount: '', category: '' }); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Orçamento
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhum orçamento registrado ainda"
            description="Comece criando seu primeiro orçamento para controlar os gastos da igreja."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const progress = getProgressPercentage(budget.spentAmount, budget.totalAmount)
              const remaining = budget.totalAmount - budget.spentAmount

              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{budget.name}</CardTitle>
                        {budget.category && (
                          <p className="text-sm text-muted-foreground mt-1">{budget.category}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(budget)
                            setFormData({
                              name: budget.name,
                              description: budget.description || '',
                              startDate: budget.startDate.split('T')[0],
                              endDate: budget.endDate.split('T')[0],
                              totalAmount: budget.totalAmount.toString(),
                              category: budget.category || '',
                            })
                            setDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Período</span>
                        <span>
                          {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Orçado</span>
                        <span className="font-semibold">{formatCurrency(budget.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Gasto</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(budget.spentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Restante</span>
                        <span
                          className={`font-semibold ${
                            remaining >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{progress.toFixed(1)}% utilizado</span>
                        <span>{formatCurrency(budget.spentAmount)} / {formatCurrency(budget.totalAmount)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(progress)} transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {budget.description && (
                      <p className="text-sm text-muted-foreground">{budget.description}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Orçamento 2024"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Manutenção, Eventos"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Observações sobre o orçamento"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

