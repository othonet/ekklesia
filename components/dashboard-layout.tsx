'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from './sidebar'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { LogOut, User, Shield } from 'lucide-react'
import Link from 'next/link'
import { getUserFromToken, type UserInfo } from '@/lib/utils-client'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userInfo = getUserFromToken()
    setUser(userInfo)
  }, [])

  const handleLogout = () => {
    // Remover apenas o cookie da igreja (church_token)
    localStorage.removeItem('token')
    document.cookie = 'church_token=; path=/; max-age=0; SameSite=Lax'
    // Não remover platform_token para manter sessão da plataforma
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Sistema de Gestão</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {mounted && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.role === 'ADMIN' ? 'Administrador' : 
                         user.role === 'PASTOR' ? 'Pastor' :
                         user.role === 'LEADER' ? 'Líder' : 'Membro'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  {/* Privacidade removida - membros acessam via link público com token único */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
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

