import { access, constants, mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { AppSettings } from '../../shared/contracts'
import { DEFAULT_CATEGORIES, defaultSettings } from '../../shared/defaults'
import { validateRelativeDirectory } from '../../shared/pathSafety'
import { JsonStore } from './jsonStore'

export class SettingsService {
  private readonly store: JsonStore<AppSettings>
  constructor(filePath: string, private readonly defaultRoot: string) { this.store = new JsonStore(filePath, () => defaultSettings(defaultRoot)) }

  async get(): Promise<AppSettings> {
    const raw = await this.store.read()
    return { ...defaultSettings(this.defaultRoot), ...raw, defaults: { ...defaultSettings().defaults, ...raw.defaults }, categories: Array.isArray(raw.categories) ? raw.categories : DEFAULT_CATEGORIES, quickCreatePresets: Array.isArray(raw.quickCreatePresets) ? raw.quickCreatePresets : [] }
  }

  async save(settings: AppSettings): Promise<AppSettings> {
    if (settings.version !== 1 || !['system', 'light', 'dark'].includes(settings.theme)) throw new Error('Desteklenmeyen ayar biçimi.')
    if (!settings.workspaceRoot || !path.isAbsolute(settings.workspaceRoot)) throw new Error('Geçerli bir çalışma alanı kökü seçin.')
    await mkdir(settings.workspaceRoot, { recursive: true }); await access(settings.workspaceRoot, constants.R_OK | constants.W_OK)
    const seen = new Set<string>()
    for (const category of settings.categories) {
      if (!category.id || seen.has(category.id)) throw new Error('Kategori kimlikleri boş veya tekrar eden olamaz.')
      seen.add(category.id); validateRelativeDirectory(category.relativePath)
    }
    if (!Array.isArray(settings.quickCreatePresets) || settings.quickCreatePresets.length > 50) throw new Error('En fazla 50 hızlı oluşturma senaryosu kaydedilebilir.')
    const presetIds = new Set<string>()
    for (const preset of settings.quickCreatePresets) {
      if (!preset.id || presetIds.has(preset.id) || !preset.name.trim()) throw new Error('Senaryo adı ve kimliği benzersiz olmalıdır.')
      if (!settings.categories.some((category) => category.id === preset.categoryId && category.enabled)) throw new Error(`${preset.name} için etkin bir kategori seçin.`)
      presetIds.add(preset.id)
    }
    await this.store.write(settings); return settings
  }
}
