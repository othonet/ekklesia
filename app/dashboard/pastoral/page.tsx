'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Heart, Users, Calendar, Plus, Eye } from 'lucide-react'
import { useCache } from '@/hooks/use-cache'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Alert {
  type: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  memberId: string
  memberName: string
  [key: string]: any
}

interface AlertsData {
  alerts: Alert[]
  summary: {
    total: number
    critical: number
    high: number
    medium: number
  }
}

export default function PastoralPage() {
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null)

  const { data, loading, refresh } = useCache<AlertsData>(
    'pastoral_alerts',
    async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/pastoral/alerts', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        return await res.json()
      }
      return null
    },
    { cacheDuration: 5 * 60 * 1000 } // 5 minutos
  )

  useEffect(() => {
    if (data) {
      setAlertsData(data)
    }
  }, [data])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
      case 'HIGH':
        return 'bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200'
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '🔴'
      case 'HIGH':
        return '🟠'
      case 'MEDIUM':
        return '🟡'
      default:
        return '🔵'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Acompanhamento Pastoral</h1>
            <p className="text-muted-foreground">Gerencie visitas, pedidos de oração e necessidades dos membros</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.location.href = '/dashboard/pastoral/visits/new'}>
              <Plus className="h-4 w-4 mr-2" /> Nova Visita
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/pastoral/prayers'}>
              <Heart className="h-4 w-4 mr-2" /> Pedidos de Oração
            </Button>
          </div>
        </div>

        {/* Resumo */}
        {alertsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alertsData.summary.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{alertsData.summary.critical}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-600">Alta Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{alertsData.summary.high}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Média Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{alertsData.summary.medium}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alertas */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : alertsData && alertsData.alerts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Acompanhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsData.alerts.map((alert, index) => (
                  <Alert key={index} className={getSeverityColor(alert.severity)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{getSeverityIcon(alert.severity)} {alert.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/members/${alert.memberId}`}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Ver Membro
                      </Button>
                    </AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum alerta no momento. Tudo em ordem! 🎉</p>
            </CardContent>
          </Card>
        )}

        {/* Links Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-muted transition-colors" onClick={() => window.location.href = '/dashboard/pastoral/visits'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Visitas Pastorais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gerencie visitas pastorais realizadas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted transition-colors" onClick={() => window.location.href = '/dashboard/pastoral/prayers'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Pedidos de Oração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Acompanhe pedidos de oração</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted transition-colors" onClick={() => window.location.href = '/dashboard/pastoral/needs'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Necessidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gerencie necessidades dos membros</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

