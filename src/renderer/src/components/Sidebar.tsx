import type { Theme } from '../../../shared/contracts'
import { Icon } from './Icon'
import { Logo } from './Logo'

interface Props { open: boolean; active: 'home' | 'create' | 'settings'; projectCount: number; theme: Theme; onClose(): void; onNavigate(view: 'home' | 'create' | 'settings'): void; onTheme(theme: Theme): void }
export function Sidebar({ open, active, projectCount, theme, onClose, onNavigate, onTheme }: Props) {
  const go = (view: 'home' | 'create' | 'settings') => { onNavigate(view); onClose() }
  return <><button className={`sidebar-scrim ${open ? 'is-open' : ''}`} aria-label="Menüyü kapat" tabIndex={open ? 0 : -1} onClick={onClose} />
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open}>
      <header><Logo /><button className="icon-button" onClick={onClose} aria-label="Menüyü kapat"><Icon name="close" /></button></header>
      <nav aria-label="Ana menü">
        <button className={active === 'home' ? 'is-active' : ''} onClick={() => go('home')}><Icon name="home" /><span>Ana ekran</span><small>{projectCount}</small></button>
        <button className={active === 'create' ? 'is-active' : ''} onClick={() => go('create')}><Icon name="plus" /><span>Yeni proje</span></button>
        <button className={active === 'settings' ? 'is-active' : ''} onClick={() => go('settings')}><Icon name="settings" /><span>Ayarlar</span></button>
      </nav>
      <footer><span>Görünüm</span><div className="sidebar-theme" role="group" aria-label="Tema"><button className={theme === 'light' ? 'is-active' : ''} onClick={() => onTheme('light')}>Açık</button><button className={theme === 'system' ? 'is-active' : ''} onClick={() => onTheme('system')}>Sistem</button><button className={theme === 'dark' ? 'is-active' : ''} onClick={() => onTheme('dark')}>Koyu</button></div><p>Kaiwen Project Starter<br />Yerel ve güvenli.</p></footer>
    </aside></>
}
