'use client'

export default function Chart({ title, span = 'col-span-1' }) {
  return (
    <div className={`pos-stat-card ${span}`}>
      <h3 className="text-xl font-bold mb-6 text-foreground">{title}</h3>
      <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          {/* Simple line chart placeholder */}
          <path
            d="M 20 150 L 80 100 L 140 120 L 200 60 L 260 90 L 320 40 L 380 70"
            stroke="var(--color-primary)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 20 150 L 80 100 L 140 120 L 200 60 L 260 90 L 320 40 L 380 70 L 380 160 L 20 160"
            stroke="none"
            fill="url(#gradient)"
            opacity="0.1"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
