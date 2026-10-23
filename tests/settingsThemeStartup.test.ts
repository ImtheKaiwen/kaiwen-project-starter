import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultSettings } from '../src/shared/defaults'
import { SettingsService } from '../src/main/services/settingsService'
import { readStartup, syncStartup, type LoginItemAdapter } from '../src/main/services/startupService'

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))) })

describe('settings, theme and startup', () => {
  it('varsayılan tema sistem, startup ve GitHub kapalıdır; ayarlar atomik okunur', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'kaiwen-settings-')); roots.push(root)
    const service = new SettingsService(path.join(root, 'data', 'settings.json'), root)
    const settings = await service.get(); expect(settings.theme).toBe('system'); expect(settings.startAtLogin).toBe(false); expect(settings.defaults.createGithubRepo).toBe(false)
    settings.theme = 'dark'; await service.save(settings); expect((await service.get()).theme).toBe('dark')
  })
  it('merkezi tema tokenlarını açık/koyu temada tanımlar', async () => {
    const css = await readFile(path.resolve('src/renderer/src/styles.css'), 'utf8')
    for (const token of ['--color-bg', '--color-surface', '--color-text', '--color-muted', '--color-border', '--color-accent', '--radius-md', '--space-3']) expect(css).toContain(token)
    expect(css).toContain(":root[data-theme='dark']"); expect(css).toContain("prefers-color-scheme: dark")
  })
  it('development build startup kaydı yazmaz; packaged build OS gerçek durumunu döndürür', () => {
    let actual = false; let writes = 0
    const adapter: LoginItemAdapter = { setLoginItemSettings: ({ openAtLogin }) => { writes += 1; actual = openAtLogin }, getLoginItemSettings: () => ({ openAtLogin: actual }) }
    expect(syncStartup(false, true, adapter)).toBe(false); expect(writes).toBe(0); expect(readStartup(false, adapter)).toBe(false)
    expect(syncStartup(true, true, adapter)).toBe(true); expect(writes).toBe(1); expect(readStartup(true, adapter)).toBe(true)
  })
  it('kategori eşlemeleri kararlı kimlik ve beklenen yolları taşır', () => {
    const settings = defaultSettings('C:/Kaiwen'); expect(settings.categories.find((item) => item.id === 'library')?.relativePath).toBe('packages'); expect(settings.categories.find((item) => item.id === 'ai-speech')?.templateProfile).toBe('ai-speech')
  })
})
