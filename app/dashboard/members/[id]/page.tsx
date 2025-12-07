'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Calendar, Users, BookOpen, Award, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AttendanceTab } from '@/components/member-tabs/attendance-tab'
import { BaptismTab } from '@/components/member-tabs/baptism-tab'
import { DiscipleshipTab } from '@/components/member-tabs/discipleship-tab'
import { CourseTab } from '@/components/member-tabs/course-tab'
import { MinistryTab } from '@/components/member-tabs/ministry-tab'

interface Member {
  id: string
  name: string
  email: string | null
  phone: string | null
  phone2: string | null
  birthDate: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  status: string
  cpf: string | null
  rg: string | null
  maritalStatus: string | null
  profession: string | null
  education: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  notes: string | null
  memberSince: string
  dataConsent: boolean
  consentDate: string | null
  consentRevokedAt: string | null
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [savingCredentials, setSavingCredentials] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchMember()
    }
  }, [params.id])

  const fetchMember = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/members/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMember(data)
      } else {
        router.push('/dashboard/members')
      }
    } catch (error) {
      console.error('Erro ao buscar membro:', error)
      router.push('/dashboard/members')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      VISITOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      LEADER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      VOLUNTEER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    }
    return colors[status as keyof typeof colors] || colors.INACTIVE
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: 'Membro Ativo',
      INACTIVE: 'Inativo',
      VISITOR: 'Visitante',
      LEADER: 'Líder',
      VOLUNTEER: 'Voluntário',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getMaritalStatusLabel = (status: string | null) => {
    if (!status) return 'Não informado'
    const labels = {
      SINGLE: 'Solteiro(a)',
      MARRIED: 'Casado(a)',
      DIVORCED: 'Divorciado(a)',
      WIDOWED: 'Viúvo(a)',
    }
    return labels[status as keyof typeof labels] || status
  }

  const handleSaveCredentials = async () => {
    if (!member) return

    if (!password || password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      })
      return
    }

    if (password !== passwordConfirm) {
      toast({
        variant: 'destructive',
        title: 'Senhas não conferem',
        description: 'A confirmação de senha deve ser igual à senha digitada.',
      })
      return
    }

    try {
      setSavingCredentials(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/members/${member.id}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Opcionalmente, poderíamos permitir alterar email aqui também
          password,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Erro ao definir credenciais',
          description: data.error || 'Não foi possível definir a senha do membro.',
        })
        return
      }

      toast({
        variant: 'success',
        title: 'Credenciais atualizadas',
        description: 'Senha do membro definida/atualizada com sucesso.',
      })

      setPassword('')
      setPasswordConfirm('')
      setCredentialsDialogOpen(false)
    } catch (error: any) {
      console.error('Erro ao definir credenciais do membro:', error)
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao definir as credenciais. Tente novamente.',
      })
    } finally {
      setSavingCredentials(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              <div className="space-y-2">
                <div className="h-9 w-64 bg-muted animate-pulse rounded" />
                <div className="h-5 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-4">
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!member) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/members')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{member.name}</h1>
              <p className="text-muted-foreground">Detalhes do membro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCredentialsDialogOpen(true)}
            >
              Definir credenciais
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <p>{member.email || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Telefone:</span>
                <p>{member.phone || 'Não informado'}</p>
              </div>
              {member.phone2 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Telefone 2:</span>
                  <p>{member.phone2}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-muted-foreground">Data de Nascimento:</span>
                <p>{formatDate(member.birthDate)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Estado Civil:</span>
                <p>{getMaritalStatusLabel(member.maritalStatus)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadge(member.status)}`}>
                  {getStatusLabel(member.status)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço e Contatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Endereço:</span>
                <p>{member.address || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Cidade/Estado:</span>
                <p>{member.city && member.state ? `${member.city}, ${member.state}` : 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">CEP:</span>
                <p>{member.zipCode || 'Não informado'}</p>
              </div>
              {member.emergencyContact && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Contato de Emergência:</span>
                  <p>{member.emergencyContact} {member.emergencyPhone && `- ${member.emergencyPhone}`}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos e Profissão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">CPF:</span>
                <p>{member.cpf || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">RG:</span>
                <p>{member.rg || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Profissão:</span>
                <p>{member.profession || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Escolaridade:</span>
                <p>{member.education || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Membro desde:</span>
                <p>{formatDate(member.memberSince)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LGPD - Consentimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status do Consentimento:</span>
                <div className="mt-1">
                  {member.dataConsent ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      ✓ Consentimento Concedido
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      ⚠ Consentimento Pendente
                    </span>
                  )}
                </div>
              </div>
              {member.consentDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Data do Consentimento:</span>
                  <p>{new Date(member.consentDate).toLocaleString('pt-BR')}</p>
                </div>
              )}
              {member.consentRevokedAt && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Data da Revogação:</span>
                  <p className="text-red-600 dark:text-red-400">
                    {new Date(member.consentRevokedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              {!member.dataConsent && !member.consentRevokedAt && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Este membro ainda não confirmou o consentimento para tratamento de dados pessoais. 
                    Ele pode fazer isso através do aplicativo mobile.
                  </p>
                </div>
              )}
              {!member.dataConsent && member.consentRevokedAt && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Este membro revogou o consentimento para tratamento de dados pessoais em{' '}
                    {new Date(member.consentRevokedAt).toLocaleString('pt-BR')}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {member.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{member.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="attendance" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="attendance">
                  <Calendar className="h-4 w-4 mr-2" />
                  Frequência
                </TabsTrigger>
                <TabsTrigger value="ministries">
                  <Users className="h-4 w-4 mr-2" />
                  Ministérios
                </TabsTrigger>
                <TabsTrigger value="baptisms">
                  <Award className="h-4 w-4 mr-2" />
                  Batismos
                </TabsTrigger>
                <TabsTrigger value="discipleships">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Discipulados
                </TabsTrigger>
                <TabsTrigger value="courses">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Cursos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attendance" className="mt-4">
                <AttendanceTab memberId={member.id} />
              </TabsContent>

              <TabsContent value="ministries" className="mt-4">
                <MinistryTab memberId={member.id} />
              </TabsContent>

              <TabsContent value="baptisms" className="mt-4">
                <BaptismTab memberId={member.id} />
              </TabsContent>

              <TabsContent value="discipleships" className="mt-4">
                <DiscipleshipTab memberId={member.id} />
              </TabsContent>

              <TabsContent value="courses" className="mt-4">
                <CourseTab memberId={member.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Definir credenciais de acesso</DialogTitle>
              <DialogDescription>
                Defina ou redefina a senha de acesso do membro ao aplicativo/mobile.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email do membro</Label>
                <p className="text-sm text-muted-foreground">
                  {member.email || 'Nenhum e-mail cadastrado. Defina um e-mail na edição do membro para permitir login.'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar nova senha</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Após salvar, informe ao membro a senha definida. Recomende que ele altere a senha após o primeiro acesso (quando essa funcionalidade estiver disponível).
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCredentialsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveCredentials}
                disabled={savingCredentials}
              >
                {savingCredentials ? 'Salvando...' : 'Salvar senha'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}

