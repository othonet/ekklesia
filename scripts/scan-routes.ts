#!/usr/bin/env tsx
/**
 * Script para escanear todas as rotas do sistema e mapear para módulos
 * Gera documentação automática de rotas -> módulos
 */

import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

interface RouteInfo {
  route: string
  module?: string
  description?: string
  file: string
}

// Mapeamento de rotas para módulos (baseado na estrutura atual)
const routeToModuleMap: Record<string, string> = {
  '/dashboard/members': 'MEMBERS',
  '/dashboard/finances': 'FINANCES',
  '/dashboard/ministries': 'MINISTRIES',
  '/dashboard/assets': 'ASSETS',
  '/dashboard/events': 'EVENTS',
  '/dashboard/courses': 'COURSES',
  '/dashboard/certificates': 'CERTIFICATES',
  '/dashboard/analytics': 'ANALYTICS',
  '/dashboard/finances/reports': 'REPORTS',
  '/dashboard/finances/budgets': 'BUDGETS',
  '/transparency': 'TRANSPARENCY',
  '/dashboard/pastoral': 'PASTORAL',
}

// Descrições dos módulos
const moduleDescriptions: Record<string, string> = {
  MEMBERS: 'Gerenciamento de membros (CRUD básico)',
  FINANCES: 'Gerenciamento de finanças (Dízimos e ofertas)',
  MINISTRIES: 'Gerenciamento de ministérios',
  ASSETS: 'Gerenciamento de patrimônio',
  EVENTS: 'Gerenciamento de eventos',
  COURSES: 'Gerenciamento de cursos',
  CERTIFICATES: 'Gerenciamento de certificados',
  ANALYTICS: 'Análises e métricas do sistema',
  REPORTS: 'Relatórios financeiros detalhados',
  BUDGETS: 'Gerenciamento de orçamentos',
  TRANSPARENCY: 'Portal de transparência',
  PASTORAL: 'Acompanhamento Pastoral',
}

function scanDirectory(dir: string, baseRoute: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = []
  
  if (!existsSync(dir)) {
    return routes
  }

  const entries = readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const route = baseRoute + '/' + entry.name.replace(/\[([^\]]+)\]/g, ':$1')
    
    if (entry.isDirectory()) {
      // Verificar se tem page.tsx
      const pagePath = join(fullPath, 'page.tsx')
      if (existsSync(pagePath)) {
        const cleanRoute = route.replace(/\/page$/, '')
        routes.push({
          route: cleanRoute,
          module: routeToModuleMap[cleanRoute],
          description: routeToModuleMap[cleanRoute] 
            ? moduleDescriptions[routeToModuleMap[cleanRoute]]
            : undefined,
          file: pagePath,
        })
      }
      
      // Continuar escaneando subdiretórios
      routes.push(...scanDirectory(fullPath, route))
    }
  }
  
  return routes
}

function generateRouteModuleMap(): void {
  console.log('🔍 Escaneando rotas do sistema...\n')
  
  const appDir = join(process.cwd(), 'app')
  const dashboardRoutes = scanDirectory(join(appDir, 'dashboard'), '/dashboard')
  const transparencyRoute: RouteInfo = {
    route: '/transparency',
    module: 'TRANSPARENCY',
    description: moduleDescriptions.TRANSPARENCY,
    file: join(appDir, 'transparency', 'page.tsx'),
  }
  
  const allRoutes = [...dashboardRoutes, transparencyRoute]
  
  // Agrupar por módulo
  const routesByModule: Record<string, RouteInfo[]> = {}
  const routesWithoutModule: RouteInfo[] = []
  
  for (const route of allRoutes) {
    if (route.module) {
      if (!routesByModule[route.module]) {
        routesByModule[route.module] = []
      }
      routesByModule[route.module].push(route)
    } else {
      routesWithoutModule.push(route)
    }
  }
  
  // Gerar documentação
  console.log('📊 Mapeamento de Rotas para Módulos\n')
  console.log('='.repeat(80))
  console.log('\n## Módulos e suas Rotas\n')
  
  // Ordenar módulos
  const sortedModules = Object.keys(routesByModule).sort()
  
  for (const module of sortedModules) {
    console.log(`\n### ${module} - ${moduleDescriptions[module] || 'Sem descrição'}`)
    console.log('```')
    for (const route of routesByModule[module]) {
      console.log(`  ${route.route}`)
    }
    console.log('```')
  }
  
  if (routesWithoutModule.length > 0) {
    console.log('\n### Rotas sem Módulo Definido')
    console.log('```')
    for (const route of routesWithoutModule) {
      console.log(`  ${route.route}`)
    }
    console.log('```')
  }
  
  // Gerar JSON para uso programático
  const routeModuleMapping: Record<string, { module: string; description: string }> = {}
  
  for (const route of allRoutes) {
    if (route.module) {
      routeModuleMapping[route.route] = {
        module: route.module,
        description: route.description || '',
      }
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n📝 Mapeamento JSON (para uso programático):\n')
  console.log(JSON.stringify(routeModuleMapping, null, 2))
  
  console.log('\n' + '='.repeat(80))
  console.log('\n✅ Escaneamento concluído!')
  console.log(`\nTotal de rotas encontradas: ${allRoutes.length}`)
  console.log(`Rotas com módulo: ${allRoutes.length - routesWithoutModule.length}`)
  console.log(`Rotas sem módulo: ${routesWithoutModule.length}`)
}

// Executar
generateRouteModuleMap()
