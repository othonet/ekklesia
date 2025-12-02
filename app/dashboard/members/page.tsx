'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Search, Eye, Users } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { MemberDialog } from '@/components/member-dialog'
import { useApi } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useCache } from '@/hooks/use-cache'
import { useDebounce } from '@/hooks/use-debounce'

interface Member {
  id: string
  name: string
  email: string | null
  phone: string | null
  birthDate: string | null
  status: string
  memberSince: string
}

export default function MembersPage() {
  const router = useRouter()
  const { fetchWithAuth } = useApi()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Debounce da busca
  const debouncedSearch = useDebounce(search, 500)

  // Cache de membros com busca e paginação
  const cacheKey = `members_page_${page}_search_${debouncedSearch}`
  const { data: membersData, loading, refresh, error } = useCache<{
    data: Member[]
    pagination?: { totalPages: number }
  }>(
    cacheKey,
    async () => {
      const { data, response } = await fetchWithAuth(
        `/api/members?page=${page}&limit=20${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`,
        { showErrorToast: false }
      )

      if (response.ok) {
        if (data && data.pagination) {
          return { data: data.data || [], pagination: data.pagination }
        } else if (Array.isArray(data)) {
          return { data, pagination: { totalPages: 1 } }
        }
      }
      return { data: [], pagination: { totalPages: 1 } }
    },
    { cacheDuration: 2 * 60 * 1000 } // 2 minutos para dados dinâmicos
  )

  const members = membersData?.data || []
  const pagination = membersData?.pagination

  useEffect(() => {
    if (pagination) {
      setTotalPages(pagination.totalPages || 1)
    }
  }, [pagination])

  // Resetar página quando busca mudar
  useEffect(() => {
    if (page !== 1) {
      setPage(1)
    }
  }, [debouncedSearch])

  const fetchMembers = async () => {
    await refresh()
  }

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!memberToDelete) return

    try {
      const { response } = await fetchWithAuth(
        `/api/members/${memberToDelete.id}`,
        {
          method: 'DELETE',
          showSuccessToast: true,
          successMessage: 'Membro excluído com sucesso',
        }
      )

      if (response.ok) {
        fetchMembers()
      }
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }


  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      VISITOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    }
    return colors[status as keyof typeof colors] || colors.INACTIVE
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Membros</h1>
            <p className="text-muted-foreground">Gerencie os membros da igreja</p>
          </div>
          <Button onClick={() => { setSelectedMember(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Membro
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membros..."
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
            ) : filteredMembers.length === 0 ? (
              <EmptyState
                icon={Users}
                title={search ? "Nenhum membro encontrado" : "Nenhum membro cadastrado ainda"}
                description={search ? "Tente buscar com outros termos." : "Comece cadastrando o primeiro membro da igreja."}
              />
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{member.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {member.email && <span>{member.email}</span>}
                        {member.phone && <span className="ml-2">{member.phone}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/members/${member.id}`)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedMember(member); setDialogOpen(true) }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(member)}
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

        <MemberDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          member={selectedMember}
          onSuccess={fetchMembers}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Excluir Membro"
          description={`Tem certeza que deseja excluir o membro "${memberToDelete?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
        />


        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

