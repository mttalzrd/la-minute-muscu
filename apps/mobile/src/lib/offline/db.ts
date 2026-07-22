import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db
  db = await SQLite.openDatabaseAsync('lmm_offline.db')
  await initSchema(db)
  return db
}

async function initSchema(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Séances téléchargées pour consultation offline
    CREATE TABLE IF NOT EXISTS offline_sessions (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL,
      nom TEXT NOT NULL,
      jour_semaine INTEGER,
      ordre INTEGER,
      synced_at INTEGER DEFAULT (strftime('%s','now'))
    );

    -- Exercices de chaque séance (offline)
    CREATE TABLE IF NOT EXISTS offline_session_exercises (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES offline_sessions(id) ON DELETE CASCADE,
      exercise_nom TEXT NOT NULL,
      exercise_groupe TEXT,
      exercise_tips TEXT,
      exercise_video_url TEXT,
      series INTEGER,
      repetitions TEXT,
      rpe REAL,
      tempo TEXT,
      repos_secondes INTEGER,
      ordre INTEGER
    );

    -- Logs de séance non synchronisés
    CREATE TABLE IF NOT EXISTS pending_workout_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_exercise_id TEXT,
      date TEXT NOT NULL,
      charge REAL,
      repetitions_realisees INTEGER,
      serie_numero INTEGER,
      logged_at INTEGER DEFAULT (strftime('%s','now')),
      is_synced INTEGER DEFAULT 0
    );

    -- Tracking quotidien en attente de synchro
    CREATE TABLE IF NOT EXISTS pending_tracking (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      calories_consommees INTEGER,
      pas_quotidiens INTEGER,
      is_workout_done INTEGER DEFAULT 0,
      poids_du_jour REAL,
      is_synced INTEGER DEFAULT 0
    );
  `)
}

// ============================================================
// Queries — Offline Sessions
// ============================================================

export async function saveSessionOffline(session: {
  id: string
  program_id: string
  nom: string
  jour_semaine: number | null
  ordre: number
}) {
  const db = await getDatabase()
  await db.runAsync(
    `INSERT OR REPLACE INTO offline_sessions (id, program_id, nom, jour_semaine, ordre) VALUES (?, ?, ?, ?, ?)`,
    [session.id, session.program_id, session.nom, session.jour_semaine, session.ordre]
  )
}

export async function getOfflineSessions(): Promise<any[]> {
  const db = await getDatabase()
  return await db.getAllAsync(`SELECT * FROM offline_sessions ORDER BY ordre`)
}

// ============================================================
// Queries — Workout Logs (pending sync)
// ============================================================

export async function saveWorkoutLogOffline(log: {
  id: string
  user_id: string
  session_exercise_id: string
  date: string
  charge: number
  repetitions_realisees: number
  serie_numero: number
}) {
  const db = await getDatabase()
  await db.runAsync(
    `INSERT OR REPLACE INTO pending_workout_logs
     (id, user_id, session_exercise_id, date, charge, repetitions_realisees, serie_numero, is_synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [log.id, log.user_id, log.session_exercise_id, log.date, log.charge, log.repetitions_realisees, log.serie_numero]
  )
}

export async function getPendingLogs(): Promise<any[]> {
  const db = await getDatabase()
  return await db.getAllAsync(`SELECT * FROM pending_workout_logs WHERE is_synced = 0`)
}

export async function markLogSynced(id: string) {
  const db = await getDatabase()
  await db.runAsync(`UPDATE pending_workout_logs SET is_synced = 1 WHERE id = ?`, [id])
}

// ============================================================
// Queries — Tracking (pending sync)
// ============================================================

export async function saveTrackingOffline(tracking: {
  id: string
  user_id: string
  date: string
  calories_consommees?: number
  pas_quotidiens?: number
  is_workout_done?: boolean
  poids_du_jour?: number
}) {
  const db = await getDatabase()
  await db.runAsync(
    `INSERT OR REPLACE INTO pending_tracking
     (id, user_id, date, calories_consommees, pas_quotidiens, is_workout_done, poids_du_jour, is_synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      tracking.id, tracking.user_id, tracking.date,
      tracking.calories_consommees ?? null,
      tracking.pas_quotidiens ?? null,
      tracking.is_workout_done ? 1 : 0,
      tracking.poids_du_jour ?? null,
    ]
  )
}

export async function getPendingTracking(): Promise<any[]> {
  const db = await getDatabase()
  return await db.getAllAsync(`SELECT * FROM pending_tracking WHERE is_synced = 0`)
}

export async function markTrackingSynced(id: string) {
  const db = await getDatabase()
  await db.runAsync(`UPDATE pending_tracking SET is_synced = 1 WHERE id = ?`, [id])
}
