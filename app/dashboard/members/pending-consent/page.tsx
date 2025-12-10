'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Mail, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

interface PendingMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  consentDate: string | null
  status: string
}

export default function PendingConsentPage() {
  const [members, setMembers] = useState<PendingMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingMembers()
  }, [])

  const fetchPendingMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/members/pending-consent', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/D'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      VISITOR: 'Visitante',
      LEADER: 'Líder',
      VOLUNTEER: 'Voluntário',
    }
    return labels[status] || status
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Membros com Consentimento Pendente</h1>
          <p className="text-muted-foreground">
            Membros que ainda não confirmaram o consentimento para tratamento de dados pessoais
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Total: {members.length} membro(s)
            </CardTitle>
            <CardDescription>
              Estes membros foram cadastrados por administradores e precisam confirmar seu consentimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="Nenhum membro pendente"
                description="Todos os membros confirmaram seu consentimento."
              />
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {member.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {member.email}
                            </div>
                          )}
                          {member.phone && (
                            <div>Telefone: {member.phone}</div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Cadastrado em: {formatDate(member.createdAt)}
                          </div>
                          <div>
                            Status: <span className="font-medium">{getStatusLabel(member.status)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs font-medium">
                          Pendente
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

