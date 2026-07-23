import { useEffect } from 'react'
import { SplashScreen, Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { startNetworkSyncListener, syncPendingData } from '../src/lib/offline/sync'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    // Synchro initiale au démarrage
    syncPendingData().catch(console.error)

    // Écoute les changements réseau pour synchro auto
    const unsubscribe = startNetworkSyncListener()

    SplashScreen.hideAsync()

    return () => unsubscribe()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0A0A0F" />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#111118',
              borderTopColor: 'rgba(255,255,255,0.06)',
              borderTopWidth: 1,
              height: 80,
              paddingBottom: 16,
              paddingTop: 10,
            },
            tabBarActiveTintColor: '#CCFF00',
            tabBarInactiveTintColor: '#555568',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Accueil',
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="home" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="workout"
            options={{
              title: 'Entraînement',
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="dumbbell" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="diet"
            options={{
              title: 'Diéta',
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="apple" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: 'Progrès',
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="trending-up" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Messages',
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="message-circle" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profil',
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="user" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

// Simple icon placeholder (to be replaced with @expo/vector-icons)
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const { Feather } = require('@expo/vector-icons')
  return <Feather name={name} size={size} color={color} />
}
