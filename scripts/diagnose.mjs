/**
 * Diagnostic détaillé Supabase — inspection des erreurs 500
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const envPath = resolve(root, 'apps', 'web', '.env.local')
const envFile = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envFile.split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const idx = t.indexOf('=')
  if (idx < 0) continue
  env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim()
}

const URL  = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '')
const KEY  = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const headers = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }

console.log('\n🔍 Diagnostic HTTP 500 sur la table "users"\n')

// Test 1 : HEAD (comme avant)
let r = await fetch(`${URL}/rest/v1/users?select=*`, { method: 'HEAD', headers })
console.log(`HEAD /users → ${r.status}`)

// Test 2 : GET avec body pour voir l'erreur détaillée
r = await fetch(`${URL}/rest/v1/users?select=id&limit=1`, { headers })
const body = await r.text()
console.log(`GET  /users → ${r.status} : ${body}`)

// Test 3 : Vérifier si c'est une infinite recursion RLS
r = await fetch(`${URL}/rest/v1/exercise_library?select=id&limit=1`, { headers })
const body2 = await r.text()
console.log(`GET  /exercise_library → ${r.status} : ${body2}`)

// Test 4 : Storage via API v2
r = await fetch(`${URL}/storage/v1/bucket`, { headers })
console.log(`GET  /storage/v1/bucket → ${r.status} : ${(await r.text()).slice(0, 200)}`)
