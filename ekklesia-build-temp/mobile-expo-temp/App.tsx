/**
 * Componente principal do app
 */
import React, { useEffect, useState, useCallback } from 'react'
import { StatusBar, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import './global.css'
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext'
import { AuthProvider } from './src/hooks/useAuth'
import AppNavigator from './src/navigation/AppNavigator'

// Manter a splash screen visível até que o app esteja pronto
SplashScreen.preventAutoHideAsync()

function AppContent() {
  const { isDark, colors } = useTheme()
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Aguardar um pouco para garantir que tudo está carregado
        await new Promise(resolve => setTimeout(resolve, 1500))
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Esconder a splash screen quando o app estiver pronto
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <View 
      style={{ flex: 1, backgroundColor: colors.background }}
      onLayout={onLayoutRootView}
    >
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
