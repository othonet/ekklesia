'use client'

import { useEffect, useState } from 'react'
import { Building2, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MemberMinistry {
  id: string
  role: string | null
  joinedAt: string
  ministry: {
    id: string
    name: string
    description: string | null
    active: boolean
  }
}

interface Ministry {
  id: string
  name: string
  active: boolean
  leader?: {
    id: string
    name: string
    email: string | null
  } | null
}

export function MinistryTab({ memberId }: { memberId: string }) {
  const [memberMinistries, setMemberMinistries] = useState<MemberMinistry[]>([])
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ ministryId: '', role: 'Membro' })

  useEffect(() => {
    fetchData()
    fetchMinistries()
  }, [memberId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/ministries`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMemberMinistries(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchMinistries = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/ministries', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMinistries(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/ministries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchData()
        setDialogOpen(false)
        setFormData({ ministryId: '', role: 'Membro' })
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao associar ministério')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao associar ministério')
    }
  }

  const handleRemove = async (ministryId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro do ministério?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}/ministries?ministryId=${ministryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao remover ministério')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao remover ministério')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Filtrar ministérios que o membro ainda não está associado
  // E que o membro não é líder (líder não pode ser associado como membro comum)
  const availableMinistries = ministries.filter(
    m => !memberMinistries.some(mm => mm.ministry.id === m.id) &&
         m.leader?.id !== memberId
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ministérios</h3>
        <Button onClick={() => setDialogOpen(true)} size="sm" disabled={availableMinistries.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Associar Ministério
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                <div className="h-4 w-64 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      ) : memberMinistries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum ministério associado
        </div>
      ) : (
        <div className="space-y-2">
          {memberMinistries.map((mm) => (
            <Card key={mm.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Building2 className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{mm.ministry.name}</div>
                        {!mm.ministry.active && (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Participando desde {formatDate(mm.joinedAt)}
                        {mm.role && ` • Função: ${mm.role}`}
                      </div>
                      {mm.ministry.description && (
                        <div className="text-sm text-muted-foreground mt-1">{mm.ministry.description}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(mm.ministry.id)}
                    title="Remover do ministério"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associar a Ministério</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ministério *</Label>
              <Select
                value={formData.ministryId}
                onValueChange={(v) => setFormData({ ...formData, ministryId: v })}
                required
              >
                <SelectTrigger><SelectValue placeholder="Selecione um ministério" /></SelectTrigger>
                <SelectContent>
                  {availableMinistries.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Função/Cargo</Label>
              <Input
                value={formData.role}
                disabled
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Associar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

