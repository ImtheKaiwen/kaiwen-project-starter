import { useState } from 'react'

export function Logo({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Kaiwen">
    {!failed ? <span className="brand__images"><img className="brand__image brand__image--dark" src="/branding/logos/kaiwen-logo-transparent.png" alt="" onError={() => setFailed(true)} /><img className="brand__image brand__image--light" src="/branding/logos/kaiwen-logo-transparent-white.png" alt="" /></span> : <span className="brand__fallback">K</span>}
    {!compact && <span>Kaiwen</span>}
  </div>
}
