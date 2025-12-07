'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BookOpen, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Discipleship {
  id: string
  title: string
  startDate: string
  endDate: string | null
  status: string
  discipler: string | null
  notes: string | null
}

export function DiscipleshipTab({ memberId }: { memberId: string }) {
  const [discipleships, setDiscipleships] = useState<Discipleship[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', startDate: '', endDate: '', status: 'IN_PROGRESS', discipler: '', notes: '' })

  useEffect(() => {
    fetchData()
  }, [memberId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/discipleships`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setDiscipleships(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingId 
        ? `/api/members/${memberId}/discipleships/${editingId}`
        : `/api/members/${memberId}/discipleships`
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate || null,
        }),
      })
      
      if (res.ok) {
        fetchData()
        setDialogOpen(false)
        setEditingId(null)
        setFormData({ title: '', startDate: '', endDate: '', status: 'IN_PROGRESS', discipler: '', notes: '' })
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar discipulado')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar discipulado')
    }
  }

  const handleEdit = (discipleship: Discipleship) => {
    // Formatar datas para o input type="date" (YYYY-MM-DD)
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    setEditingId(discipleship.id)
    setFormData({
      title: discipleship.title,
      startDate: formatDateForInput(discipleship.startDate),
      endDate: formatDateForInput(discipleship.endDate),
      status: discipleship.status,
      discipler: discipleship.discipler || '',
      notes: discipleship.notes || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (discipleshipId: string) => {
    if (!confirm('Tem certeza que deseja excluir este discipulado?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/discipleships/${discipleshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir discipulado')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao excluir discipulado')
    }
  }

  const handleNew = () => {
    setEditingId(null)
    setFormData({ title: '', startDate: '', endDate: '', status: 'IN_PROGRESS', discipler: '', notes: '' })
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({ title: '', startDate: '', endDate: '', status: 'IN_PROGRESS', discipler: '', notes: '' })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Em andamento'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      ABANDONED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status as keyof typeof colors] || colors.IN_PROGRESS
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluído',
      ABANDONED: 'Abandonado',
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Histórico de Discipulados</h3>
        <Button onClick={handleNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Discipulado
        </Button>
      </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : discipleships.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum discipulado registrado
        </div>
      ) : (
        <div className="space-y-2">
          {discipleships.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">{d.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Início: {formatDate(d.startDate)} • Término: {formatDate(d.endDate)}
                      {d.discipler && ` • Discipulador: ${d.discipler}`}
                    </div>
                    {d.notes && (
                      <div className="text-sm text-muted-foreground mt-2">{d.notes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(d.status)}`}>
                      {getStatusLabel(d.status)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(d)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(d.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Discipulado' : 'Novo Discipulado'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Ex: Discipulado Básico" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="ABANDONED">Abandonado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discipulador</Label>
                <Input value={formData.discipler} onChange={(e) => setFormData({ ...formData, discipler: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

