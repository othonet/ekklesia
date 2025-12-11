'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Church, Users, Calendar, DollarSign } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.token) {
        throw new Error('Token não recebido do servidor')
      }

      // Salvar token no localStorage
      localStorage.setItem('token', data.token)
      
      // Sempre redirecionar para dashboard (login do tenant)
      // Para acessar a plataforma, usar /platform/login
      window.location.href = '/dashboard'
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.')
      } else {
        setError(err.message || 'Erro ao fazer login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado Esquerdo - Conteúdo Visual */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/20 via-primary/10 to-background p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 w-full max-w-lg space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Church className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Ekklesia</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Sistema completo de gestão para igrejas
            </p>
          </div>

          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Gestão de Membros</h3>
                <p className="text-muted-foreground">
                  Controle completo de membros, visitantes e suas informações
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Eventos e Ministérios</h3>
                <p className="text-muted-foreground">
                  Organize eventos e gerencie ministérios de forma eficiente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Controle Financeiro</h3>
                <p className="text-muted-foreground">
                  Gerencie receitas, despesas e doações com transparência
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              &quot;Porque onde estiverem dois ou três reunidos em meu nome, 
              ali estou no meio deles.&quot;
            </p>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Mateus 18:20
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="flex items-center justify-center p-4 lg:p-12 relative">
        {/* Toggle de tema no canto superior direito */}
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-8">
          {/* Logo para mobile */}
          <div className="lg:hidden text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Church className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Ekklesia</h1>
            </div>
            <p className="text-muted-foreground">
              Sistema de Gestão para Igrejas
            </p>
          </div>

          <Card className="border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-center">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                <div className="text-center text-xs text-muted-foreground">
                  <p>
                    Ao entrar, você concorda com nossa{' '}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                      Política de Privacidade
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

