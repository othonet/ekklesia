'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, TrendingUp, Award } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MemberCourse {
  id: string
  startDate: string
  endDate: string | null
  status: string
  grade: string | null
  certificate: boolean
  notes: string | null
  course: {
    id: string
    name: string
    description: string | null
  }
}

interface Course {
  id: string
  name: string
}

export function CourseTab({ memberId }: { memberId: string }) {
  const [memberCourses, setMemberCourses] = useState<MemberCourse[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ courseId: '', startDate: '', endDate: '', status: 'IN_PROGRESS', grade: '', certificate: false, notes: '' })

  useEffect(() => {
    fetchData()
    fetchCourses()
  }, [memberId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMemberCourses(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate || null,
          certificate: formData.certificate,
        }),
      })
      if (res.ok) {
        fetchData()
        setDialogOpen(false)
        setFormData({ courseId: '', startDate: '', endDate: '', status: 'IN_PROGRESS', grade: '', certificate: false, notes: '' })
      }
    } catch (error) {
      console.error(error)
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
        <h3 className="text-lg font-semibold">Histórico de Cursos</h3>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Inscrever em Curso
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-64 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : memberCourses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum curso registrado
        </div>
      ) : (
        <div className="space-y-2">
          {memberCourses.map((mc) => (
            <Card key={mc.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{mc.course.name}</div>
                      {mc.certificate && (
                        <Award className="h-4 w-4 text-yellow-600" title="Certificado emitido" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Início: {formatDate(mc.startDate)} • Término: {formatDate(mc.endDate)}
                      {mc.grade && ` • Nota: ${mc.grade}`}
                    </div>
                    {mc.course.description && (
                      <div className="text-sm text-muted-foreground mt-1">{mc.course.description}</div>
                    )}
                    {mc.notes && (
                      <div className="text-sm text-muted-foreground mt-2">{mc.notes}</div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(mc.status)}`}>
                    {getStatusLabel(mc.status)}
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
            <DialogTitle>Inscrever em Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Curso *</Label>
              <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione um curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label>Nota/Avaliação</Label>
                <Input value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="certificate"
                checked={formData.certificate}
                onChange={(e) => setFormData({ ...formData, certificate: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="certificate">Certificado emitido</Label>
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

