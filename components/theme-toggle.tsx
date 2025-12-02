'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evitar hidratação mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="h-4 w-4" />
    } else if (theme === 'light') {
      return <Sun className="h-4 w-4" />
    } else {
      return <Monitor className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    if (theme === 'dark') {
      return 'Tema escuro'
    } else if (theme === 'light') {
      return 'Tema claro'
    } else {
      return 'Tema do sistema'
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  )
}

