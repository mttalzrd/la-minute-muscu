import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// ============================================================
// Supabase Client — Shared Package
// Used by both apps/web (Next.js) and apps/mobile (Expo)
// ============================================================

const supabaseUrl = (
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : undefined
) ?? (
  typeof globalThis !== 'undefined' && (globalThis as any).expo
    ? (globalThis as any).expo?.modules?.EXPO_PUBLIC_SUPABASE_URL
    : undefined
) ?? ''

const supabaseAnonKey = (
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : undefined
) ?? (
  typeof globalThis !== 'undefined' && (globalThis as any).expo
    ? (globalThis as any).expo?.modules?.EXPO_PUBLIC_SUPABASE_ANON_KEY
    : undefined
) ?? ''

/**
 * Browser/client-side Supabase client.
 * Use this in React components and Expo screens.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/**
 * Factory for creating a fresh Supabase client with custom config.
 * Useful for server-side rendering in Next.js.
 */
export function createSupabaseClient(url: string, anonKey: string) {
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  })
}

export type { Database }
export * from './types'
