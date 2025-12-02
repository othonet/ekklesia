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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Member {
  id?: string
  name?: string
  email?: string | null
  phone?: string | null
  phone2?: string | null
  birthDate?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  status?: string
  dataConsent?: boolean
  cpf?: string | null
  rg?: string | null
  maritalStatus?: string | null
  profession?: string | null
  education?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  notes?: string | null
}

interface MemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onSuccess: () => void
}

export function MemberDialog({ open, onOpenChange, member, onSuccess }: MemberDialogProps) {
  const [formData, setFormData] = useState<Member>({
    name: '',
    email: '',
    phone: '',
    phone2: '',
    birthDate: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'ACTIVE',
    dataConsent: false,
    cpf: '',
    rg: '',
    maritalStatus: '',
    profession: '',
    education: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        phone2: member.phone2 || '',
        birthDate: member.birthDate ? member.birthDate.split('T')[0] : '',
        address: member.address || '',
        city: member.city || '',
        state: member.state || '',
        zipCode: member.zipCode || '',
        status: member.status || 'ACTIVE',
        dataConsent: member.dataConsent || false,
        cpf: member.cpf || '',
        rg: member.rg || '',
        maritalStatus: member.maritalStatus || '',
        profession: member.profession || '',
        education: member.education || '',
        emergencyContact: member.emergencyContact || '',
        emergencyPhone: member.emergencyPhone || '',
        notes: member.notes || '',
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        phone2: '',
        birthDate: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        status: 'ACTIVE',
        dataConsent: false,
        cpf: '',
        rg: '',
        maritalStatus: '',
        profession: '',
        education: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: '',
      })
    }
  }, [member, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Limpar strings vazias e preparar dados para envio
      const submitData: any = {
        name: formData.name,
        status: formData.status || 'ACTIVE',
        dataConsent: formData.dataConsent || false,
        email: formData.email && formData.email.trim() !== '' ? formData.email : null,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone : null,
        phone2: formData.phone2 && formData.phone2.trim() !== '' ? formData.phone2 : null,
        birthDate: formData.birthDate && formData.birthDate.trim() !== '' ? formData.birthDate : null,
        address: formData.address && formData.address.trim() !== '' ? formData.address : null,
        city: formData.city && formData.city.trim() !== '' ? formData.city : null,
        state: formData.state && formData.state.trim() !== '' ? formData.state.toUpperCase() : null,
        zipCode: formData.zipCode && formData.zipCode.trim() !== '' ? formData.zipCode : null,
        cpf: formData.cpf && formData.cpf.trim() !== '' ? formData.cpf.replace(/[.-]/g, '') : null,
        rg: formData.rg && formData.rg.trim() !== '' ? formData.rg : null,
        maritalStatus: formData.maritalStatus && formData.maritalStatus.trim() !== '' ? formData.maritalStatus : null,
        profession: formData.profession && formData.profession.trim() !== '' ? formData.profession : null,
        education: formData.education && formData.education.trim() !== '' ? formData.education : null,
        emergencyContact: formData.emergencyContact && formData.emergencyContact.trim() !== '' ? formData.emergencyContact : null,
        emergencyPhone: formData.emergencyPhone && formData.emergencyPhone.trim() !== '' ? formData.emergencyPhone : null,
        notes: formData.notes && formData.notes.trim() !== '' ? formData.notes : null,
      }

      const token = localStorage.getItem('token')
      const url = member?.id ? `/api/members/${member.id}` : '/api/members'
      const method = member?.id ? 'PUT' : 'POST'

      console.log('Enviando dados:', submitData)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })

      const responseData = await response.json()
      console.log('Resposta do servidor:', responseData)

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const errorMessage = responseData.error || 'Erro ao salvar membro'
        const errorDetails = responseData.details ? `\n\nDetalhes: ${JSON.stringify(responseData.details, null, 2)}` : ''
        alert(`${errorMessage}${errorDetails}`)
      }
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
      alert('Erro ao salvar membro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
          <DialogDescription>
            {member ? 'Atualize as informações do membro' : 'Adicione um novo membro à igreja'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">Telefone 2</Label>
              <Input
                id="phone2"
                value={formData.phone2 || ''}
                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf || ''}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg || ''}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Estado Civil</Label>
              <Select
                value={formData.maritalStatus || 'none'}
                onValueChange={(v) => setFormData({ ...formData, maritalStatus: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informado</SelectItem>
                  <SelectItem value="SINGLE">Solteiro(a)</SelectItem>
                  <SelectItem value="MARRIED">Casado(a)</SelectItem>
                  <SelectItem value="DIVORCED">Divorciado(a)</SelectItem>
                  <SelectItem value="WIDOWED">Viúvo(a)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profissão</Label>
              <Input
                id="profession"
                value={formData.profession || ''}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Escolaridade</Label>
            <Input
              id="education"
              value={formData.education || ''}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="Ex: Ensino Médio, Superior, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Nome do contato"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone || ''}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={formData.zipCode || ''}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status/Classificação</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Membro Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                  <SelectItem value="VISITOR">Visitante</SelectItem>
                  <SelectItem value="LEADER">Líder</SelectItem>
                  <SelectItem value="VOLUNTEER">Voluntário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre o membro..."
            />
          </div>

          {!member && (
            <div className="space-y-2">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="dataConsent"
                    checked={formData.dataConsent || false}
                    onChange={(e) => setFormData({ ...formData, dataConsent: e.target.checked })}
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="dataConsent" className="text-sm">
                    <span className="font-semibold">Adequação à LGPD *</span>
                    <br />
                    <span className="text-muted-foreground">
                      Confirmo que o membro foi informado sobre o tratamento de seus dados pessoais conforme a{' '}
                      <a href="/privacy" target="_blank" className="text-primary hover:underline">
                        Política de Privacidade
                      </a>
                      . O cadastro será realizado com base no <strong>legítimo interesse</strong> para gestão da igreja, 
                      e o membro poderá confirmar ou revogar seu consentimento posteriormente através do sistema.
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : member ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

