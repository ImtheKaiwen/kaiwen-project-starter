import type { AppSettings, Category } from './contracts'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'mobile', name: 'Mobile', relativePath: 'apps/mobile', templateProfile: 'mobile', enabled: true },
  { id: 'web', name: 'Web', relativePath: 'apps/web', templateProfile: 'web', enabled: true },
  { id: 'desktop', name: 'Desktop', relativePath: 'apps/desktop', templateProfile: 'desktop', enabled: true },
  { id: 'cross-platform', name: 'Cross-platform', relativePath: 'apps/cross-platform', templateProfile: 'cross-platform', enabled: true },
  { id: 'library', name: 'Library / SDK', relativePath: 'packages', templateProfile: 'library', enabled: true },
  { id: 'service', name: 'Service / API', relativePath: 'services', templateProfile: 'service', enabled: true },
  { id: 'ai-speech', name: 'AI / Speech', relativePath: 'kaiwen-ai/speech', templateProfile: 'ai-speech', enabled: true },
  { id: 'ai-language', name: 'AI / Language', relativePath: 'kaiwen-ai/language', templateProfile: 'ai-language', enabled: true },
  { id: 'ai-vision', name: 'AI / Vision', relativePath: 'kaiwen-ai/vision', templateProfile: 'ai-vision', enabled: true },
  { id: 'client', name: 'Client Project', relativePath: 'clients', templateProfile: 'common', enabled: true }
]

export function defaultSettings(workspaceRoot = ''): AppSettings {
  return {
    version: 1, workspaceRoot,
    brandingRoot: workspaceRoot ? `${workspaceRoot}/branding/logos` : '',
    templatesRoot: workspaceRoot ? `${workspaceRoot}/templates` : '',
    theme: 'system', reducedMotion: false, startAtLogin: false, editorPath: 'code', editorWindowMode: 'new', githubOwner: '',
    defaults: { openInEditor: true, copyPrompt: true, createGithubRepo: false, githubVisibility: 'private', initGit: false, includeLogos: false, quickCreate: false },
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category }))
  }
}
