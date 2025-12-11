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
  Building,
  UserCheck,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUserFromToken, type UserInfo } from '@/lib/utils-client'
import { useChurchModules } from '@/lib/module-permissions-client'
import { canAccessRoute, hasModuleAccess } from '@/lib/permissions'
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
  PASTORAL: { name: 'Acompanhamento Pastoral', href: '/dashboard/pastoral', icon: Heart },
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
  const [isLeader, setIsLeader] = useState(false)
  const { modules, loading: modulesLoading } = useChurchModules()

  useEffect(() => {
    setMounted(true)
    const userInfo = getUserFromToken()
    setUser(userInfo)
    
    // Verificar se o usuário é líder de algum ministério
    if (userInfo && userInfo.churchId) {
      checkIfLeader()
    }
  }, [])

  const checkIfLeader = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const res = await fetch('/api/leadership/ministries', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setIsLeader(data.isLeader || false)
      }
    } catch (error) {
      console.error('Erro ao verificar liderança:', error)
    }
  }

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

  // Verificar permissões do usuário
  const userRole = user?.role || 'MEMBER'
  const hasDashboardAccess = canAccessRoute(userRole, '/dashboard')
  const isPlatformAdmin = user?.isPlatformAdmin === true
  
  // Construir navegação baseada nas permissões do usuário e módulos disponíveis
  const navigationToShow = hasDashboardAccess
    ? [
        // Dashboard sempre disponível se tiver acesso
        ...(canAccessRoute(userRole, '/dashboard') ? [dashboardNav] : []),
        // Filtrar módulos baseado em permissões
        ...modules
          .filter((m) => {
            // Verificar se o módulo está disponível no plano
            if (!m.route || !moduleNavigationMap[m.key]) return false
            // Verificar se o usuário tem permissão para acessar o módulo
            return hasModuleAccess(userRole, m.key.toLowerCase())
          })
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
        {/* Seção Plataforma Multitenancy - Apenas para platform admins */}
        {isPlatformAdmin && (
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Plataforma
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
              <Shield className="h-5 w-5" />
              Gerenciar Plataforma
            </Link>
          </div>
        )}

        {/* Seção Liderança - Apenas para líderes de ministérios */}
        {hasDashboardAccess && isLeader && (
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Liderança
            </div>
            <Link
              href="/dashboard/leadership"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/dashboard/leadership')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <UserCheck className="h-5 w-5" />
              Meus Ministérios
            </Link>
          </div>
        )}

        {/* Seção Administração da Igreja - Módulos baseados em permissões e plano */}
        {hasDashboardAccess && navigationToShow.length > 0 && (
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

