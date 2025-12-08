'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, User, Heart, AlertCircle, Plus } from 'lucide-react'
import { useCache } from '@/hooks/use-cache'

interface PastoralVisit {
  id: string
  visitDate: string
  visitType: string
  location: string | null
  reason: string
  notes: string | null
  pastor: {
    id: string
    name: string
  }
}

interface PrayerRequest {
  id: string
  requestedBy: string
  type: string
  urgency: string
  status: string
  createdAt: string
}

interface MemberNeed {
  id: string
  type: string
  urgency: string
  status: string
  description: string | null
  createdAt: string
}

interface PastoralData {
  visits: PastoralVisit[]
  prayers: PrayerRequest[]
  needs: MemberNeed[]
}

export function PastoralTab({ memberId }: { memberId: string }) {
  const { data, loading, refresh } = useCache<PastoralData>(
    `pastoral_member_${memberId}`,
    async () => {
      const token = localStorage.getItem('token')
      const [visitsRes, prayersRes, needsRes] = await Promise.all([
        fetch(`/api/pastoral/visits?memberId=${memberId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/pastoral/prayers?memberId=${memberId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/pastoral/needs?memberId=${memberId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      const visits = visitsRes.ok ? (await visitsRes.json()).visits : []
      const prayers = prayersRes.ok ? (await prayersRes.json()).prayers : []
      const needs = needsRes.ok ? (await needsRes.json()).needs : []

      return { visits, prayers, needs }
    },
    { cacheDuration: 3 * 60 * 1000 }
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getVisitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DOMICILIARY: 'Domiciliar',
      HOSPITAL: 'Hospitalar',
      OFFICE: 'Escritório',
      PHONE: 'Telefone',
      VIDEO_CALL: 'Videochamada',
      OTHER: 'Outro',
    }
    return labels[type] || type
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      REGULAR: 'Acompanhamento regular',
      ILLNESS: 'Doença/Enfermidade',
      GRIEF: 'Luto',
      FAMILY_CRISIS: 'Crise familiar',
      CONVERSION: 'Conversão',
      OTHER: 'Outro',
    }
    return labels[reason] || reason
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANSWERED':
      case 'ATTENDED':
        return 'text-green-600'
      case 'PENDING':
      case 'REQUESTED':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const visits = data?.visits || []
  const prayers = data?.prayers || []
  const needs = data?.needs || []

  return (
    <div className="space-y-6">
      {/* Visitas Pastorais */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Visitas Pastorais</h3>
          <Button
            size="sm"
            onClick={() => window.location.href = `/dashboard/pastoral/visits?memberId=${memberId}`}
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Visita
          </Button>
        </div>
        {visits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma visita registrada
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {visits.map((visit) => (
              <Card key={visit.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(visit.visitDate)}</span>
                        <span className="text-sm text-muted-foreground">
                          • {getVisitTypeLabel(visit.visitType)}
                        </span>
                      </div>
                      {visit.location && (
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{visit.location}</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Motivo: {getReasonLabel(visit.reason)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Pastor: {visit.pastor.name}
                      </div>
                      {visit.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {visit.notes.substring(0, 150)}...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pedidos de Oração */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pedidos de Oração</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = `/dashboard/pastoral/prayers?memberId=${memberId}`}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Pedido
          </Button>
        </div>
        {prayers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum pedido de oração registrado
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {prayers.map((prayer) => (
              <Card key={prayer.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{prayer.requestedBy}</span>
                        <span className={`text-sm ${getUrgencyColor(prayer.urgency)}`}>
                          • {prayer.urgency}
                        </span>
                        <span className={`text-sm ${getStatusColor(prayer.status)}`}>
                          • {prayer.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tipo: {prayer.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(prayer.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Necessidades */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Necessidades</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = `/dashboard/pastoral/needs?memberId=${memberId}`}
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Necessidade
          </Button>
        </div>
        {needs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma necessidade registrada
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {needs.map((need) => (
              <Card key={need.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{need.type}</span>
                        <span className={`text-sm ${getUrgencyColor(need.urgency)}`}>
                          • {need.urgency}
                        </span>
                        <span className={`text-sm ${getStatusColor(need.status)}`}>
                          • {need.status}
                        </span>
                      </div>
                      {need.description && (
                        <div className="text-sm text-muted-foreground">
                          {need.description}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {formatDate(need.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

