'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Shield } from 'lucide-react'
import { getUserFromToken, type UserInfo } from '@/lib/utils-client'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ThemeToggle } from '@/components/theme-toggle'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Tentar obter token da plataforma primeiro
    const platformToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('platform_token='))
      ?.split('=')[1]
    
    if (platformToken) {
      // Decodificar token para obter informações do usuário
      try {
        const payload = JSON.parse(atob(platformToken.split('.')[1]))
        setUser({
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          churchId: payload.churchId,
        })
      } catch (e) {
        // Fallback para método antigo
        const userInfo = getUserFromToken()
        setUser(userInfo)
      }
    } else {
      const userInfo = getUserFromToken()
      setUser(userInfo)
    }
  }, [])

  const handleLogout = () => {
    // Remover apenas o cookie da plataforma (platform_token)
    localStorage.removeItem('token')
    document.cookie = 'platform_token=; path=/; max-age=0; SameSite=Lax'
    // Não remover church_token para manter sessão da igreja
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Plataforma Multitenancy</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {mounted && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Super Administrador
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair da Plataforma
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!mounted && (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

