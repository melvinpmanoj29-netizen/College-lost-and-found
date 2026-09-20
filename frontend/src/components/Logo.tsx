
interface LogoProps {
  size?: number
  className?: string
  variant?: 'full' | 'icon-only'
}

export default function Logo({ size = 32, className = '', variant = 'icon-only' }: LogoProps) {
  return (
    <div className={`brand-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3872e6" />
            <stop offset="100%" stopColor="#2558be" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#89ecb0" />
            <stop offset="100%" stopColor="#38ef7d" />
          </linearGradient>
        </defs>
        
        {/* Shield / Badge Background */}
        <rect width="40" height="40" rx="10" fill="url(#brandGrad)" />
        
        {/* Interlocking geometric loop / search beacon */}
        <path
          d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="4.2" fill="#ffffff" />
        
        {/* Sparkle recovery beacon */}
        <path
          d="M26 12L27.5 15L30.5 16.5L27.5 18L26 21L24.5 18L21.5 16.5L24.5 15L26 12Z"
          fill="url(#accentGrad)"
        />
        <circle cx="28" cy="28" r="2.5" fill="url(#accentGrad)" />
      </svg>

      {variant === 'full' && (
        <span className="brand-title" style={{ fontWeight: 700, fontSize: '1.08rem', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
          College <span style={{ color: 'var(--color-primary)' }}>Lost &amp; Found</span>
        </span>
      )}
    </div>
  )
}
