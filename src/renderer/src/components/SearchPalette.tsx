import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectRecord } from '../../../shared/contracts'
import { searchProjects } from '../../../shared/search'
import { Icon } from './Icon'

interface Props { open: boolean; projects: ProjectRecord[]; onClose(): void; onOpen(project: ProjectRecord): Promise<void>; onNavigate(view: 'create' | 'settings'): void }

export function SearchPalette({ open, projects, onClose, onOpen, onNavigate }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(''); const [active, setActive] = useState(0); const input = useRef<HTMLInputElement>(null)
  const results = useMemo(() => searchProjects(projects, query).slice(0, 8), [projects, query])
  useEffect(() => { if (open) requestAnimationFrame(() => { setQuery(''); setActive(0); input.current?.focus() }) }, [open])
  if (!open) return null
  const keyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)) }
    if (event.key === 'Enter' && results[active]) { event.preventDefault(); void onOpen(results[active]).then(onClose) }
  }
  return <div className="palette-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="search-palette" role="dialog" aria-modal="true" aria-label={t('search.aria')}>
      <div className="palette-input"><Icon name="search" size={20} /><input ref={input} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} onKeyDown={keyDown} placeholder={t('search.placeholder')} /><kbd>Esc</kbd></div>
      {!query && <><p className="palette-label">{t('search.actions')}</p><div className="palette-actions"><button onClick={() => { onNavigate('create'); onClose() }}><span><Icon name="plus" /></span><strong>{t('search.create')}</strong><small>Ctrl N</small></button><button onClick={() => { onNavigate('settings'); onClose() }}><span><Icon name="settings" /></span><strong>{t('search.settings')}</strong></button></div></>}
      <p className="palette-label">{query ? t('search.results') : t('search.recent')}</p>
      <div className="palette-results" role="listbox">
        {results.length ? results.map((project, index) => <button key={project.id} className={index === active ? 'is-active' : ''} onMouseEnter={() => setActive(index)} onClick={() => void onOpen(project).then(onClose)} role="option" aria-selected={index === active}>
          <span className="palette-project-icon"><Icon name="folder" size={17} /></span><span><strong>{project.name}</strong><small>{project.path}</small></span><span className="palette-enter">↵</span>
        </button>) : <div className="palette-empty">{t('search.empty', { query })}</div>}
      </div>
      <footer><span><kbd>↑</kbd><kbd>↓</kbd> {t('search.navigate')}</span><span><kbd>↵</kbd> {t('search.open')}</span><span><kbd>Esc</kbd> {t('search.close')}</span></footer>
    </section>
  </div>
}
