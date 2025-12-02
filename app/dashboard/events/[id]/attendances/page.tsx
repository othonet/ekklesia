'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, XCircle, Users } from 'lucide-react'

interface Attendance {
  id: string
  member: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  present: boolean
  date: string
  createdAt: string
}

interface AttendanceData {
  event: {
    id: string
    title: string
    date: string
  }
  total: number
  confirmed: number
  notConfirmed: number
  attendances: Attendance[]
}

export default function EventAttendancesPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<AttendanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/events/${params.id}/attendances`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const attendanceData = await response.json()
        setData(attendanceData)
      }
    } catch (error) {
      console.error('Erro ao buscar confirmações:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Card>
            <CardContent className="p-6">
              <p>Nenhuma confirmação encontrada.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const confirmed = data.attendances.filter(a => a.present)
  const notConfirmed = data.attendances.filter(a => !a.present)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/events')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{data.event.title}</h1>
              <p className="text-muted-foreground">
                {new Date(data.event.date).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Confirmações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Membros que responderam
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.confirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Vão comparecer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Não Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.notConfirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Não vão comparecer
              </p>
            </CardContent>
          </Card>
        </div>

        {confirmed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Membros que Confirmaram Presença ({confirmed.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {confirmed.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{attendance.member.name}</p>
                      {attendance.member.email && (
                        <p className="text-sm text-muted-foreground">{attendance.member.email}</p>
                      )}
                      {attendance.member.phone && (
                        <p className="text-sm text-muted-foreground">{attendance.member.phone}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(attendance.createdAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {notConfirmed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Membros que Não Confirmaram ({notConfirmed.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notConfirmed.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{attendance.member.name}</p>
                      {attendance.member.email && (
                        <p className="text-sm text-muted-foreground">{attendance.member.email}</p>
                      )}
                      {attendance.member.phone && (
                        <p className="text-sm text-muted-foreground">{attendance.member.phone}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(attendance.createdAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.attendances.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum membro confirmou presença neste evento ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

