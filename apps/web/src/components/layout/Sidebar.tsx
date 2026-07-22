'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CalendarDays,
  MessageSquare,
  Settings,
  TrendingUp,
  Flame,
  LogOut,
} from 'lucide-react'

const navItems = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/adherents', icon: Users, label: 'Adhérents' },
      { href: '/programmes', icon: CalendarDays, label: 'Programmes' },
    ],
  },
  {
    section: 'Contenu',
    items: [
      { href: '/exercices', icon: Dumbbell, label: 'Exercices' },
      { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'var(--gradient-gold)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
              flexShrink: 0,
            }}>
              <Flame size={20} color="#000" fill="#000" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}>
                La Minute
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '-0.02em',
                color: 'var(--gold-primary)',
                lineHeight: 1.2,
              }}>
                Muscu
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <div className="nav-section-label">Compte</div>
          <Link href="/settings" className="nav-link">
            <Settings size={18} />
            <span>Paramètres</span>
          </Link>
          <button className="nav-link" style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', color: 'var(--accent-red)' }}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* User card at bottom */}
      <div className="sidebar-user">
        <div className="sidebar-user-card">
          <div className="avatar-fallback" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
            C
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Coach
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              La Minute Muscu
            </div>
          </div>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent-green)',
            boxShadow: '0 0 8px var(--accent-green)',
          }} />
        </div>
      </div>
    </aside>
  )
}
