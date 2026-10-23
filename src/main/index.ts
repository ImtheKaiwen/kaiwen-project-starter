import { app, BrowserWindow, Menu, nativeTheme, Tray } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerIpc } from './ipc'
import { SafeCommandRunner } from './services/commandRunner'
import { GithubService } from './services/githubService'
import { JsonStore } from './services/jsonStore'
import { ProjectCatalog } from './services/projectCatalog'
import { ProjectCreationService } from './services/projectCreationService'
import { SettingsService } from './services/settingsService'
import { TemplateService } from './services/templateService'
import { UpdateService } from './services/updateService'
import type { OperationRecord } from '../shared/contracts'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
const updater = new UpdateService(() => mainWindow)

function createWindow(): void {
  const icon = app.isPackaged ? path.join(process.resourcesPath, 'branding', 'logos', 'kaiwen-logo-transparent.png') : path.join(app.getAppPath(), 'resources', 'branding', 'logos', 'kaiwen-logo-transparent.png')
  mainWindow = new BrowserWindow({
    width: 1040, height: 720, minWidth: 760, minHeight: 560, show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#111210' : '#f5f5f1',
    title: 'Kaiwen Project Starter',
    icon,
    webPreferences: { preload: path.join(currentDir, '../preload/index.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true }
  })
  mainWindow.removeMenu()
  const userData = app.getPath('userData')
  const defaultRoot = path.join(app.getPath('desktop'), 'Kaiwen')
  const settings = new SettingsService(path.join(userData, 'settings.json'), defaultRoot)
  const catalog = new ProjectCatalog(path.join(userData, 'projects.json'))
  const runner = new SafeCommandRunner(); const github = new GithubService(runner); const templates = new TemplateService()
  const operations = new JsonStore<OperationRecord[]>(path.join(userData, 'operations.json'), () => [])
  const creator = new ProjectCreationService(templates, catalog, github, runner, operations)
  registerIpc(mainWindow, { settings, catalog, runner, github, templates, creator, updater })
  if (process.env.ELECTRON_RENDERER_URL) void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void mainWindow.loadFile(path.join(currentDir, '../renderer/index.html'))
  mainWindow.once('ready-to-show', () => { mainWindow?.show() })
  mainWindow.on('close', (event) => { if (!isQuitting && updater.isDownloading) { event.preventDefault(); mainWindow?.hide() } })
  mainWindow.on('closed', () => { mainWindow = null })
  if (!tray) {
    tray = new Tray(icon); tray.setToolTip('Kaiwen Project Starter')
    tray.setContextMenu(Menu.buildFromTemplate([{ label: 'Göster', click: () => { mainWindow?.show(); mainWindow?.focus() } }, { type: 'separator' }, { label: 'Çıkış', click: () => { isQuitting = true; app.quit() } }]))
    tray.on('click', () => { mainWindow?.show(); mainWindow?.focus() })
  }
}

app.whenReady().then(async () => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json')
  const settings = await new SettingsService(settingsPath, path.join(app.getPath('desktop'), 'Kaiwen')).get()
  nativeTheme.themeSource = settings.theme
  createWindow()
  setTimeout(() => { void updater.check().catch(() => undefined) }, 4000)
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})
app.on('before-quit', () => { isQuitting = true })
app.on('window-all-closed', () => { if (process.platform !== 'darwin' && !updater.isDownloading) app.quit() })
