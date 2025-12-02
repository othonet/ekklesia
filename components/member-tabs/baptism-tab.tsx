'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Award, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApi } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'

interface Baptism {
  id: string
  date: string
  location: string | null
  minister: string | null
  notes: string | null
}

export function BaptismTab({ memberId }: { memberId: string }) {
  const { fetchWithAuth } = useApi()
  const [baptisms, setBaptisms] = useState<Baptism[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBaptism, setEditingBaptism] = useState<Baptism | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [baptismToDelete, setBaptismToDelete] = useState<Baptism | null>(null)
  const [formData, setFormData] = useState({ date: '', location: '', minister: '', notes: '' })

  useEffect(() => {
    fetchData()
  }, [memberId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/baptisms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBaptisms(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBaptism) {
        // Editar batismo existente
        const { response } = await fetchWithAuth(
          `/api/members/${memberId}/baptisms/${editingBaptism.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(formData),
            showSuccessToast: true,
            successMessage: 'Batismo atualizado com sucesso',
          }
        )
        
        if (response.ok) {
          fetchData()
          setDialogOpen(false)
          setEditingBaptism(null)
          setFormData({ date: '', location: '', minister: '', notes: '' })
        }
      } else {
        // Criar novo batismo
        const { response, data } = await fetchWithAuth(
          `/api/members/${memberId}/baptisms`,
          {
            method: 'POST',
            body: JSON.stringify(formData),
            showSuccessToast: true,
            successMessage: 'Batismo registrado com sucesso',
          }
        )
        
        if (response.ok) {
          fetchData()
          setDialogOpen(false)
          setFormData({ date: '', location: '', minister: '', notes: '' })
        } else if (response.status === 409) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: data?.error || 'Este membro já possui um batismo registrado.',
          })
        }
      }
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }

  const handleEdit = (baptism: Baptism) => {
    setEditingBaptism(baptism)
    // Formatar data para o input type="date" (YYYY-MM-DD)
    const date = new Date(baptism.date)
    const formattedDate = date.toISOString().split('T')[0]
    setFormData({
      date: formattedDate,
      location: baptism.location || '',
      minister: baptism.minister || '',
      notes: baptism.notes || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!baptismToDelete) return

    try {
      const { response } = await fetchWithAuth(
        `/api/members/${memberId}/baptisms/${baptismToDelete.id}`,
        {
          method: 'DELETE',
          showSuccessToast: true,
          successMessage: 'Batismo excluído com sucesso',
        }
      )
      
      if (response.ok) {
        fetchData()
        setDeleteDialogOpen(false)
        setBaptismToDelete(null)
      }
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }

  const handleOpenDialog = () => {
    setEditingBaptism(null)
    setFormData({ date: '', location: '', minister: '', notes: '' })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingBaptism(null)
    setFormData({ date: '', location: '', minister: '', notes: '' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Batismo</h3>
        {baptisms.length === 0 && (
          <Button 
            onClick={handleOpenDialog} 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Batismo
          </Button>
        )}
      </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : baptisms.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum batismo registrado
        </div>
      ) : (
        <div className="space-y-2">
          {baptisms.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">Batismo</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(b.date)}
                      {b.location && ` • ${b.location}`}
                      {b.minister && ` • Ministro: ${b.minister}`}
                    </div>
                    {b.notes && (
                      <div className="text-sm text-muted-foreground mt-2">{b.notes}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(b)}
                      title="Editar batismo"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBaptismToDelete(b)
                        setDeleteDialogOpen(true)
                      }}
                      title="Excluir batismo"
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

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBaptism ? 'Editar Batismo' : 'Registrar Batismo'}</DialogTitle>
            <DialogDescription>
              {editingBaptism ? 'Atualize as informações do batismo' : 'Registre as informações do batismo do membro'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Data do Batismo *</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Local</Label>
                <Input 
                  value={formData.location} 
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                  placeholder="Ex: Igreja Central"
                />
              </div>
              <div className="space-y-2">
                <Label>Ministro</Label>
                <Input 
                  value={formData.minister} 
                  onChange={(e) => setFormData({ ...formData, minister: e.target.value })} 
                  placeholder="Nome do ministro"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais sobre o batismo"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit">{editingBaptism ? 'Atualizar' : 'Salvar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Batismo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este registro de batismo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {baptismToDelete && (
            <div className="py-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Data:</strong> {formatDate(baptismToDelete.date)}</p>
                {baptismToDelete.location && <p><strong>Local:</strong> {baptismToDelete.location}</p>}
                {baptismToDelete.minister && <p><strong>Ministro:</strong> {baptismToDelete.minister}</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setDeleteDialogOpen(false)
              setBaptismToDelete(null)
            }}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

