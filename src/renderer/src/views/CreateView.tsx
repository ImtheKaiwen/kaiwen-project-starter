import { useEffect, useMemo, useState } from 'react'
import type { AppSettings, CreateProjectRequest, CustomMarkdown, LogoDescriptor, TemplateDescriptor } from '../../../shared/contracts'
import { slugifyProjectName } from '../../../shared/pathSafety'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { Icon } from '../components/Icon'
import { SelectControl } from '../components/SelectControl'

interface Props { settings: AppSettings; logos: LogoDescriptor[]; onBack(): void; onCreated(message: string): void }
export function CreateView({ settings, logos, onBack, onCreated }: Props) {
  const categories = settings.categories.filter((item) => item.enabled)
  const [name, setName] = useState(''); const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [templates, setTemplates] = useState<TemplateDescriptor[]>([]); const [custom, setCustom] = useState<CustomMarkdown[]>([])
  const [includeLogos, setIncludeLogos] = useState(settings.defaults.includeLogos); const [github, setGithub] = useState(settings.defaults.createGithubRepo)
  const [visibility, setVisibility] = useState(settings.defaults.githubVisibility); const [initGit, setInitGit] = useState(settings.defaults.initGit)
  const [openEditor, setOpenEditor] = useState(settings.defaults.openInEditor); const [copyPrompt, setCopyPrompt] = useState(settings.defaults.copyPrompt)
  const [expanded, setExpanded] = useState(false); const [editing, setEditing] = useState<{ kind: 'template' | 'custom'; index: number; content: string } | null>(null)
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  useEffect(() => { void window.kaiwen.listTemplates(categoryId).then((result) => result.ok ? setTemplates(result.value) : setError(result.error)) }, [categoryId])
  const slug = useMemo(() => { try { return slugifyProjectName(name) } catch { return '' } }, [name])
  const category = categories.find((item) => item.id === categoryId); const destination = slug && category ? `${settings.workspaceRoot}\\${category.relativePath.replaceAll('/', '\\')}\\${slug}` : 'Proje adıyla oluşacak'
  const openTemplate = async (index: number) => { const item = templates[index]; if (!item) return; const result = await window.kaiwen.readTemplate(item.sourcePath); if (result.ok) setEditing({ kind: 'template', index, content: item.content ?? result.value }); else setError(result.error) }
  const importMarkdown = async () => { const result = await window.kaiwen.chooseMarkdown(); if (result.ok) setCustom((items) => [...items, ...result.value]); else setError(result.error) }
  const submit = async () => {
    setError(''); if (!slug) { setError('Geçerli bir proje adı girin.'); return }
    setBusy(true)
    const request: CreateProjectRequest = { name, categoryId, templates, customMarkdown: custom, includeLogos, createGithubRepo: github, githubVisibility: visibility, initGit: github ? true : initGit, openInEditor: openEditor, copyPrompt }
    const result = await window.kaiwen.createProject(request); setBusy(false)
    if (!result.ok) { setError(result.error); return }
    const suffix = result.value.githubUrl ? ` GitHub: ${result.value.githubUrl}` : ''
    onCreated(`“${result.value.project.name}” oluşturuldu.${suffix}${result.value.warnings.length ? ` Uyarı: ${result.value.warnings.join(' ')}` : ''}`)
  }
  return <main className="create-page">
    <header className="create-header"><button className="back-button" onClick={onBack}><Icon name="back" size={16} /> Projeler</button><h1>Yeni proje</h1><button className="button button--primary" onClick={() => void submit()} disabled={busy || !slug}>{busy ? 'Oluşturuluyor…' : 'Proje oluştur'} <Icon name="arrow" size={15} /></button></header>
    <div className="create-content">
      <section className="create-section"><div className="create-section__title"><h2>Proje bilgileri</h2><p>Projenin adı, türü ve kaydedileceği konum.</p></div><div className="create-section__controls">
        <div className="field-grid"><label className="field"><span>Proje adı</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Örn. Kaiwen Notes" /><small>Repo ve klasör adı: <strong>{slug || '—'}</strong></small></label>
          <label className="field"><span>Proje türü</span><SelectControl ariaLabel="Proje türü" value={categoryId} onChange={setCategoryId} options={categories.map((item) => ({ value: item.id, label: item.name, description: item.relativePath }))} /></label></div>
        <div className="target-preview"><span>Hedef klasör</span><code>{destination}</code></div>
      </div></section>
      <section className="create-section"><div className="create-section__title"><h2>Proje belgeleri</h2><p>Başlangıç bağlamına eklenecek Markdown şablonları.</p></div><div className="create-section__controls">
        <button className="disclosure" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}><span>Belgeleri seçin <small>{templates.filter((item) => item.selected).length + custom.length} seçili</small></span><Icon name="chevronDown" size={16} /></button>
        {expanded && <div className="document-panel">
        {templates.length ? templates.map((item, index) => <div className="document-row" key={item.id}><label className="check"><input type="checkbox" checked={item.selected} onChange={() => setTemplates((items) => items.map((entry, itemIndex) => itemIndex === index ? { ...entry, selected: !entry.selected } : entry))} /><span><strong>{item.name}</strong><small>{item.profile}</small></span></label><button className="text-button" onClick={() => void openTemplate(index)}>Görüntüle / Düzenle</button></div>) : <div className="empty compact">Bu profil için şablon bulunamadı.</div>}
        {custom.map((item, index) => <div className="document-row" key={`${item.name}-${index}`}><span><strong>{item.name}</strong><small>özel</small></span><span><button className="text-button" onClick={() => setEditing({ kind: 'custom', index, content: item.content })}>Düzenle</button><button className="text-button danger" onClick={() => setCustom((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Kaldır</button></span></div>)}
        <div className="document-actions"><button className="button button--ghost" onClick={() => void importMarkdown()}>Markdown dosyası ekle</button><button className="button button--ghost" onClick={() => { const index = custom.length; setCustom((items) => [...items, { name: `OZEL-${index + 1}.md`, content: '# Yeni Belge\n' }]); setEditing({ kind: 'custom', index, content: '# Yeni Belge\n' }) }}>Yeni Markdown yaz</button></div>
        </div>}
      </div></section>
      <section className="create-section"><div className="create-section__title"><h2>Oluşturma seçenekleri</h2><p>Git, GitHub ve oluşturma sonrası işlemler.</p></div><div className="create-section__controls option-stack"><label className="toggle-row"><span><strong>Kaiwen logolarını ekle</strong><small>{logos.length ? `${logos.length} varyant bulundu` : 'Logo bulunamadı; proje yine oluşturulabilir'}</small></span><input type="checkbox" checked={includeLogos} onChange={(event) => setIncludeLogos(event.target.checked)} disabled={!logos.length} /></label>
        <label className="toggle-row"><span><strong>GitHub reposu oluştur</strong><small>Uzak repo önce oluşturulur; ardından dosyalar ve ilk push hazırlanır.</small></span><input type="checkbox" checked={github} onChange={(event) => setGithub(event.target.checked)} /></label>
        {github && <div className="github-options"><div className="segmented"><button className={visibility === 'private' ? 'active' : ''} onClick={() => setVisibility('private')}>Private</button><button className={visibility === 'public' ? 'active' : ''} onClick={() => setVisibility('public')}>Public</button></div>{visibility === 'public' && <p className="warning">Seçili belgeler ve logolar herkese açık repoya gönderilir. İçerikleri kontrol edin.</p>}<small>Repo: {settings.githubOwner || 'bağlı hesap'}/{slug || 'proje-slug'}</small></div>}
        {!github && <label className="toggle-row compact-row"><span><strong>Yerel Git deposu başlat</strong></span><input type="checkbox" checked={initGit} onChange={(event) => setInitGit(event.target.checked)} /></label>}
        <label className="toggle-row compact-row"><span><strong>Oluşturulunca VS Code’da aç</strong></span><input type="checkbox" checked={openEditor} onChange={(event) => setOpenEditor(event.target.checked)} /></label>
        <label className="toggle-row compact-row"><span><strong>Başlangıç promptunu panoya kopyala</strong></span><input type="checkbox" checked={copyPrompt} onChange={(event) => setCopyPrompt(event.target.checked)} /></label>
      </div></section>
      {error && <div className="alert create-alert" role="alert">{error}</div>}
    </div>
    {editing && <MarkdownEditor title={editing.kind === 'template' ? templates[editing.index]?.name ?? 'Şablon' : custom[editing.index]?.name ?? 'Özel belge'} content={editing.content} onChange={(content) => setEditing({ ...editing, content })} onSave={() => { if (editing.kind === 'template') setTemplates((items) => items.map((item, index) => index === editing.index ? { ...item, content: editing.content } : item)); else setCustom((items) => items.map((item, index) => index === editing.index ? { ...item, content: editing.content } : item)); setEditing(null) }} onClose={() => setEditing(null)} />}
  </main>
}
