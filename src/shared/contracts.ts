export type Theme = 'system' | 'light' | 'dark'
export type GitHubVisibility = 'private' | 'public'
export type EditorWindowMode = 'new' | 'reuse'

export interface Category {
  id: string
  name: string
  relativePath: string
  templateProfile: string
  enabled: boolean
}

export interface QuickCreatePreset {
  id: string
  name: string
  description: string
  categoryId: string
  createGithubRepo: boolean
  githubVisibility: GitHubVisibility
  initGit: boolean
  includeLogos: boolean
  openInEditor: boolean
  copyPrompt: boolean
}

export interface AppSettings {
  version: 1
  workspaceRoot: string
  brandingRoot: string
  templatesRoot: string
  theme: Theme
  reducedMotion: boolean
  startAtLogin: boolean
  editorPath: string
  editorWindowMode: EditorWindowMode
  githubOwner: string
  quickCreatePresets: QuickCreatePreset[]
  defaults: {
    openInEditor: boolean
    copyPrompt: boolean
    createGithubRepo: boolean
    githubVisibility: GitHubVisibility
    initGit: boolean
    includeLogos: boolean
  }
  categories: Category[]
}

export interface ProjectRecord {
  id: string
  name: string
  path: string
  categoryId: string
  lastOpenedAt: string | null
  missing: boolean
  manual: boolean
}

export interface TemplateDescriptor {
  id: string
  name: string
  profile: string
  sourcePath: string
  targetPath: string
  selected: boolean
  content?: string
}

export interface LogoDescriptor {
  name: string
  sourcePath: string
  size: number
}

export interface CustomMarkdown {
  name: string
  content: string
  sourcePath?: string
}

export interface CreateProjectRequest {
  name: string
  categoryId: string
  templates: TemplateDescriptor[]
  customMarkdown: CustomMarkdown[]
  includeLogos: boolean
  createGithubRepo: boolean
  githubVisibility: GitHubVisibility
  initGit: boolean
  openInEditor: boolean
  copyPrompt: boolean
}

export interface CreateProjectResult {
  operationId: string
  project: ProjectRecord
  warnings: string[]
  copiedAssets: string[]
  githubUrl?: string
  commitSha?: string
  pushComplete: boolean
  prompt: string
}

export interface GithubStatus {
  installed: boolean
  authenticated: boolean
  owner: string
  message: string
}

export interface OperationRecord {
  id: string
  state: 'VALIDATING' | 'CREATING_REMOTE' | 'CREATING_LOCAL' | 'INITIAL_COMMIT' | 'PUSHING' | 'COMPLETED' | 'REMOTE_FAILED' | 'LOCAL_FAILED_AFTER_REMOTE' | 'PUSH_FAILED'
  slug: string
  targetPath: string
  remoteUrl?: string
  error?: string
  updatedAt: string
}

export interface ApiResult<T> { ok: true; value: T }
export interface ApiError { ok: false; error: string; code?: string }
export type Result<T> = ApiResult<T> | ApiError

export interface KaiwenApi {
  bootstrap(): Promise<Result<{ settings: AppSettings; projects: ProjectRecord[]; logos: LogoDescriptor[] }>>
  chooseWorkspace(): Promise<Result<string | null>>
  chooseBranding(): Promise<Result<string | null>>
  chooseEditor(): Promise<Result<string | null>>
  chooseMarkdown(): Promise<Result<CustomMarkdown[]>>
  saveSettings(settings: AppSettings): Promise<Result<AppSettings>>
  listTemplates(categoryId: string): Promise<Result<TemplateDescriptor[]>>
  readTemplate(sourcePath: string): Promise<Result<string>>
  saveTemplate(sourcePath: string, content: string): Promise<Result<void>>
  refreshProjects(): Promise<Result<ProjectRecord[]>>
  addManualProject(): Promise<Result<ProjectRecord | null>>
  removeProject(id: string): Promise<Result<ProjectRecord[]>>
  openProject(id: string): Promise<Result<void>>
  createProject(request: CreateProjectRequest): Promise<Result<CreateProjectResult>>
  githubStatus(): Promise<Result<GithubStatus>>
  githubLogin(): Promise<Result<void>>
  setTheme(theme: Theme): Promise<Result<void>>
  getStartupStatus(): Promise<Result<boolean>>
}

export const IPC = {
  bootstrap: 'app:bootstrap', chooseWorkspace: 'dialog:workspace', chooseBranding: 'dialog:branding',
  chooseEditor: 'dialog:editor', chooseMarkdown: 'dialog:markdown', saveSettings: 'settings:save',
  listTemplates: 'templates:list', readTemplate: 'templates:read', saveTemplate: 'templates:save',
  refreshProjects: 'projects:refresh', addManualProject: 'projects:add', removeProject: 'projects:remove',
  openProject: 'projects:open', createProject: 'projects:create', githubStatus: 'github:status',
  githubLogin: 'github:login', setTheme: 'theme:set', getStartupStatus: 'startup:get'
} as const
