'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@lmm/supabase'

/**
 * Browser-side Supabase client for Next.js.
 * Use this in Client Components (components with 'use client').
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
