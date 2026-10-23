import { useEffect, useState } from 'react'
import type { AppSettings, LogoDescriptor, ProjectRecord } from '../../shared/contracts'
import { HomeView } from './views/HomeView'
import { CreateView } from './views/CreateView'
import { SettingsView } from './views/SettingsView'
import { Logo } from './components/Logo'

type View = 'home' | 'create' | 'settings'
export function App() {
  const [view, setView] = useState<View>('home'); const [settings, setSettings] = useState<AppSettings | null>(null)
  const [projects, setProjects] = useState<ProjectRecord[]>([]); const [logos, setLogos] = useState<LogoDescriptor[]>([])
  const [error, setError] = useState(''); const [notice, setNotice] = useState('')
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
  const open = async (project: ProjectRecord) => { const result = await window.kaiwen.openProject(project.id); if (!result.ok) setError(result.error); else setProjects((items) => items.map((item) => item.id === project.id ? { ...item, lastOpenedAt: new Date().toISOString() } : item)) }
  if (!settings && !error) return <div className="splash"><Logo /><span>Project Starter</span></div>
  if (error && !settings) return <div className="fatal"><Logo /><h1>Uygulama başlatılamadı</h1><p>{error}</p></div>
  if (!settings) return null
  return <>{view === 'home' && <HomeView projects={projects} onOpen={open} onCreate={() => setView('create')} onSettings={() => setView('settings')} />}
    {view === 'create' && <CreateView settings={settings} logos={logos} onBack={() => setView('home')} onCreated={(message) => { setNotice(message); void window.kaiwen.bootstrap().then((result) => { if (result.ok) { setProjects(result.value.projects); setLogos(result.value.logos) } }); setView('home') }} />}
    {view === 'settings' && <SettingsView initial={settings} projects={projects} onBack={() => setView('home')} onSaved={(value) => setSettings(value)} onProjects={setProjects} />}
    {(error || notice) && <div className={`toast ${error ? 'toast--error' : ''}`} role="status"><span>{error || notice}</span><button onClick={() => { setError(''); setNotice('') }}>×</button></div>}</>
}
