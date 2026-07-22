import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Database } from '@lmm/supabase'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string
  || process.env.EXPO_PUBLIC_SUPABASE_URL as string
  || ''

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string
  || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string
  || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
