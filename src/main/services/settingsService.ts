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
    return { ...defaultSettings(this.defaultRoot), ...raw, defaults: { ...defaultSettings().defaults, ...raw.defaults }, categories: Array.isArray(raw.categories) ? raw.categories : DEFAULT_CATEGORIES }
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
    await this.store.write(settings); return settings
  }
}
