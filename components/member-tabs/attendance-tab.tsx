'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Check, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Attendance {
  id: string
  date: string
  present: boolean
  notes: string | null
  serviceType: string | null
  event: { id: string; title: string; type: string } | null
}

interface Event {
  id: string
  title: string
  type: string
}

export function AttendanceTab({ memberId }: { memberId: string }) {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ eventId: 'official', date: '', present: true, notes: '' })

  useEffect(() => {
    fetchData()
    fetchEvents()
  }, [memberId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAttendances(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const payload = {
        date: formData.date,
        present: formData.present,
        notes: formData.notes || null,
        eventId: ['official', 'teaching', 'members'].includes(formData.eventId) ? null : formData.eventId,
        serviceType: ['official', 'teaching', 'members'].includes(formData.eventId) ? formData.eventId : null,
      }
      
      console.log('Enviando frequência:', payload)
      
      const res = await fetch(`/api/members/${memberId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        fetchData()
        setDialogOpen(false)
        setFormData({ eventId: 'official', date: '', present: true, notes: '' })
      } else {
        console.error('Erro ao salvar frequência:', data)
        // Mensagem de erro mais clara para conflito de data
        if (res.status === 409) {
          alert(data.error || 'Esta data já foi registrada anteriormente. Por favor, escolha outra data.')
        } else {
          alert(data.error || 'Erro ao salvar frequência')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar frequência:', error)
      alert('Erro ao salvar frequência. Verifique o console para mais detalhes.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' })
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    // Capitalizar primeira letra do dia da semana
    const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    return `${capitalizedDay}, ${formattedDate}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Controle de Frequência</h3>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Frequência
        </Button>
      </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-64 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : attendances.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma frequência registrada
        </div>
      ) : (
        <div className="space-y-2">
          {attendances.map((att) => (
            <Card key={att.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {att.present ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {att.event ? att.event.title : (att.serviceType === 'teaching' ? 'Culto de Ensino' : att.serviceType === 'members' ? 'Culto de Membros' : 'Culto Oficial')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(att.date)}
                        {att.event && ` • ${att.event.type}`}
                      </div>
                      {att.notes && (
                        <div className="text-sm text-muted-foreground mt-1">{att.notes}</div>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${att.present ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {att.present ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Frequência</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Evento (opcional)</Label>
              <Select value={formData.eventId} onValueChange={(v) => setFormData({ ...formData, eventId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione um evento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="official">Culto Oficial</SelectItem>
                  <SelectItem value="teaching">Culto de Ensino</SelectItem>
                  <SelectItem value="members">Culto de Membros</SelectItem>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.present ? 'present' : 'absent'} onValueChange={(v) => setFormData({ ...formData, present: v === 'present' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Presente</SelectItem>
                    <SelectItem value="absent">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
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

