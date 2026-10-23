import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProjectRecord } from '../../../shared/contracts'
import { searchProjects } from '../../../shared/search'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icon'

interface Props { projects: ProjectRecord[]; onOpen(project: ProjectRecord): Promise<void>; onCreate(): void; onSettings(): void; onMenu(): void }
export function HomeView({ projects, onOpen, onCreate, onSettings, onMenu }: Props) {
  const [query, setQuery] = useState(''); const [active, setActive] = useState(0); const input = useRef<HTMLInputElement>(null)
  const results = useMemo(() => searchProjects(projects, query).slice(0, query ? 20 : 6), [projects, query])
  useEffect(() => { input.current?.focus() }, [])
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.current?.focus() } }
    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener)
  }, [])
  const keyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)) }
    if (event.key === 'Escape') { setQuery(''); input.current?.focus() }
    if (event.key === 'Enter' && results[active]) { event.preventDefault(); void onOpen(results[active]) }
  }
  return <main className="home-shell">
    <header className="topbar"><div className="topbar__group"><button className="icon-button" onClick={onMenu} aria-label="Menüyü aç"><Icon name="menu" /></button><Logo /></div><button className="icon-button" onClick={onSettings} aria-label="Ayarlar" title="Ayarlar"><Icon name="settings" /></button></header>
    <section className="home-content">
      <p className="eyebrow">PROJECT STARTER</p><h1>Bir sonraki fikrine kaldığın yerden başla.</h1>
      <div className="search-box"><span><Icon name="search" size={21} /></span><input ref={input} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} onKeyDown={keyDown} placeholder="Proje ara…" aria-label="Proje ara" /><kbd>Ctrl K</kbd></div>
      <div className="result-head"><span>{query ? 'Sonuçlar' : 'Son açılanlar'}</span><small>{results.length} proje</small></div>
      <div className="project-list" role="listbox" aria-label="Projeler">
        {results.length ? results.map((project, index) => <button key={project.id} className={`project-row ${index === active ? 'is-active' : ''}`} onMouseEnter={() => setActive(index)} onDoubleClick={() => void onOpen(project)} onClick={() => setActive(index)} role="option" aria-selected={index === active}>
          <span className="project-icon">{project.name.slice(0, 1).toLocaleUpperCase('tr')}</span><span className="project-copy"><strong>{project.name}</strong><small>{project.path}</small></span>{project.missing ? <span className="status status--warn">Konum yok</span> : <span className="open-hint">Enter ↵</span>}
        </button>) : <div className="empty"><strong>{query ? 'Eşleşen proje yok' : 'Henüz proje bulunamadı'}</strong><span>{query ? 'Başka bir ad veya klasör yolu deneyin.' : 'Yeni proje oluşturun ya da Ayarlar’dan mevcut projeleri tarayın.'}</span></div>}
      </div>
    </section>
    <button className="new-project-button" onClick={onCreate}><Icon name="plus" /> Yeni Proje</button>
  </main>
}
