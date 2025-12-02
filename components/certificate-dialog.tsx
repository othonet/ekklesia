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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Member {
  id: string
  name: string
}

interface Baptism {
  id: string
  date: string
  member: { name: string }
}

interface Course {
  id: string
  name: string
}

interface Event {
  id: string
  title: string
  hasCertificate: boolean
}

interface CertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CertificateDialog({ open, onOpenChange, onSuccess }: CertificateDialogProps) {
  const [formData, setFormData] = useState({
    memberId: '',
    type: '',
    title: '',
    description: '',
    baptismId: '',
    courseId: '',
    eventId: '',
    issuedBy: '',
    validUntil: '',
  })
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [baptisms, setBaptisms] = useState<Baptism[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open])

  useEffect(() => {
    if (formData.type === 'BAPTISM' && formData.memberId) {
      fetchBaptisms()
    } else {
      setBaptisms([])
    }
  }, [formData.type, formData.memberId])

  useEffect(() => {
    if (formData.type === 'COURSE' && formData.memberId) {
      fetchMemberCourses()
    } else {
      setCourses([])
    }
  }, [formData.type, formData.memberId])

  useEffect(() => {
    if (formData.type === 'EVENT' && formData.memberId) {
      fetchMemberEvents()
    } else {
      setEvents([])
    }
  }, [formData.type, formData.memberId])

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/members?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const response = await res.json()
        // A API agora retorna { data, pagination } ou array direto (fallback)
        const membersData = response?.data || response
        setMembers(Array.isArray(membersData) ? membersData : [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchBaptisms = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${formData.memberId}/baptisms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBaptisms(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMemberCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${formData.memberId}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        // Filtrar apenas cursos concluídos
        const completedCourses = data
          .filter((mc: any) => mc.status === 'COMPLETED')
          .map((mc: any) => ({
            id: mc.courseId,
            name: mc.course.name,
          }))
        setCourses(completedCourses)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMemberEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${formData.memberId}/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        // Filtrar apenas eventos com presença confirmada
        const attendedEvents = data
          .filter((att: any) => att.present === true)
          .map((att: any) => ({
            id: att.eventId,
            title: att.event.title,
          }))
        // Remover duplicatas (mesmo evento pode ter múltiplas presenças)
        const uniqueEvents = attendedEvents.filter((event: any, index: number, self: any[]) =>
          index === self.findIndex((e: any) => e.id === event.id)
        )
        setEvents(uniqueEvents)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const payload: any = {
        memberId: formData.memberId,
        type: formData.type,
        title: formData.title,
        description: formData.description || null,
        issuedBy: formData.issuedBy || null,
        validUntil: formData.validUntil || null,
      }

      if (formData.type === 'BAPTISM') {
        payload.baptismId = formData.baptismId
      } else if (formData.type === 'COURSE') {
        payload.courseId = formData.courseId
      } else if (formData.type === 'EVENT') {
        payload.eventId = formData.eventId
      }

      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          memberId: '',
          type: '',
          title: '',
          description: '',
          baptismId: '',
          courseId: '',
          eventId: '',
          issuedBy: '',
          validUntil: '',
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao emitir certificado')
      }
    } catch (error) {
      console.error('Erro ao emitir certificado:', error)
      alert('Erro ao emitir certificado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir Certificado</DialogTitle>
          <DialogDescription>
            Emita um certificado para um membro da igreja
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Membro *</Label>
            <Select
              value={formData.memberId}
              onValueChange={(v) => setFormData({ ...formData, memberId: v, baptismId: '', courseId: '', eventId: '' })}
              required
            >
              <SelectTrigger><SelectValue placeholder="Selecione um membro" /></SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Certificado *</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v, baptismId: '', courseId: '', eventId: '' })}
              required
            >
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BAPTISM">Certificado de Batismo</SelectItem>
                <SelectItem value="COURSE">Certificado de Conclusão de Curso</SelectItem>
                <SelectItem value="EVENT">Certificado de Participação em Evento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'BAPTISM' && formData.memberId && (
            <div className="space-y-2">
              <Label>Batismo *</Label>
              {baptisms.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  Este membro não possui batismo registrado. É necessário registrar o batismo antes de emitir o certificado.
                </div>
              ) : (
                <Select
                  value={formData.baptismId}
                  onValueChange={(v) => setFormData({ ...formData, baptismId: v })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o batismo" /></SelectTrigger>
                  <SelectContent>
                    {baptisms.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {new Date(b.date).toLocaleDateString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {formData.type === 'COURSE' && formData.memberId && (
            <div className="space-y-2">
              <Label>Curso *</Label>
              {courses.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  Este membro não possui cursos concluídos. É necessário marcar um curso como concluído antes de emitir o certificado.
                </div>
              ) : (
                <Select
                  value={formData.courseId}
                  onValueChange={(v) => setFormData({ ...formData, courseId: v })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o curso concluído" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {formData.type === 'EVENT' && formData.memberId && (
            <div className="space-y-2">
              <Label>Evento *</Label>
              {events.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  Este membro não possui presença registrada em eventos. É necessário registrar a presença do membro em um evento antes de emitir o certificado.
                </div>
              ) : (
                <Select
                  value={formData.eventId}
                  onValueChange={(v) => setFormData({ ...formData, eventId: v })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o evento com presença confirmada" /></SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Título do Certificado *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Ex: Certificado de Batismo"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição adicional do certificado..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emitido por</Label>
              <Input
                value={formData.issuedBy}
                onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-2">
              <Label>Válido até (opcional)</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Emitindo...' : 'Emitir Certificado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

