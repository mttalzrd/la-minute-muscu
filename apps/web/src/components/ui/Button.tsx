import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

// 🎨 Composant Button — à styler avec les classes CSS du design system
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    }[size]

    return (
      <button
        ref={ref}
        className={`btn btn-${variant} ${sizeClasses} ${className}`}
        disabled={disabled || loading}
        style={{ opacity: loading ? 0.7 : 1 }}
        {...props}
      >
        {loading ? 'Chargement...' : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
