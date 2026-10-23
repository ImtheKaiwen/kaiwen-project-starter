import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, CreateProjectRequest, KaiwenApi, Theme, UpdateState } from '../shared/contracts'
import { IPC } from '../shared/contracts'

const api: KaiwenApi = {
  bootstrap: () => ipcRenderer.invoke(IPC.bootstrap), chooseWorkspace: () => ipcRenderer.invoke(IPC.chooseWorkspace),
  chooseBranding: () => ipcRenderer.invoke(IPC.chooseBranding), chooseEditor: () => ipcRenderer.invoke(IPC.chooseEditor),
  chooseMarkdown: () => ipcRenderer.invoke(IPC.chooseMarkdown), saveSettings: (settings: AppSettings) => ipcRenderer.invoke(IPC.saveSettings, settings),
  listTemplates: (categoryId: string) => ipcRenderer.invoke(IPC.listTemplates, categoryId), readTemplate: (sourcePath: string) => ipcRenderer.invoke(IPC.readTemplate, sourcePath),
  saveTemplate: (sourcePath: string, content: string) => ipcRenderer.invoke(IPC.saveTemplate, sourcePath, content), refreshProjects: () => ipcRenderer.invoke(IPC.refreshProjects),
  addManualProject: () => ipcRenderer.invoke(IPC.addManualProject), removeProject: (id: string) => ipcRenderer.invoke(IPC.removeProject, id),
  openProject: (id: string) => ipcRenderer.invoke(IPC.openProject, id), createProject: (request: CreateProjectRequest) => ipcRenderer.invoke(IPC.createProject, request),
  githubStatus: () => ipcRenderer.invoke(IPC.githubStatus), githubLogin: () => ipcRenderer.invoke(IPC.githubLogin), setTheme: (theme: Theme) => ipcRenderer.invoke(IPC.setTheme, theme),
  getStartupStatus: () => ipcRenderer.invoke(IPC.getStartupStatus), checkForUpdates: () => ipcRenderer.invoke(IPC.checkForUpdates),
  downloadUpdate: () => ipcRenderer.invoke(IPC.downloadUpdate), installUpdate: () => ipcRenderer.invoke(IPC.installUpdate),
  onUpdateState: (callback: (state: UpdateState) => void) => { const listener = (_event: Electron.IpcRendererEvent, state: UpdateState) => callback(state); ipcRenderer.on(IPC.updateState, listener); return () => ipcRenderer.removeListener(IPC.updateState, listener) }
}
contextBridge.exposeInMainWorld('kaiwen', api)
