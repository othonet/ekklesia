'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/empty-state'
import { 
  Building2, 
  Users, 
  Calendar, 
  UserCheck, 
  Clock, 
  MapPin,
  ChevronRight,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  X
} from 'lucide-react'
import Link from 'next/link'

interface MinistryMember {
  id: string
  memberId: string
  name: string
  email: string | null
  phone: string | null
  status: string
  role: string | null
  joinedAt: string
}

interface Schedule {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  assignedMembers: Array<{
    id: string
    name: string
    email: string | null
  }>
}

interface Ministry {
  id: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
  membersCount: number
  members: MinistryMember[]
  upcomingSchedules: Schedule[]
  upcomingSchedulesCount: number
}

interface LeadershipData {
  isLeader: boolean
  member: {
    id: string
    name: string
    email: string | null
  }
  ministries: Ministry[]
}

interface AvailableMember {
  id: string
  name: string
  email: string | null
}

export default function LeadershipPage() {
  const [data, setData] = useState<LeadershipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  
  // Diálogos
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [addScheduleDialogOpen, setAddScheduleDialogOpen] = useState(false)
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null)
  
  // Formulários
  const [addMemberForm, setAddMemberForm] = useState({ memberId: '', role: '' })
  const [addScheduleForm, setAddScheduleForm] = useState({
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
    fetchData()
    fetchAvailableMembers()
  }, [])

  const fetchAvailableMembers = async () => {
    try {
      setLoadingMembers(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/members?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const response = await res.json()
        const membersList = response.data || response.members || response || []
        const validMembers = membersList.filter(
          (m: any) => !m.deletedAt && m.status !== 'INACTIVE'
        )
        setAvailableMembers(validMembers)
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/leadership/ministries', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else {
        setData({
          isLeader: false,
          member: { id: '', name: '', email: null },
          ministries: [],
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados de liderança:', error)
      setData({
        isLeader: false,
        member: { id: '', name: '', email: null },
        ministries: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string, timeString: string | null) => {
    const date = new Date(dateString)
    if (timeString) {
      return `${formatDate(dateString)} às ${timeString}`
    }
    return formatDate(dateString)
  }

  const handleAddMember = async (ministryId: string) => {
    if (!addMemberForm.memberId) {
      alert('Selecione um membro')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/leadership/ministries/${ministryId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: addMemberForm.memberId,
          role: addMemberForm.role || null,
        }),
      })

      if (res.ok) {
        fetchData()
        setAddMemberDialogOpen(false)
        setAddMemberForm({ memberId: '', role: '' })
        setSelectedMinistry(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao adicionar membro')
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error)
      alert('Erro ao adicionar membro')
    }
  }

  const handleRemoveMember = async (ministryId: string, memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro do ministério?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/leadership/ministries/${ministryId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao remover membro')
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error)
      alert('Erro ao remover membro')
    }
  }

  const handleCreateSchedule = async (ministryId: string) => {
    if (!addScheduleForm.title || !addScheduleForm.date) {
      alert('Título e data são obrigatórios')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/leadership/ministries/${ministryId}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...addScheduleForm,
          date: new Date(addScheduleForm.date).toISOString(),
        }),
      })

      if (res.ok) {
        fetchData()
        setAddScheduleDialogOpen(false)
        setAddScheduleForm({
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          notes: '',
          assignedMemberIds: [],
        })
        setSelectedMinistry(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao criar escala')
      }
    } catch (error) {
      console.error('Erro ao criar escala:', error)
      alert('Erro ao criar escala')
    }
  }

  const getAvailableMembersForMinistry = (ministryId: string) => {
    if (!data) return []
    const ministry = data.ministries.find(m => m.id === ministryId)
    if (!ministry) return []
    
    const ministryMemberIds = ministry.members.map(m => m.memberId)
    return availableMembers.filter(m => !ministryMemberIds.includes(m.id))
  }

  const getMinistryMembersForSchedule = (ministryId: string) => {
    if (!data) return []
    const ministry = data.ministries.find(m => m.id === ministryId)
    if (!ministry) return []
    return ministry.members
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Liderança</h1>
              <p className="text-muted-foreground">Gerencie os ministérios que você lidera</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data || !data.isLeader || data.ministries.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Liderança</h1>
              <p className="text-muted-foreground">Gerencie os ministérios que você lidera</p>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
          <EmptyState
            icon={Building2}
            title="Você não é líder de nenhum ministério"
            description="Quando você for designado como líder de um ministério, ele aparecerá aqui."
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Liderança</h1>
            <p className="text-muted-foreground">
              Gerencie os {data.ministries.length} ministério{data.ministries.length !== 1 ? 's' : ''} que você lidera
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-6">
          {data.ministries.map((ministry) => (
            <Card key={ministry.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {ministry.name}
                    </CardTitle>
                    {ministry.description && (
                      <p className="text-sm text-muted-foreground mt-2">{ministry.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ministry.active ? 'default' : 'secondary'}>
                      {ministry.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Link href={`/dashboard/ministries/${ministry.id}/schedules`}>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Escalas
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Membros do Ministério */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Membros ({ministry.membersCount})
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMinistry(ministry.id)
                            setAddMemberDialogOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                        <Link href={`/dashboard/ministries/${ministry.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {ministry.members.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                        Nenhum membro cadastrado
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ministry.members.slice(0, 5).map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{member.name}</p>
                                {member.role && (
                                  <Badge variant="outline" className="text-xs">
                                    {member.role}
                                  </Badge>
                                )}
                              </div>
                              {member.email && (
                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              )}
                              {member.phone && (
                                <p className="text-xs text-muted-foreground">{member.phone}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  member.status === 'ACTIVE' ? 'default' : 'secondary'
                                }
                                className="ml-2"
                              >
                                {member.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(ministry.id, member.memberId)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {ministry.members.length > 5 && (
                          <div className="text-center pt-2">
                            <Link href={`/dashboard/ministries/${ministry.id}`}>
                              <Button variant="ghost" size="sm" className="text-xs">
                                Ver mais {ministry.members.length - 5} membro{ministry.members.length - 5 !== 1 ? 's' : ''}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Próximas Escalas */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Próximas Escalas ({ministry.upcomingSchedulesCount})
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMinistry(ministry.id)
                            setAddScheduleDialogOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Nova Escala
                        </Button>
                        <Link href={`/dashboard/ministries/${ministry.id}/schedules`}>
                          <Button variant="ghost" size="sm">
                            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {ministry.upcomingSchedules.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                        Nenhuma escala agendada
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ministry.upcomingSchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{schedule.title}</p>
                                {schedule.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {schedule.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1 mt-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(schedule.date, schedule.startTime)}
                                {schedule.endTime && ` - ${schedule.endTime}`}
                              </div>
                              {schedule.location && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {schedule.location}
                                </div>
                              )}
                              {schedule.assignedMembers.length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                  <UserCheck className="h-3 w-3" />
                                  <span>
                                    {schedule.assignedMembers.length} membro{schedule.assignedMembers.length !== 1 ? 's' : ''} escalado{schedule.assignedMembers.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Diálogo Adicionar Membro */}
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro ao Ministério</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Membro *</Label>
                <Select
                  value={addMemberForm.memberId}
                  onValueChange={(value) => setAddMemberForm({ ...addMemberForm, memberId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingMembers ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : selectedMinistry ? (
                      getAvailableMembersForMinistry(selectedMinistry).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} {member.email ? `(${member.email})` : ''}
                        </SelectItem>
                      ))
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Função/Papel</Label>
                <Input
                  value={addMemberForm.role}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })}
                  placeholder="Ex: Coordenador, Ajudante, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setAddMemberDialogOpen(false)
                setAddMemberForm({ memberId: '', role: '' })
                setSelectedMinistry(null)
              }}>
                Cancelar
              </Button>
              <Button onClick={() => selectedMinistry && handleAddMember(selectedMinistry)}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo Criar Escala */}
        <Dialog open={addScheduleDialogOpen} onOpenChange={setAddScheduleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Escala</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={addScheduleForm.title}
                  onChange={(e) => setAddScheduleForm({ ...addScheduleForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={addScheduleForm.description}
                  onChange={(e) => setAddScheduleForm({ ...addScheduleForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data e Hora *</Label>
                  <Input
                    type="datetime-local"
                    value={addScheduleForm.date}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input
                    value={addScheduleForm.location}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário de Início</Label>
                  <Input
                    type="time"
                    value={addScheduleForm.startTime}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário de Término</Label>
                  <Input
                    type="time"
                    value={addScheduleForm.endTime}
                    onChange={(e) => setAddScheduleForm({ ...addScheduleForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Membros Escalados</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !addScheduleForm.assignedMemberIds.includes(value)) {
                      setAddScheduleForm({
                        ...addScheduleForm,
                        assignedMemberIds: [...addScheduleForm.assignedMemberIds, value],
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMinistry ? (
                      getMinistryMembersForSchedule(selectedMinistry)
                        .filter((m) => !addScheduleForm.assignedMemberIds.includes(m.id))
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} {member.role ? `(${member.role})` : ''}
                          </SelectItem>
                        ))
                    ) : null}
                  </SelectContent>
                </Select>
                {addScheduleForm.assignedMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {addScheduleForm.assignedMemberIds.map((memberId) => {
                      const member = selectedMinistry
                        ? getMinistryMembersForSchedule(selectedMinistry).find((m) => m.id === memberId)
                        : null
                      return (
                        <span
                          key={memberId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                        >
                          {member?.name}
                          <button
                            type="button"
                            onClick={() => {
                              setAddScheduleForm({
                                ...addScheduleForm,
                                assignedMemberIds: addScheduleForm.assignedMemberIds.filter((id) => id !== memberId),
                              })
                            }}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
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
                  value={addScheduleForm.notes}
                  onChange={(e) => setAddScheduleForm({ ...addScheduleForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddScheduleDialogOpen(false)
                  setAddScheduleForm({
                    title: '',
                    description: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                    notes: '',
                    assignedMemberIds: [],
                  })
                  setSelectedMinistry(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={() => selectedMinistry && handleCreateSchedule(selectedMinistry)}>
                Criar Escala
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

