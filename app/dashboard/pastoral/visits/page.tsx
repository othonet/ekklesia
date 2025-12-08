'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, MapPin, User, Edit, Trash2 } from 'lucide-react'
import { useCache } from '@/hooks/use-cache'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface PastoralVisit {
  id: string
  visitDate: string
  visitType: string
  location: string | null
  reason: string
  notes: string | null
  member: {
    id: string
    name: string
  }
  pastor: {
    id: string
    name: string
  }
}

export default function PastoralVisitsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<PastoralVisit | null>(null)
  const [formData, setFormData] = useState({
    memberId: '',
    visitDate: '',
    visitTime: '',
    visitType: 'DOMICILIARY',
    location: '',
    reason: 'REGULAR',
    notes: '',
    privacy: 'PUBLIC',
    nextSteps: '',
    followUpDate: '',
  })
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([])

  const { data: visitsData, loading, refresh } = useCache<{ visits: PastoralVisit[] }>(
    'pastoral_visits',
    async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/pastoral/visits', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        return await res.json()
      }
      return { visits: [] }
    },
    { cacheDuration: 3 * 60 * 1000 }
  )

  useEffect(() => {
    // Buscar membros
    const fetchMembers = async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/members?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const response = await res.json()
        const data = response?.data || response
        setMembers(Array.isArray(data) ? data : [])
      }
    }
    fetchMembers()
  }, [])

  const visits = visitsData?.visits || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const visitDateTime = formData.visitDate && formData.visitTime
        ? `${formData.visitDate}T${formData.visitTime}`
        : formData.visitDate || new Date().toISOString()

      const payload = {
        memberId: formData.memberId,
        visitDate: visitDateTime,
        visitType: formData.visitType,
        location: formData.location || null,
        reason: formData.reason,
        notes: formData.notes || null,
        privacy: formData.privacy,
        nextSteps: formData.nextSteps || null,
        followUpDate: formData.followUpDate || null,
      }

      const url = selected?.id ? `/api/pastoral/visits/${selected.id}` : '/api/pastoral/visits'
      const method = selected?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        refresh()
        setDialogOpen(false)
        setSelected(null)
        setFormData({
          memberId: '',
          visitDate: '',
          visitTime: '',
          visitType: 'DOMICILIARY',
          location: '',
          reason: 'REGULAR',
          notes: '',
          privacy: 'PUBLIC',
          nextSteps: '',
          followUpDate: '',
        })
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao salvar visita')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar visita')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir visita?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/pastoral/visits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        refresh()
      } else {
        alert('Erro ao excluir visita')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir visita')
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

  const getVisitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DOMICILIARY: 'Domiciliar',
      HOSPITAL: 'Hospitalar',
      OFFICE: 'Escritório',
      PHONE: 'Telefone',
      VIDEO_CALL: 'Videochamada',
      OTHER: 'Outro',
    }
    return labels[type] || type
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      REGULAR: 'Acompanhamento regular',
      ILLNESS: 'Doença/Enfermidade',
      GRIEF: 'Luto',
      FAMILY_CRISIS: 'Crise familiar',
      CONVERSION: 'Conversão',
      OTHER: 'Outro',
    }
    return labels[reason] || reason
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Visitas Pastorais</h1>
            <p className="text-muted-foreground">Gerencie visitas pastorais realizadas</p>
          </div>
          <Button onClick={() => {
            setSelected(null)
            setFormData({
              memberId: '',
              visitDate: new Date().toISOString().split('T')[0],
              visitTime: new Date().toTimeString().slice(0, 5),
              visitType: 'DOMICILIARY',
              location: '',
              reason: 'REGULAR',
              notes: '',
              privacy: 'PUBLIC',
              nextSteps: '',
              followUpDate: '',
            })
            setDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" /> Nova Visita
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : visits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma visita registrada ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {visits.map((visit) => (
              <Card key={visit.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{formatDate(visit.visitDate)}</span>
                        <span className="text-sm text-muted-foreground">
                          • {getVisitTypeLabel(visit.visitType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{visit.member.name}</span>
                      </div>
                      {visit.location && (
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{visit.location}</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Motivo: {getReasonLabel(visit.reason)}
                      </div>
                      {visit.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {visit.notes.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(visit)
                          const date = new Date(visit.visitDate)
                          setFormData({
                            memberId: visit.member.id,
                            visitDate: date.toISOString().split('T')[0],
                            visitTime: date.toTimeString().slice(0, 5),
                            visitType: visit.visitType,
                            location: visit.location || '',
                            reason: visit.reason,
                            notes: visit.notes || '',
                            privacy: 'PUBLIC', // TODO: pegar do visit
                            nextSteps: '',
                            followUpDate: '',
                          })
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(visit.id)}
                      >
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected ? 'Editar Visita' : 'Nova Visita Pastoral'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Membro *</Label>
                  <Select
                    value={formData.memberId}
                    onValueChange={(v) => setFormData({ ...formData, memberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Visita *</Label>
                  <Select
                    value={formData.visitType}
                    onValueChange={(v) => setFormData({ ...formData, visitType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOMICILIARY">Domiciliar</SelectItem>
                      <SelectItem value="HOSPITAL">Hospitalar</SelectItem>
                      <SelectItem value="OFFICE">Escritório</SelectItem>
                      <SelectItem value="PHONE">Telefone</SelectItem>
                      <SelectItem value="VIDEO_CALL">Videochamada</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={formData.visitTime}
                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Local</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Endereço ou local da visita"
                />
              </div>

              <div className="space-y-2">
                <Label>Motivo *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(v) => setFormData({ ...formData, reason: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Acompanhamento regular</SelectItem>
                    <SelectItem value="ILLNESS">Doença/Enfermidade</SelectItem>
                    <SelectItem value="GRIEF">Luto</SelectItem>
                    <SelectItem value="FAMILY_CRISIS">Crise familiar</SelectItem>
                    <SelectItem value="CONVERSION">Conversão</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Anotações (Privadas)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotações sobre a visita..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Próximos Passos</Label>
                <Textarea
                  value={formData.nextSteps}
                  onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                  placeholder="O que fazer a seguir..."
                  rows={2}
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

