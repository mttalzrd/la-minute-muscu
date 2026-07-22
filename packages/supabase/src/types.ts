// ============================================================
// Supabase Database Types — Auto-generated skeleton
// Run: npx supabase gen types typescript --project-id <id> > packages/supabase/src/types.ts
// to regenerate after schema changes.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'coach' | 'adherent'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'coach' | 'adherent'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'coach' | 'adherent'
          created_at?: string
        }
      }
      profiles_adherents: {
        Row: {
          user_id: string
          poids: number | null
          taille: number | null
          mensurations: Json
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          poids?: number | null
          taille?: number | null
          mensurations?: Json
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          poids?: number | null
          taille?: number | null
          mensurations?: Json
          avatar_url?: string | null
          updated_at?: string
        }
      }
      exercise_library: {
        Row: {
          id: string
          nom: string
          groupe_musculaire: string
          description: string | null
          tips_coach: string | null
          video_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nom: string
          groupe_musculaire: string
          description?: string | null
          tips_coach?: string | null
          video_url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nom?: string
          groupe_musculaire?: string
          description?: string | null
          tips_coach?: string | null
          video_url?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          nom: string
          adherent_id: string
          coach_id: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          nom: string
          adherent_id: string
          coach_id?: string | null
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          nom?: string
          adherent_id?: string
          coach_id?: string | null
          created_at?: string
          is_active?: boolean
        }
      }
      sessions: {
        Row: {
          id: string
          program_id: string
          nom: string
          jour_semaine: number | null
          ordre: number
        }
        Insert: {
          id?: string
          program_id: string
          nom: string
          jour_semaine?: number | null
          ordre: number
        }
        Update: {
          id?: string
          program_id?: string
          nom?: string
          jour_semaine?: number | null
          ordre?: number
        }
      }
      session_exercises: {
        Row: {
          id: string
          session_id: string
          exercise_id: string | null
          series: number | null
          repetitions: string | null
          rpe: number | null
          tempo: string | null
          repos_secondes: number | null
          ordre: number
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id?: string | null
          series?: number | null
          repetitions?: string | null
          rpe?: number | null
          tempo?: string | null
          repos_secondes?: number | null
          ordre: number
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string | null
          series?: number | null
          repetitions?: string | null
          rpe?: number | null
          tempo?: string | null
          repos_secondes?: number | null
          ordre?: number
        }
      }
      tracking_activity: {
        Row: {
          id: string
          user_id: string
          date: string
          calories_consommees: number | null
          pas_quotidiens: number | null
          is_workout_done: boolean
          poids_du_jour: number | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          calories_consommees?: number | null
          pas_quotidiens?: number | null
          is_workout_done?: boolean
          poids_du_jour?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          calories_consommees?: number | null
          pas_quotidiens?: number | null
          is_workout_done?: boolean
          poids_du_jour?: number | null
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string | null
          session_exercise_id: string | null
          date: string
          charge: number | null
          repetitions_realisees: number | null
          serie_numero: number | null
          logged_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_exercise_id?: string | null
          date: string
          charge?: number | null
          repetitions_realisees?: number | null
          serie_numero?: number | null
          logged_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_exercise_id?: string | null
          date?: string
          charge?: number | null
          repetitions_realisees?: number | null
          serie_numero?: number | null
          logged_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string | null
          receiver_id: string | null
          content: string
          timestamp: string
          is_read: boolean
        }
        Insert: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          content: string
          timestamp?: string
          is_read?: boolean
        }
        Update: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          content?: string
          timestamp?: string
          is_read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'coach' | 'adherent'
    }
  }
}

// Convenience type aliases
export type UserRole = Database['public']['Enums']['user_role']
export type UserRow = Database['public']['Tables']['users']['Row']
export type ProfileAdherentRow = Database['public']['Tables']['profiles_adherents']['Row']
export type ExerciseRow = Database['public']['Tables']['exercise_library']['Row']
export type ProgramRow = Database['public']['Tables']['programs']['Row']
export type SessionRow = Database['public']['Tables']['sessions']['Row']
export type SessionExerciseRow = Database['public']['Tables']['session_exercises']['Row']
export type TrackingRow = Database['public']['Tables']['tracking_activity']['Row']
export type WorkoutLogRow = Database['public']['Tables']['workout_logs']['Row']
export type MessageRow = Database['public']['Tables']['messages']['Row']
