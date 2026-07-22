type BadgeVariant = 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'gray'

const COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  gold:   { bg: 'rgba(245,158,11,0.1)',  text: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
  green:  { bg: 'rgba(16,185,129,0.1)', text: '#10B981', border: 'rgba(16,185,129,0.2)' },
  red:    { bg: 'rgba(239,68,68,0.1)',   text: '#EF4444', border: 'rgba(239,68,68,0.2)' },
  blue:   { bg: 'rgba(99,102,241,0.1)', text: '#6366F1', border: 'rgba(99,102,241,0.2)' },
  purple: { bg: 'rgba(139,92,246,0.1)', text: '#8B5CF6', border: 'rgba(139,92,246,0.2)' },
  gray:   { bg: 'rgba(255,255,255,0.06)', text: 'var(--text-muted)', border: 'var(--border-subtle)' },
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
}

export function Badge({ variant = 'gray', children }: BadgeProps) {
  const c = COLORS[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  )
}
