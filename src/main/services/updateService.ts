import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateState } from '../../shared/contracts'
import { IPC } from '../../shared/contracts'

export class UpdateService {
  private state: UpdateState = { status: 'idle' }

  constructor(private readonly getWindow: () => BrowserWindow | null) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false
    autoUpdater.on('checking-for-update', () => this.publish({ status: 'checking' }))
    autoUpdater.on('update-available', (info) => this.publish({ status: 'available', version: info.version }))
    autoUpdater.on('update-not-available', (info) => this.publish({ status: 'not-available', version: info.version }))
    autoUpdater.on('download-progress', (progress) => this.publish({ status: 'downloading', percent: Math.max(0, Math.min(100, progress.percent)), ...(this.state.version ? { version: this.state.version } : {}) }))
    autoUpdater.on('update-downloaded', (info) => this.publish({ status: 'downloaded', version: info.version, percent: 100 }))
    autoUpdater.on('error', (error) => this.publish({ status: 'error', message: error.message.slice(0, 240) }))
  }

  get current(): UpdateState { return this.state }
  get isDownloading(): boolean { return this.state.status === 'downloading' }

  async check(): Promise<UpdateState> {
    if (!app.isPackaged) { this.publish({ status: 'not-available', version: app.getVersion(), message: 'Development build' }); return this.state }
    this.publish({ status: 'checking' })
    await autoUpdater.checkForUpdates()
    return this.state
  }

  async download(): Promise<void> {
    if (this.state.status !== 'available' && this.state.status !== 'error') throw new Error('İndirilebilir bir güncelleme bulunmuyor.')
    this.publish({ status: 'downloading', percent: 0, ...(this.state.version ? { version: this.state.version } : {}) })
    await autoUpdater.downloadUpdate()
  }

  install(): void {
    if (this.state.status !== 'downloaded') throw new Error('Güncelleme henüz kuruluma hazır değil.')
    autoUpdater.quitAndInstall(false, true)
  }

  private publish(state: UpdateState): void {
    this.state = state
    this.getWindow()?.webContents.send(IPC.updateState, state)
  }
}
