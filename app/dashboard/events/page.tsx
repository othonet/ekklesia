'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  type: string
  active: boolean
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Event | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', type: 'OTHER', active: true })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = selected?.id ? `/api/events/${selected.id}` : '/api/events'
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
        setFormData({ title: '', description: '', date: '', location: '', type: 'OTHER', active: true })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir evento?')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Eventos</h1>
            <p className="text-muted-foreground">Gerencie os eventos da igreja</p>
          </div>
          <Button onClick={() => { setSelected(null); setFormData({ title: '', description: '', date: '', location: '', type: 'OTHER', active: true }); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Evento
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-3">
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nenhum evento registrado ainda"
            description="Comece criando eventos para organizar cultos, reuniões e conferências da igreja."
          />
        ) : (
          <div className="space-y-4">
            {events.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{e.title}</h3>
                      {e.description && <p className="text-sm text-muted-foreground mb-2">{e.description}</p>}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>📅 {formatDate(e.date)}</span>
                        {e.location && <span>📍 {e.location}</span>}
                        <span className="capitalize">{e.type.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.href = `/dashboard/events/${e.id}/attendances`}
                        title="Ver confirmações de presença"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Presenças
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelected(e); setFormData({ title: e.title, description: e.description || '', date: e.date.split('T')[0] + 'T' + e.date.split('T')[1]?.substring(0, 5), location: e.location || '', type: e.type, active: e.active }); setDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(e.id)}>
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
              <DialogTitle>{selected ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data e Hora *</Label>
                  <Input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICE">Culto</SelectItem>
                      <SelectItem value="MEETING">Reunião</SelectItem>
                      <SelectItem value="CONFERENCE">Conferência</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
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

