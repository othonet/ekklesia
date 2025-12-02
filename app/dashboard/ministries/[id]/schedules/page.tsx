'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Users, CheckCircle2 } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

interface MinistrySchedule {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  active: boolean
  assignedMembers: Array<{
    id: string
    memberMinistry: {
      member: {
        id: string
        name: string
      }
    }
    role: string | null
    confirmed: boolean
  }>
}

interface Ministry {
  id: string
  name: string
  members: Array<{
    id: string
    member: {
      id: string
      name: string
    }
  }>
}

export default function MinistrySchedulesPage() {
  const params = useParams()
  const router = useRouter()
  const [schedules, setSchedules] = useState<MinistrySchedule[]>([])
  const [ministry, setMinistry] = useState<Ministry | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<MinistrySchedule | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    assignedMemberIds: [] as string[],
  })

  useEffect(() => {
    if (params.id) {
      fetchData()
      fetchMinistry()
    }
  }, [params.id])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/ministries/${params.id}/schedules`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchMinistry = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/ministries/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMinistry(data)
      }
    } catch (error) {
      console.error('Erro ao buscar ministério:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = `/api/ministries/${params.id}/schedules`
      const method = 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      })

      if (response.ok) {
        fetchData()
        setDialogOpen(false)
        setSelected(null)
        setFormData({
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          notes: '',
          assignedMemberIds: [],
        })
      }
    } catch (error) {
      console.error('Erro ao salvar escala:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta escala?')) return
    // Implementar DELETE quando a API estiver pronta
    console.log('Deletar escala:', id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/ministries')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                Escalas - {ministry?.name || 'Ministério'}
              </h1>
              <p className="text-muted-foreground">Gerencie as escalas de atividades do ministério</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Escala
          </Button>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nenhuma escala cadastrada"
            description="Crie escalas para organizar as atividades do ministério."
          />
        ) : (
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{schedule.title}</CardTitle>
                      {schedule.description && (
                        <p className="text-sm text-muted-foreground mb-2">{schedule.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>📅 {formatDate(schedule.date)}</span>
                        {schedule.startTime && schedule.endTime && (
                          <span>🕐 {schedule.startTime} - {schedule.endTime}</span>
                        )}
                        {schedule.location && <span>📍 {schedule.location}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDelete(schedule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {schedule.assignedMembers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Membros Escalados ({schedule.assignedMembers.length})
                      </h4>
                      <div className="space-y-2">
                        {schedule.assignedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {member.memberMinistry.member.name}
                              </span>
                              {member.role && (
                                <span className="text-xs text-muted-foreground">
                                  ({member.role})
                                </span>
                              )}
                            </div>
                            {member.confirmed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Pendente</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Escala</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data e Hora *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário de Início</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário de Término</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Membros Escalados</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !formData.assignedMemberIds.includes(value)) {
                      setFormData({
                        ...formData,
                        assignedMemberIds: [...formData.assignedMemberIds, value],
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministry?.members
                      .filter((m) => !formData.assignedMemberIds.includes(m.id))
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.member.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.assignedMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.assignedMemberIds.map((memberId) => {
                      const member = ministry?.members.find((m) => m.id === memberId)
                      return (
                        <span
                          key={memberId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                        >
                          {member?.member.name}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                assignedMemberIds: formData.assignedMemberIds.filter((id) => id !== memberId),
                              })
                            }}
                            className="ml-1"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

