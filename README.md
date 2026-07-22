# La Minute Muscu — Coaching App

Application de coaching sportif "Double Face" : Interface Coach (Web/Tablette) + Interface Adhérent (Mobile).

## 🏗️ Architecture

```
la-minute-muscu/          # Monorepo Turborepo
├── apps/
│   ├── web/              # Next.js 14 — Interface Coach
│   └── mobile/           # Expo SDK 51 — Interface Adhérent
├── packages/
│   ├── supabase/         # Client + Types Supabase partagés
│   └── config/           # TypeScript configs
└── supabase/
    └── migrations/       # Scripts SQL
```

## 🚀 Démarrage rapide

### 1. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans l'éditeur SQL → exécutez `supabase/migrations/001_initial_schema.sql`
3. Configurez les Storage Buckets : `exercise-videos` (privé) et `avatars` (public)

### 2. Variables d'environnement

**Interface Coach (Web) :**
```bash
cp apps/web/.env.example apps/web/.env.local
# Remplissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**App Mobile :**
```bash
cp apps/mobile/.env.example apps/mobile/.env.local
# Remplissez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Lancer le développement

```bash
# Interface Coach (Next.js)
cd apps/web
npm run dev
# → http://localhost:3000

# App Mobile (Expo)
cd apps/mobile
npx expo start
# → Scanner le QR code avec l'app Expo Go
```

## 🔗 Lier au GitHub distant

```bash
# 1. Créez un repo vide sur github.com (sans README)
# 2. Exécutez dans le dossier racine :
git remote add origin https://github.com/VOTRE_USERNAME/la-minute-muscu.git
git branch -M main
git push -u origin main
```

## 📊 Stack Technique

| Composant | Technologie |
|---|---|
| Interface Coach | Next.js 14 (App Router) |
| Interface Adhérent | Expo SDK 51 (React Native) |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (vidéos exercices) |
| Realtime | Supabase Realtime (messagerie) |
| Offline | expo-sqlite + NetInfo |
| Charts Web | Recharts |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion (web) / Reanimated (mobile) |

## 📱 Features

### Interface Coach
- ✅ Dashboard avec stats en temps réel
- ✅ CRM Adhérents (liste + profils)
- ✅ Bibliothèque d'exercices CRUD + upload vidéo
- ✅ Builder de programmes (drag & drop)
- ✅ Messagerie temps réel

### App Adhérent
- ✅ Dashboard avec séance du jour
- ✅ Tracker de séance (vidéo + logs + chrono récup)
- ✅ Module diététique (macros + répartition repas)
- ✅ Analytics (courbe poids + 1RM estimé)
- ✅ Chat avec le coach
- ✅ **Offline-first** : fonctionne sans réseau + synchro auto
