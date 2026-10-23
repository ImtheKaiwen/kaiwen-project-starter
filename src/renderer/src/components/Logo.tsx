import { useState } from 'react'

export function Logo({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Kaiwen">
    {!failed ? <picture><source media="(prefers-color-scheme: dark)" srcSet="/branding/logos/kaiwen-logo-transparent-white.png" /><img src="/branding/logos/kaiwen-logo-transparent.png" alt="" onError={() => setFailed(true)} /></picture> : <span className="brand__fallback">K</span>}
    {!compact && <span>Kaiwen</span>}
  </div>
}
