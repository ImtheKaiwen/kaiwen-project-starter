import { readdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { AppSettings, TemplateDescriptor } from '../../shared/contracts'
import { assertInside } from './pathSafety'

const MAX_MARKDOWN_BYTES = 1024 * 1024

export class TemplateService {
  async list(settings: AppSettings, categoryId: string): Promise<TemplateDescriptor[]> {
    const category = settings.categories.find((item) => item.id === categoryId)
    if (!category) throw new Error('Kategori bulunamadı.')
    const profiles = category.templateProfile === 'common' ? ['common'] : ['common', category.templateProfile]
    const output: TemplateDescriptor[] = []
    for (const profile of profiles) {
      const folder = path.join(settings.templatesRoot, profile)
      let names: string[] = []
      try { names = (await readdir(folder, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md')).map((entry) => entry.name).sort() } catch { continue }
      for (const name of names) output.push({ id: `${profile}/${name}`, name, profile, sourcePath: path.join(folder, name), targetPath: `docs/standards/${profile}/${name}`, selected: true })
    }
    return output
  }

  async read(settings: AppSettings, sourcePath: string): Promise<string> {
    assertInside(settings.templatesRoot, sourcePath)
    const info = await stat(sourcePath); if (!info.isFile() || info.size > MAX_MARKDOWN_BYTES) throw new Error('Şablon geçersiz veya 1 MB sınırını aşıyor.')
    return readFile(sourcePath, 'utf8')
  }

  async save(settings: AppSettings, sourcePath: string, content: string): Promise<void> {
    assertInside(settings.templatesRoot, sourcePath)
    if (!sourcePath.toLowerCase().endsWith('.md') || Buffer.byteLength(content) > MAX_MARKDOWN_BYTES) throw new Error('Yalnızca 1 MB altındaki Markdown şablonları kaydedilebilir.')
    const previous = await readFile(sourcePath)
    const backup = `${sourcePath}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`
    const temporary = `${sourcePath}.${process.pid}.tmp`
    await writeFile(backup, previous, { flag: 'wx' })
    await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' })
    await rename(temporary, sourcePath)
  }
}
