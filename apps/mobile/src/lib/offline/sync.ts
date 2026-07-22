import NetInfo from '@react-native-community/netinfo'
import { supabase } from '../supabase'
import {
  getPendingLogs,
  markLogSynced,
  getPendingTracking,
  markTrackingSynced,
} from './db'

let isSyncing = false

/**
 * Lance la synchronisation de toutes les données locales non synchronisées
 * vers Supabase. Doit être appelé :
 * - Au démarrage de l'app
 * - Quand la connexion réseau revient
 * - Après une séance
 */
export async function syncPendingData(): Promise<{ logsSync: number; trackingSync: number }> {
  if (isSyncing) return { logsSync: 0, trackingSync: 0 }

  // Vérifier la connectivité
  const state = await NetInfo.fetch()
  if (!state.isConnected || !state.isInternetReachable) {
    console.log('[Sync] Pas de connexion internet, sync reportée')
    return { logsSync: 0, trackingSync: 0 }
  }

  isSyncing = true
  let logsSync = 0
  let trackingSync = 0

  try {
    // =========================================
    // 1. Synchroniser les workout logs
    // =========================================
    const pendingLogs = await getPendingLogs()
    for (const log of pendingLogs) {
      const { error } = await supabase.from('workout_logs').upsert({
        id: log.id,
        user_id: log.user_id,
        session_exercise_id: log.session_exercise_id || null,
        date: log.date,
        charge: log.charge,
        repetitions_realisees: log.repetitions_realisees,
        serie_numero: log.serie_numero,
        logged_at: new Date(log.logged_at * 1000).toISOString(),
      })
      if (!error) {
        await markLogSynced(log.id)
        logsSync++
      } else {
        console.error('[Sync] Erreur sync log:', error.message)
      }
    }

    // =========================================
    // 2. Synchroniser le tracking quotidien
    // =========================================
    const pendingTracking = await getPendingTracking()
    for (const tracking of pendingTracking) {
      const { error } = await supabase.from('tracking_activity').upsert({
        id: tracking.id,
        user_id: tracking.user_id,
        date: tracking.date,
        calories_consommees: tracking.calories_consommees,
        pas_quotidiens: tracking.pas_quotidiens,
        is_workout_done: tracking.is_workout_done === 1,
        poids_du_jour: tracking.poids_du_jour,
      })
      if (!error) {
        await markTrackingSynced(tracking.id)
        trackingSync++
      } else {
        console.error('[Sync] Erreur sync tracking:', error.message)
      }
    }

    console.log(`[Sync] ✅ ${logsSync} logs + ${trackingSync} tracking synchronisés`)
  } catch (err) {
    console.error('[Sync] Erreur générale:', err)
  } finally {
    isSyncing = false
  }

  return { logsSync, trackingSync }
}

/**
 * Écoute les changements de connectivité et déclenche
 * automatiquement la synchronisation au retour de la connexion.
 */
export function startNetworkSyncListener(): () => void {
  let wasOffline = false

  const unsubscribe = NetInfo.addEventListener(state => {
    const isOnline = state.isConnected && state.isInternetReachable

    if (isOnline && wasOffline) {
      console.log('[Sync] Connexion rétablie, démarrage de la synchronisation...')
      syncPendingData().catch(console.error)
    }

    wasOffline = !isOnline
  })

  return unsubscribe
}
