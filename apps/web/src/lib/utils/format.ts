/**
 * Formate un poids en string avec unité
 */
export function formatPoids(kg: number | null | undefined): string {
  if (kg == null) return '—'
  return `${kg.toFixed(1)} kg`
}

/**
 * Formate une date en français
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', options ?? {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

/**
 * Retourne l'initiale d'un email (pour les avatars)
 */
export function getInitial(email: string): string {
  return email.slice(0, 1).toUpperCase()
}

/**
 * Calcul 1RM estimé — Formule de Epley
 * 1RM = charge × (1 + reps / 30)
 */
export function estimateOneRM(charge: number, reps: number): number {
  if (reps === 1) return charge
  return +(charge * (1 + reps / 30)).toFixed(1)
}
