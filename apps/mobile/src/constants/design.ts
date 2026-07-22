// ============================================================
// DESIGN TOKENS — La Minute Muscu Mobile
// ============================================================

export const COLORS = {
  // Background
  bgBase: '#0A0A0F',
  bgSurface: '#111118',
  bgElevated: '#1A1A24',
  bgOverlay: '#22222F',

  // Gold Accents
  goldPrimary: '#F59E0B',
  goldLight: '#FCD34D',
  goldDark: '#D97706',
  goldGlow: 'rgba(245, 158, 11, 0.15)',

  // Semantic
  green: '#10B981',
  red: '#EF4444',
  blue: '#6366F1',
  purple: '#8B5CF6',

  // Text
  textPrimary: '#F1F1F3',
  textSecondary: '#9898A8',
  textMuted: '#555568',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderMedium: 'rgba(255, 255, 255, 0.1)',
  borderGold: 'rgba(245, 158, 11, 0.3)',

  // Transparent
  transparent: 'transparent',
}

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  heading: 'System',
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
}

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gold: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
}

export const GRADIENTS = {
  gold: ['#F59E0B', '#FCD34D', '#D97706'] as [string, string, string],
  surface: ['#1A1A24', '#111118'] as [string, string],
  dark: ['#0D0D15', '#0A0A0F'] as [string, string],
  greenGlow: ['rgba(16,185,129,0.2)', 'transparent'] as [string, string],
}
