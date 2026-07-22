-- ============================================================
-- Migration 001 — Schema initial La Minute Muscu
-- À exécuter dans l'éditeur SQL de Supabase Dashboard
-- ou via: npx supabase db push
-- ============================================================

-- Extension pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users (extension de auth.users de Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'adherent' CHECK (role IN ('coach', 'adherent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Chaque user peut lire son propre profil
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Le coach peut lire tous les users
CREATE POLICY "coach_select_all_users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- Un user peut modifier son propre profil
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Trigger pour créer automatiquement l'entrée dans public.users lors d'un signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'adherent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: profiles_adherents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles_adherents (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  poids DECIMAL(5,2),
  taille INTEGER,
  mensurations JSONB DEFAULT '{}',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles_adherents ENABLE ROW LEVEL SECURITY;

-- L'adhérent peut lire/modifier son propre profil
CREATE POLICY "adherent_manage_own_profile" ON public.profiles_adherents
  FOR ALL USING (auth.uid() = user_id);

-- Le coach peut lire tous les profils
CREATE POLICY "coach_read_all_profiles" ON public.profiles_adherents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- Le coach peut modifier les profils
CREATE POLICY "coach_update_profiles" ON public.profiles_adherents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- Trigger pour créer automatiquement le profil adhérent
CREATE OR REPLACE FUNCTION public.handle_new_adherent_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'adherent' THEN
    INSERT INTO public.profiles_adherents (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created_create_profile
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_adherent_profile();

-- ============================================================
-- TABLE: exercise_library (Catalogue du Coach)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  groupe_musculaire TEXT NOT NULL,
  description TEXT,
  tips_coach TEXT,
  video_url TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- Tous les utilisateurs connectés peuvent lire la bibliothèque
CREATE POLICY "authenticated_read_exercises" ON public.exercise_library
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seul le coach peut créer/modifier/supprimer des exercices
CREATE POLICY "coach_manage_exercises" ON public.exercise_library
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- ============================================================
-- TABLE: programs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  adherent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  description TEXT
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- L'adhérent peut lire ses propres programmes
CREATE POLICY "adherent_read_own_programs" ON public.programs
  FOR SELECT USING (auth.uid() = adherent_id);

-- Le coach peut tout faire sur les programmes
CREATE POLICY "coach_manage_programs" ON public.programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- ============================================================
-- TABLE: sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  jour_semaine INTEGER CHECK (jour_semaine BETWEEN 1 AND 7),
  ordre INTEGER NOT NULL DEFAULT 1,
  description TEXT
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- L'adhérent peut lire les sessions de ses programmes
CREATE POLICY "adherent_read_own_sessions" ON public.sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = sessions.program_id
      AND programs.adherent_id = auth.uid()
    )
  );

-- Le coach peut tout faire
CREATE POLICY "coach_manage_sessions" ON public.sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- ============================================================
-- TABLE: session_exercises
-- ============================================================
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercise_library(id) ON DELETE SET NULL,
  series INTEGER,
  repetitions TEXT,        -- Ex: "8-10" ou "AMRAP"
  rpe DECIMAL(3,1),        -- Rate of Perceived Exertion 1-10
  tempo TEXT,              -- Ex: "3-1-2-0" (excentrique-pause-concentrique-pause)
  repos_secondes INTEGER,
  ordre INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

-- L'adhérent peut lire les exercices de ses sessions
CREATE POLICY "adherent_read_own_session_exercises" ON public.session_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.programs p ON p.id = s.program_id
      WHERE s.id = session_exercises.session_id
      AND p.adherent_id = auth.uid()
    )
  );

-- Le coach peut tout faire
CREATE POLICY "coach_manage_session_exercises" ON public.session_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- ============================================================
-- TABLE: tracking_activity (Suivi quotidien)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tracking_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  calories_consommees INTEGER,
  pas_quotidiens INTEGER,
  is_workout_done BOOLEAN DEFAULT false,
  poids_du_jour DECIMAL(5,2),
  UNIQUE(user_id, date)
);

ALTER TABLE public.tracking_activity ENABLE ROW LEVEL SECURITY;

-- L'adhérent peut gérer ses propres données de tracking
CREATE POLICY "adherent_manage_own_tracking" ON public.tracking_activity
  FOR ALL USING (auth.uid() = user_id);

-- Le coach peut lire tous les trackings
CREATE POLICY "coach_read_all_tracking" ON public.tracking_activity
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- ============================================================
-- TABLE: workout_logs (Logs détaillés des séances réalisées)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_exercise_id UUID REFERENCES public.session_exercises(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  charge DECIMAL(6,2),
  repetitions_realisees INTEGER,
  serie_numero INTEGER,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- L'adhérent peut gérer ses propres logs
CREATE POLICY "adherent_manage_own_logs" ON public.workout_logs
  FOR ALL USING (auth.uid() = user_id);

-- Le coach peut lire tous les logs
CREATE POLICY "coach_read_all_logs" ON public.workout_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
  );

-- ============================================================
-- TABLE: messages (Chat In-App)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Un user peut lire les messages où il est sender ou receiver
CREATE POLICY "users_read_own_messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Un user peut envoyer des messages (insérer)
CREATE POLICY "users_send_messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Un user peut marquer ses messages comme lus
CREATE POLICY "users_mark_read" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================================
-- INDEXES pour les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tracking_user_date ON public.tracking_activity(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_programs_adherent ON public.programs(adherent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_program ON public.sessions(program_id);

-- ============================================================
-- STORAGE BUCKETS (à configurer aussi dans Supabase Dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('exercise-videos', 'exercise-videos', false);
-- 
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);
