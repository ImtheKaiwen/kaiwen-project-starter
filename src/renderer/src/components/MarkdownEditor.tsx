import { useEffect, useState } from 'react'

interface Props { title: string; content: string; onChange(content: string): void; onSave?(): void; onClose(): void }
export function MarkdownEditor({ title, content, onChange, onSave, onClose }: Props) {
  const [html, setHtml] = useState('')
  useEffect(() => {
    let current = true
    void Promise.all([import('marked'), import('sanitize-html')]).then(([markedModule, sanitizeModule]) => {
      const sanitizeHtml = sanitizeModule.default
      const parsed = markedModule.marked.parse(content, { async: false }) as string
      const safe = sanitizeHtml(parsed, { allowedTags: sanitizeHtml.defaults.allowedTags.filter((tag) => !['iframe', 'style'].includes(tag)), allowedAttributes: { a: ['href', 'title'], code: ['class'] }, allowedSchemes: ['http', 'https', 'mailto'] })
      if (current) setHtml(safe)
    })
    return () => { current = false }
  }, [content])
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <header><div><p className="eyebrow">Markdown</p><h2 id="editor-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Kapat">×</button></header>
      <div className="editor-grid">
        <label><span>İçerik</span><textarea value={content} onChange={(event) => onChange(event.target.value)} spellCheck /></label>
        <div className="preview"><span>Güvenli önizleme</span><article dangerouslySetInnerHTML={{ __html: html }} /></div>
      </div>
      <footer><button className="button button--ghost" onClick={onClose}>Kapat</button>{onSave && <button className="button" onClick={onSave}>Kaydet</button>}</footer>
    </section>
  </div>
}
