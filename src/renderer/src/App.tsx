import { useEffect, useState } from 'react'
import type { AppSettings, LogoDescriptor, ProjectRecord } from '../../shared/contracts'
import { HomeView } from './views/HomeView'
import { CreateView } from './views/CreateView'
import { SettingsView } from './views/SettingsView'
import { Logo } from './components/Logo'
import { Sidebar } from './components/Sidebar'
import { SearchPalette } from './components/SearchPalette'

type View = 'home' | 'create' | 'settings'
export function App() {
  const [view, setView] = useState<View>('home'); const [settings, setSettings] = useState<AppSettings | null>(null)
  const [projects, setProjects] = useState<ProjectRecord[]>([]); const [logos, setLogos] = useState<LogoDescriptor[]>([])
  const [error, setError] = useState(''); const [notice, setNotice] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  useEffect(() => { void window.kaiwen.bootstrap().then((result) => {
    if (result.ok) {
      setSettings(result.value.settings); setProjects(result.value.projects); setLogos(result.value.logos)
      window.setTimeout(() => { void window.kaiwen.refreshProjects().then((refresh) => { if (refresh.ok) setProjects(refresh.value) }) }, 250)
    } else setError(result.error)
  }) }, [])
  useEffect(() => {
    if (!settings) return
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.dataset.motion = settings.reducedMotion ? 'reduced' : 'normal'
  }, [settings])
  useEffect(() => {
    const closeSidebar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') { event.preventDefault(); setView('create'); setSearchOpen(false) }
    }
    window.addEventListener('keydown', closeSidebar); return () => window.removeEventListener('keydown', closeSidebar)
  }, [])
  const open = async (project: ProjectRecord) => { const result = await window.kaiwen.openProject(project.id); if (!result.ok) setError(result.error); else setProjects((items) => items.map((item) => item.id === project.id ? { ...item, lastOpenedAt: new Date().toISOString() } : item)) }
  if (!settings && !error) return <div className="splash"><div className="splash__mark"><Logo compact /></div><div className="splash__copy"><strong>Kaiwen</strong><span>Project Starter</span></div><div className="splash__progress"><i /></div></div>
  if (error && !settings) return <div className="fatal"><Logo /><h1>Uygulama başlatılamadı</h1><p>{error}</p></div>
  if (!settings) return null
  const changeTheme = (theme: AppSettings['theme']) => { const value = { ...settings, theme }; setSettings(value); void window.kaiwen.setTheme(theme); void window.kaiwen.saveSettings(value).then((result) => { if (result.ok) setSettings(result.value); else setError(result.error) }) }
  return <><Sidebar open={sidebarOpen} active={view} projectCount={projects.length} theme={settings.theme} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen((value) => !value)} onSearch={() => setSearchOpen(true)} onNavigate={setView} onTheme={changeTheme} />
    <div className="app-main">
      {view === 'home' && <HomeView projects={projects} onOpen={open} onCreate={() => setView('create')} onSettings={() => setView('settings')} onSearch={() => setSearchOpen(true)} />}
      {view === 'create' && <CreateView settings={settings} logos={logos} onBack={() => setView('home')} onCreated={(message) => { setNotice(message); void window.kaiwen.bootstrap().then((result) => { if (result.ok) { setProjects(result.value.projects); setLogos(result.value.logos) } }); setView('home') }} />}
      {view === 'settings' && <SettingsView initial={settings} projects={projects} onBack={() => setView('home')} onSaved={(value) => setSettings(value)} onProjects={setProjects} />}
    </div>
    <SearchPalette open={searchOpen} projects={projects} onClose={() => setSearchOpen(false)} onOpen={open} onNavigate={setView} />
    {(error || notice) && <div className={`toast ${error ? 'toast--error' : ''}`} role="status"><span>{error || notice}</span><button onClick={() => { setError(''); setNotice('') }}>×</button></div>}</>
}
