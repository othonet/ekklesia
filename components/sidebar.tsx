'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  Church,
  BookOpen,
  Award,
  BarChart3,
  Target,
  Eye,
  Shield,
  Settings,
  User,
  Package,
  Building
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUserFromToken, isAdmin, type UserInfo } from '@/lib/utils-client'
import { useChurchModules } from '@/lib/module-permissions-client'
import * as Icons from 'lucide-react'

// Mapeamento de módulos para navegação
const moduleNavigationMap: Record<string, { name: string; href: string; icon: any }> = {
  MEMBERS: { name: 'Membros', href: '/dashboard/members', icon: Users },
  FINANCES: { name: 'Finanças', href: '/dashboard/finances', icon: DollarSign },
  MINISTRIES: { name: 'Ministérios', href: '/dashboard/ministries', icon: Building2 },
  ASSETS: { name: 'Patrimônio', href: '/dashboard/assets', icon: Package },
  EVENTS: { name: 'Eventos', href: '/dashboard/events', icon: Calendar },
  COURSES: { name: 'Cursos', href: '/dashboard/courses', icon: BookOpen },
  CERTIFICATES: { name: 'Certificados', href: '/dashboard/certificates', icon: Award },
  ANALYTICS: { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  REPORTS: { name: 'Relatórios Financeiros', href: '/dashboard/finances/reports', icon: BarChart3 },
  BUDGETS: { name: 'Orçamentos', href: '/dashboard/finances/budgets', icon: Target },
  TRANSPARENCY: { name: 'Transparência', href: '/transparency', icon: Eye },
}

// Dashboard sempre disponível
const dashboardNav = { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }

// Navegação pessoal (para todos os usuários)
// Nota: Privacidade foi removida - membros acessam via link público com token único
const personalNavigation: Array<{ name: string; href: string; icon: any }> = []

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [mounted, setMounted] = useState(false)
  const { modules, loading: modulesLoading } = useChurchModules()

  useEffect(() => {
    setMounted(true)
    const userInfo = getUserFromToken()
    setUser(userInfo)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-full w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Ekklesia</span>
          </div>
        </div>
      </div>
    )
  }

  const userIsAdmin = isAdmin(user)
  
  // Construir navegação baseada nos módulos disponíveis
  const navigationToShow = userIsAdmin
    ? [
        dashboardNav,
        ...modules
          .filter((m) => m.route && moduleNavigationMap[m.key])
          .map((m) => ({
            ...moduleNavigationMap[m.key],
            icon: m.icon ? (Icons as any)[m.icon] || LayoutDashboard : LayoutDashboard,
          }))
          .sort((a, b) => {
            // Manter ordem do dashboard primeiro
            if (a.href === '/dashboard') return -1
            if (b.href === '/dashboard') return 1
            return 0
          }),
      ]
    : []

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Church className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Ekklesia</span>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Seção Plataforma Multitenancy - Apenas para Super Admin */}
        {userIsAdmin && (
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Plataforma Multitenancy
            </div>
            <Link
              href="/platform"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/platform')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Building className="h-5 w-5" />
              Gerenciar Plataforma
            </Link>
          </div>
        )}

        {/* Seção Administração da Igreja - Módulos baseados no plano */}
        {userIsAdmin && navigationToShow.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administração da Igreja
            </div>
            {navigationToShow.map((item) => {
              // Encontrar o item mais específico que corresponde ao pathname atual
              const matchingItems = navigationToShow.filter(navItem => {
                if (pathname === navItem.href) return true
                if (pathname.startsWith(navItem.href + '/')) return true
                return false
              })
              
              // Se houver múltiplos matches, pegar o mais específico (maior href)
              const mostSpecificMatch = matchingItems.length > 0
                ? matchingItems.reduce((prev, current) => 
                    current.href.length > prev.href.length ? current : prev
                  )
                : null
              
              // Este item está ativo apenas se for o match mais específico
              const isActive = mostSpecificMatch?.href === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}

        {/* Seção Área Pessoal - Removida pois membros não acessam dashboard */}
        {/* Membros acessam privacidade via link público com token único */}
      </nav>
    </div>
  )
}

