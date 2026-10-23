import { access, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { app, BrowserWindow, clipboard, dialog, ipcMain, nativeTheme, shell } from 'electron'
import type { AppSettings, CreateProjectRequest, KaiwenApi, Result, Theme } from '../shared/contracts'
import { IPC } from '../shared/contracts'
import { validateRelativeDirectory } from '../shared/pathSafety'
import type { SettingsService } from './services/settingsService'
import type { TemplateService } from './services/templateService'
import type { ProjectCatalog } from './services/projectCatalog'
import type { ProjectCreationService } from './services/projectCreationService'
import type { GithubService } from './services/githubService'
import type { CommandRunner } from './services/commandRunner'
import { readStartup, syncStartup } from './services/startupService'

interface Services { settings: SettingsService; templates: TemplateService; catalog: ProjectCatalog; creator: ProjectCreationService; github: GithubService; runner: CommandRunner }
const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const failure = (error: unknown): Result<never> => ({ ok: false, error: error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.' })

export function registerIpc(window: BrowserWindow, services: Services): void {
  const handle = <K extends keyof KaiwenApi>(channel: string, fn: (...args: any[]) => ReturnType<KaiwenApi[K]>) => {
    ipcMain.handle(channel, async (event, ...args) => {
      const senderUrl = event.senderFrame?.url ?? ''
      if (event.sender !== window.webContents || (senderUrl && !isTrustedUrl(senderUrl))) return failure(new Error('Yetkisiz IPC isteği reddedildi.'))
      try { return await fn(...args) } catch (error) { return failure(error) }
    })
  }
  handle(IPC.bootstrap, async () => {
    const settings = await services.settings.get(); const projects = await services.catalog.read(); const logos = await services.creator.listLogos(settings)
    return ok({ settings, projects, logos })
  })
  handle(IPC.chooseWorkspace, async () => ok((await dialog.showOpenDialog(window, { title: 'Kaiwen çalışma alanını seç', properties: ['openDirectory', 'createDirectory'] })).filePaths[0] ?? null))
  handle(IPC.chooseBranding, async () => ok((await dialog.showOpenDialog(window, { title: 'Logo klasörünü seç', properties: ['openDirectory'] })).filePaths[0] ?? null))
  handle(IPC.chooseEditor, async () => ok((await dialog.showOpenDialog(window, { title: 'Editör uygulamasını seç', properties: ['openFile'], filters: [{ name: 'Uygulamalar', extensions: ['exe', 'cmd'] }] })).filePaths[0] ?? null))
  handle(IPC.chooseMarkdown, async () => {
    const files = (await dialog.showOpenDialog(window, { title: 'Markdown belgeleri seç', properties: ['openFile', 'multiSelections'], filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }] })).filePaths
    const output = []
    for (const file of files) { const info = await stat(file); if (info.size > 1024 * 1024) throw new Error(`${path.basename(file)} 1 MB sınırını aşıyor.`); output.push({ name: path.basename(file), content: await readFile(file, 'utf8'), sourcePath: file }) }
    return ok(output)
  })
  handle(IPC.saveSettings, async (candidate: AppSettings) => {
    assertSettings(candidate)
    const saved = await services.settings.save(candidate)
    const actualStartup = syncStartup(app.isPackaged, saved.startAtLogin, app)
    if (actualStartup !== saved.startAtLogin) { saved.startAtLogin = actualStartup; await services.settings.save(saved) }
    nativeTheme.themeSource = saved.theme
    return ok(saved)
  })
  handle(IPC.listTemplates, async (categoryId: string) => ok(await services.templates.list(await services.settings.get(), requireString(categoryId))))
  handle(IPC.readTemplate, async (sourcePath: string) => ok(await services.templates.read(await services.settings.get(), requireString(sourcePath))))
  handle(IPC.saveTemplate, async (sourcePath: string, content: string) => { await services.templates.save(await services.settings.get(), requireString(sourcePath), requireString(content)); return ok(undefined) })
  handle(IPC.refreshProjects, async () => ok(await services.catalog.refresh(await services.settings.get())))
  handle(IPC.addManualProject, async () => {
    const selected = (await dialog.showOpenDialog(window, { title: 'Projeyi ekle', properties: ['openDirectory'] })).filePaths[0]
    if (!selected) return ok(null)
    const canonical = path.resolve(selected); const settings = await services.settings.get()
    const record = { id: randomUUID(), name: path.basename(canonical), path: canonical, categoryId: settings.categories.find((item) => canonical.toLowerCase().startsWith(path.join(settings.workspaceRoot, item.relativePath).toLowerCase()))?.id ?? 'manual', lastOpenedAt: null, missing: false, manual: true }
    await services.catalog.add(record); return ok(record)
  })
  handle(IPC.removeProject, async (id: string) => ok(await services.catalog.remove(requireString(id))))
  handle(IPC.openProject, async (id: string) => {
    const settings = await services.settings.get(); const project = (await services.catalog.read()).find((item) => item.id === requireString(id))
    if (!project) throw new Error('Proje kaydı bulunamadı.')
    try { await access(project.path) } catch { throw new Error('Proje taşınmış veya silinmiş. Ayarlardan kaydı kaldırın ve yeni konumu manuel ekleyin.') }
    await launchEditor(settings, project.path, services.runner)
    await services.catalog.markOpened(project.id); return ok(undefined)
  })
  handle(IPC.createProject, async (request: CreateProjectRequest) => {
    assertCreateRequest(request); const result = await services.creator.create(await services.settings.get(), request)
    if (request.copyPrompt) clipboard.writeText(result.prompt)
    if (request.openInEditor) {
      try { await launchEditor(await services.settings.get(), result.project.path, services.runner) }
      catch (error) { result.warnings.push(error instanceof Error ? error.message : 'Proje oluşturuldu ancak editör açılamadı.') }
    }
    return ok(result)
  })
  handle(IPC.githubStatus, async () => ok(await services.github.status()))
  handle(IPC.githubLogin, async () => { await shell.openExternal('https://cli.github.com/manual/gh_auth_login'); return ok(undefined) })
  handle(IPC.setTheme, async (theme: Theme) => { if (!['system', 'light', 'dark'].includes(theme)) throw new Error('Geçersiz tema.'); nativeTheme.themeSource = theme; return ok(undefined) })
  handle(IPC.getStartupStatus, async () => ok(readStartup(app.isPackaged, app)))
}

async function launchEditor(settings: AppSettings, projectPath: string, runner: CommandRunner): Promise<void> {
  const configured = settings.editorPath.trim() || 'code'
  if (configured !== 'code' && !path.isAbsolute(configured)) throw new Error('Editör yolu geçersiz. Ayarlardan Code.exe dosyasını seçin.')
  const candidates = editorCandidates(configured)
  const args = [settings.editorWindowMode === 'reuse' ? '--reuse-window' : '--new-window', projectPath]
  let lastError = ''
  for (const command of candidates) {
    if (path.isAbsolute(command)) { try { await access(command) } catch { continue } }
    try {
      const result = await runner.run(command, args, { timeoutMs: 20_000 })
      if (result.code === 0) return
      lastError = result.stderr || result.stdout
    } catch (error) { lastError = error instanceof Error ? error.message : '' }
  }
  const wantsVsCode = configured === 'code' || /(?:^|[\\/])code(?:\.exe|\.cmd)?$/i.test(configured)
  if (wantsVsCode) {
    try { await shell.openExternal(`vscode://file/${encodeURI(projectPath.replace(/\\/g, '/').replace(/^\/+/, ''))}`); return }
    catch (error) { lastError = error instanceof Error ? error.message : lastError }
  }
  throw new Error(`Editör açılamadı.${lastError ? ` ${lastError.slice(0, 160)}` : ' Ayarlardan Code.exe dosyasını seçin.'}`)
}

function editorCandidates(configured: string): string[] {
  const candidates: string[] = []
  if (path.isAbsolute(configured)) {
    if (/code\.cmd$/i.test(configured)) candidates.push(path.resolve(path.dirname(configured), '..', 'Code.exe'))
    candidates.push(configured)
  } else {
    if (process.env.LOCALAPPDATA) candidates.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'Code.exe'))
    if (process.env.ProgramFiles) candidates.push(path.join(process.env.ProgramFiles, 'Microsoft VS Code', 'Code.exe'))
    const programFilesX86 = process.env['ProgramFiles(x86)']
    if (programFilesX86) candidates.push(path.join(programFilesX86, 'Microsoft VS Code', 'Code.exe'))
    candidates.push('code')
  }
  return [...new Set(candidates)]
}

function isTrustedUrl(url: string): boolean { return url.startsWith('file://') || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url) }
function requireString(value: unknown): string { if (typeof value !== 'string' || value.length > 32_000) throw new Error('Geçersiz istek.'); return value }
function assertSettings(value: unknown): asserts value is AppSettings {
  if (!value || typeof value !== 'object') throw new Error('Geçersiz ayarlar.')
  const settings = value as AppSettings
  if (!Array.isArray(settings.categories) || settings.categories.length > 100) throw new Error('Geçersiz kategori listesi.')
  if (!Array.isArray(settings.quickCreatePresets) || settings.quickCreatePresets.length > 50) throw new Error('Geçersiz hızlı oluşturma senaryoları.')
  settings.categories.forEach((item) => validateRelativeDirectory(item.relativePath))
}
function assertCreateRequest(value: unknown): asserts value is CreateProjectRequest {
  if (!value || typeof value !== 'object') throw new Error('Geçersiz proje oluşturma isteği.')
  const request = value as CreateProjectRequest
  requireString(request.name); requireString(request.categoryId)
  if (!Array.isArray(request.templates) || request.templates.length > 200 || !Array.isArray(request.customMarkdown) || request.customMarkdown.length > 100) throw new Error('Çok fazla belge seçildi.')
}
