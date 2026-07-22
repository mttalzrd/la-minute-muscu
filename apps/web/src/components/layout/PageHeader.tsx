interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

// 🎨 En-tête de page réutilisable
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>{actions}</div>}
    </div>
  )
}
