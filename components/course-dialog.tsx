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
import { Textarea } from '@/components/ui/textarea'

interface Course {
  id?: string
  name?: string
  description?: string | null
  duration?: number | null
  active?: boolean
}

interface CourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  onSuccess: () => void
}

export function CourseDialog({ open, onOpenChange, course, onSuccess }: CourseDialogProps) {
  const [formData, setFormData] = useState<Course>({
    name: '',
    description: '',
    duration: null,
    active: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        description: course.description || '',
        duration: course.duration || null,
        active: course.active !== undefined ? course.active : true,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        duration: null,
        active: true,
      })
    }
  }, [course, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const url = course?.id ? `/api/courses/${course.id}` : '/api/courses'
      const method = course?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          duration: formData.duration ? parseInt(String(formData.duration)) : null,
          active: formData.active,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar curso')
      }
    } catch (error) {
      console.error('Erro ao salvar curso:', error)
      alert('Erro ao salvar curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{course ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
          <DialogDescription>
            {course ? 'Atualize as informações do curso' : 'Adicione um novo curso oferecido pela igreja'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Curso *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ex: Discipulado Básico, Escola Bíblica, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o conteúdo e objetivos do curso..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (horas)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Ex: 40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="active" className="font-normal cursor-pointer">
                  Curso ativo
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : course ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

