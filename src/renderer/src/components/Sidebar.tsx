import { useTranslation } from 'react-i18next'
import type { Language, Theme, UpdateState } from '../../../shared/contracts'
import { Icon } from './Icon'

interface Props { open: boolean; active: 'home' | 'create' | 'settings'; projectCount: number; theme: Theme; language: Language; updateState: UpdateState; onClose(): void; onToggle(): void; onSearch(): void; onNavigate(view: 'home' | 'create' | 'settings'): void; onTheme(theme: Theme): void; onLanguage(language: Language): void; onDownloadUpdate(): void; onInstallUpdate(): void; onCheckUpdate(): void }
export function Sidebar({ open, active, projectCount, theme, language, updateState, onClose, onToggle, onSearch, onNavigate, onTheme, onLanguage, onDownloadUpdate, onInstallUpdate, onCheckUpdate }: Props) {
  const { t } = useTranslation()
  const go = (view: 'home' | 'create' | 'settings') => { onNavigate(view); onClose() }
  const updateAction = updateState.status === 'downloaded' ? onInstallUpdate : updateState.status === 'available' ? onDownloadUpdate : onCheckUpdate
  const updateLabel = updateState.status === 'downloaded' ? t('update.install') : updateState.status === 'downloading' ? `${t('update.downloading')} ${Math.round(updateState.percent ?? 0)}%` : updateState.status === 'available' ? t('update.download') : updateState.status === 'checking' ? t('update.checking') : t('update.current')
  return <><button className={`sidebar-scrim ${open ? 'is-open' : ''}`} aria-label={t('sidebar.close')} tabIndex={open ? 0 : -1} onClick={onClose} />
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <header><button className="rail-toggle" onClick={onToggle} aria-label={open ? t('sidebar.collapse') : t('sidebar.expand')}><Icon name={open ? 'panelClose' : 'panelOpen'} size={20} /></button>{open && <strong>Kaiwen</strong>}</header>
      <nav aria-label={t('sidebar.mainMenu')}>
        <button title={t('sidebar.search')} onClick={onSearch}><Icon name="search" /><span>{t('sidebar.search')}</span><small>⌘K</small></button>
        <button title={t('sidebar.projects')} className={active === 'home' ? 'is-active' : ''} onClick={() => go('home')}><Icon name="home" /><span>{t('sidebar.projects')}</span><small>{projectCount}</small></button>
        <button title={t('sidebar.newProject')} className={active === 'create' ? 'is-active' : ''} onClick={() => go('create')}><Icon name="plus" /><span>{t('sidebar.newProject')}</span></button>
      </nav>
      <footer><div className="sidebar-utilities">
        {(updateState.status === 'available' || updateState.status === 'downloading' || updateState.status === 'downloaded') && <button title={updateLabel} className="sidebar-utility update-utility" onClick={updateAction} disabled={updateState.status === 'downloading'}><Icon name="download" /><span>{updateLabel}</span>{updateState.status === 'downloading' && <i style={{ width: `${updateState.percent ?? 0}%` }} />}</button>}
        <button title={t('sidebar.theme')} className="sidebar-utility" onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /><span>{theme === 'dark' ? t('sidebar.light') : t('sidebar.dark')}</span></button>
        <button title={t('sidebar.language')} className="sidebar-utility" onClick={() => onLanguage(language === 'tr' ? 'en' : 'tr')}><Icon name="languages" /><span>{language === 'tr' ? 'English' : 'Türkçe'}</span></button>
      </div><button title={t('sidebar.settings')} className={`sidebar-settings ${active === 'settings' ? 'is-active' : ''}`} onClick={() => go('settings')}><Icon name="settings" /><span>{t('sidebar.settings')}</span></button></footer>
    </aside></>
}
