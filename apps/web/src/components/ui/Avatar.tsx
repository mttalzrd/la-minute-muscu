const AVATAR_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']

function stringToColor(str: string): string {
  return AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length]
}

interface AvatarProps {
  email: string
  imageUrl?: string | null
  size?: number
}

// 🎨 Avatar avec image ou initiale colorée
export function Avatar({ email, imageUrl, size = 40 }: AvatarProps) {
  const color = stringToColor(email)
  const initial = email.slice(0, 1).toUpperCase()

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={email}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}20`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}
