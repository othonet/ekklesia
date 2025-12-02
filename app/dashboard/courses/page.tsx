'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Search, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CourseDialog } from '@/components/course-dialog'
import { EmptyState } from '@/components/empty-state'
import { useCache } from '@/hooks/use-cache'
import { useDebounce } from '@/hooks/use-debounce'

interface Course {
  id: string
  name: string
  description: string | null
  duration: number | null
  active: boolean
  createdAt: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Erro ao buscar cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        fetchCourses()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao excluir curso')
      }
    } catch (error) {
      console.error('Erro ao excluir curso:', error)
      alert('Erro ao excluir curso')
    }
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Cursos</h1>
            <p className="text-muted-foreground">Gerencie os cursos oferecidos pela igreja</p>
          </div>
          <Button onClick={() => { setSelectedCourse(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={search ? "Nenhum curso encontrado" : "Nenhum curso cadastrado ainda"}
                description={search ? "Tente buscar com outros termos." : "Comece criando cursos para oferecer à comunidade."}
              />
            ) : (
              <div className="space-y-2">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{course.name}</h3>
                          {!course.active && (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                              Inativo
                            </span>
                          )}
                        </div>
                        {course.description && (
                          <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
                          {course.duration && `Duração: ${course.duration} horas`}
                          {course.duration && ' • '}
                          Criado em {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedCourse(course); setDialogOpen(true) }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CourseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          course={selectedCourse}
          onSuccess={fetchCourses}
        />
      </div>
    </DashboardLayout>
  )
}

