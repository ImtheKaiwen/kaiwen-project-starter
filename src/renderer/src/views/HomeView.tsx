import type { ProjectRecord, QuickCreatePreset } from '../../../shared/contracts'
import { Icon } from '../components/Icon'

interface Props { projects: ProjectRecord[]; presets: QuickCreatePreset[]; onOpen(project: ProjectRecord): Promise<void>; onCreate(presetId?: string): void; onSearch(): void }
export function HomeView({ projects, presets, onOpen, onCreate, onSearch }: Props) {
  const recents = [...projects].sort((a, b) => Date.parse(b.lastOpenedAt ?? '1970-01-01') - Date.parse(a.lastOpenedAt ?? '1970-01-01')).slice(0, 8)
  return <main className="home-shell">
    <section className="dashboard-content">
      <div className="dashboard-toolbar"><button className="search-trigger" onClick={onSearch}><Icon name="search" size={18} /><span>Projelerde ara…</span><kbd>Ctrl K</kbd></button><button className="button button--primary" onClick={() => onCreate()}><Icon name="plus" size={16} /> Yeni proje</button></div>
      {presets.length > 0 && <section className="quick-scenarios"><div className="section-heading"><div><h2>Hızlı oluştur</h2><p>Kayıtlı senaryolarınız</p></div><span>{presets.length} senaryo</span></div><div className="scenario-grid">{presets.map((preset) => <button className="scenario-card" key={preset.id} onClick={() => onCreate(preset.id)}><span className="scenario-card__icon"><Icon name="plus" size={17} /></span><span><strong>{preset.name}</strong><small>{preset.description || 'Kayıtlı oluşturma senaryosu'}</small></span><Icon name="arrow" size={15} /><footer><span>{preset.categoryId}</span>{preset.createGithubRepo && <span>{preset.githubVisibility === 'public' ? 'Public GitHub' : 'Private GitHub'}</span>}</footer></button>)}</div></section>}
      <div className="section-heading"><div><h2>Son açılanlar</h2><p>En son çalıştığınız projeler</p></div><span>{recents.length} proje</span></div>
      <div className="project-grid">
        {recents.length ? recents.map((project) => <button key={project.id} className="project-card" onClick={() => void onOpen(project)}>
          <span className="project-card__icon"><Icon name="folder" size={20} /></span><span className="project-card__menu"><Icon name="more" size={18} /></span><strong>{project.name}</strong><small>{project.path}</small><footer><span>{project.categoryId}</span>{project.missing ? <span className="status status--warn">Konum yok</span> : <span className="card-open">Aç <Icon name="arrow" size={14} /></span>}</footer>
        </button>) : <button className="project-card project-card--empty" onClick={() => onCreate()}><span className="project-card__icon"><Icon name="plus" /></span><strong>İlk projenizi oluşturun</strong><small>Şablonlar ve kurallarla temiz bir başlangıç yapın.</small></button>}
      </div>
    </section>
  </main>
}
