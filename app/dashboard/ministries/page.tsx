'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, Building2, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface Ministry {
  id: string
  name: string
  description: string | null
  leader: string | null
  active: boolean
}

export default function MinistriesPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Ministry | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', leader: '', active: true })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/ministries', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMinistries(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = selected?.id ? `/api/ministries/${selected.id}` : '/api/ministries'
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
        setFormData({ name: '', description: '', leader: '', active: true })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir ministério?')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/ministries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ministérios</h1>
            <p className="text-muted-foreground">Gerencie os ministérios da igreja</p>
          </div>
          <Button onClick={() => { setSelected(null); setFormData({ name: '', description: '', leader: '', active: true }); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Ministério
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-3">
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                  <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : ministries.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhum ministério cadastrado ainda"
            description="Comece criando ministérios para organizar os diferentes grupos e atividades da igreja."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ministries.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{m.name}</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.href = `/dashboard/ministries/${m.id}/schedules`}
                        title="Gerenciar escalas"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelected(m); setFormData({ name: m.name, description: m.description || '', leader: m.leader || '', active: m.active }); setDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {m.description && <p className="text-sm text-muted-foreground mb-2">{m.description}</p>}
                  {m.leader && <p className="text-xs text-muted-foreground">Líder: {m.leader}</p>}
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${m.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {m.active ? 'Ativo' : 'Inativo'}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected ? 'Editar Ministério' : 'Novo Ministério'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Líder</Label>
                <Input value={formData.leader} onChange={(e) => setFormData({ ...formData, leader: e.target.value })} />
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

