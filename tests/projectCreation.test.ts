import { mkdtemp, mkdir, readFile, rm, writeFile, access } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultSettings } from '../src/shared/defaults'
import type { CommandRunner, CommandResult } from '../src/main/services/commandRunner'
import { GithubService } from '../src/main/services/githubService'
import { JsonStore } from '../src/main/services/jsonStore'
import { ProjectCatalog } from '../src/main/services/projectCatalog'
import { ProjectCreationService } from '../src/main/services/projectCreationService'
import { TemplateService } from '../src/main/services/templateService'
import type { CreateProjectRequest, OperationRecord } from '../src/shared/contracts'

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))) })
class FakeRunner implements CommandRunner {
  constructor(private readonly behavior: (command: string, args: string[]) => CommandResult = () => ({ code: 0, stdout: '', stderr: '' })) {}
  async run(command: string, args: string[]): Promise<CommandResult> { return this.behavior(command, args) }
}

async function fixture(runner = new FakeRunner()) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'kaiwen-create-')); roots.push(root)
  const workspace = path.join(root, 'workspace'); const templatesRoot = path.join(workspace, 'templates'); const branding = path.join(workspace, 'branding', 'logos')
  await mkdir(path.join(templatesRoot, 'common'), { recursive: true }); await mkdir(path.join(templatesRoot, 'desktop'), { recursive: true }); await mkdir(branding, { recursive: true })
  await writeFile(path.join(templatesRoot, 'common', 'PERFORMANCE.md'), '# Common\n'); await writeFile(path.join(templatesRoot, 'desktop', 'PERFORMANCE.md'), '# Desktop\n')
  await writeFile(path.join(branding, 'black.png'), Buffer.from([1, 2, 3])); await writeFile(path.join(branding, 'white.webp'), Buffer.from([4, 5, 6]))
  const settings = defaultSettings(workspace); settings.templatesRoot = templatesRoot; settings.brandingRoot = branding
  const catalog = new ProjectCatalog(path.join(root, 'projects.json')); const github = new GithubService(runner)
  const service = new ProjectCreationService(new TemplateService(), catalog, github, runner, new JsonStore<OperationRecord[]>(path.join(root, 'operations.json'), () => []))
  const listed = await new TemplateService().list(settings, 'desktop')
  const request: CreateProjectRequest = { name: 'Çizim Aracı', categoryId: 'desktop', templates: listed, customMarkdown: [{ name: 'OZEL.md', content: '# Özel' }], includeLogos: true, createGithubRepo: false, githubVisibility: 'private', initGit: false, openInEditor: false, copyPrompt: false }
  return { root, workspace, settings, service, request }
}

describe('ProjectCreationService', () => {
  it('common ve kategori belgelerini çakışmadan, özel belgeleri ve logoları içerikleri değişmeden kopyalar', async () => {
    const { service, settings, request } = await fixture(); request.templates[0]!.content = '# Projeye özel\n'
    const result = await service.create(settings, request)
    expect(await readFile(path.join(result.project.path, 'docs/standards/common/PERFORMANCE.md'), 'utf8')).toBe('# Projeye özel\n')
    expect(await readFile(path.join(result.project.path, 'docs/standards/desktop/PERFORMANCE.md'), 'utf8')).toBe('# Desktop\n')
    expect(await readFile(path.join(result.project.path, 'branding/logos/black.png'))).toEqual(Buffer.from([1, 2, 3]))
    expect(result.copiedAssets).toHaveLength(2)
    const manifest = JSON.parse(await readFile(path.join(result.project.path, '.kaiwen/project.json'), 'utf8'))
    expect(manifest.templates).toHaveLength(3); expect(manifest.assets).toHaveLength(2)
    expect(await readFile(path.join(settings.templatesRoot, 'common/PERFORMANCE.md'), 'utf8')).toBe('# Common\n')
  })
  it('aynı hedef klasörü varken hiçbir veriyi değiştirmez', async () => {
    const { service, settings, request } = await fixture(); const first = await service.create(settings, request); const before = await readFile(path.join(first.project.path, 'README.md'), 'utf8')
    await expect(service.create(settings, request)).rejects.toThrow('zaten mevcut'); expect(await readFile(path.join(first.project.path, 'README.md'), 'utf8')).toBe(before)
  })
  it('logo kapalıyken branding klasörü oluşturmaz', async () => {
    const { service, settings, request } = await fixture(); request.includeLogos = false; const result = await service.create(settings, request)
    await expect(access(path.join(result.project.path, 'branding'))).rejects.toThrow()
  })
  it('GitHub repo oluşturma reddedilirse hedef yerel klasörü hiç oluşturmaz', async () => {
    const runner = new FakeRunner((_command, args) => {
      if (args[0] === '--version' || args[0] === 'auth') return { code: 0, stdout: 'ok', stderr: '' }
      if (args[0] === 'api') return { code: 0, stdout: 'kaiwen', stderr: '' }
      if (args[0] === 'config') return { code: 0, stdout: 'configured', stderr: '' }
      if (args[0] === 'repo' && args[1] === 'create') return { code: 1, stdout: '', stderr: 'HTTP 422: name already exists' }
      return { code: 0, stdout: '', stderr: '' }
    })
    const { service, settings, request, workspace } = await fixture(runner); request.createGithubRepo = true
    await expect(service.create(settings, request)).rejects.toThrow('422')
    await expect(access(path.join(workspace, 'apps', 'desktop', 'cizim-araci'))).rejects.toThrow()
  })
  it('push hatasından sonra aynı operasyon ve remote ile sürer; ikinci repo oluşturmaz', async () => {
    let createCalls = 0; let pushCalls = 0
    const runner = new FakeRunner((command, args) => {
      if (command === 'gh' && args[0] === '--version') return { code: 0, stdout: 'gh', stderr: '' }
      if (command === 'gh' && args[0] === 'auth') return { code: 0, stdout: 'ok', stderr: '' }
      if (command === 'gh' && args[0] === 'api') return { code: 0, stdout: 'kaiwen', stderr: '' }
      if (command === 'gh' && args[0] === 'repo' && args[1] === 'create') { createCalls += 1; return { code: 0, stdout: 'created', stderr: '' } }
      if (command === 'gh' && args[0] === 'repo' && args[1] === 'view') return { code: 0, stdout: 'https://github.com/kaiwen/cizim-araci', stderr: '' }
      if (command === 'git' && args[0] === 'config') return { code: 0, stdout: 'configured', stderr: '' }
      if (command === 'git' && args[0] === 'rev-parse' && args.includes('--verify')) return { code: 0, stdout: 'abc123', stderr: '' }
      if (command === 'git' && args[0] === 'rev-parse') return { code: 0, stdout: 'abc123', stderr: '' }
      if (command === 'git' && args[0] === 'remote' && args[1] === 'get-url') return { code: 0, stdout: 'https://github.com/kaiwen/cizim-araci.git', stderr: '' }
      if (command === 'git' && args[0] === 'push') { pushCalls += 1; return pushCalls === 1 ? { code: 1, stdout: '', stderr: 'network error' } : { code: 0, stdout: 'pushed', stderr: '' } }
      return { code: 0, stdout: '', stderr: '' }
    })
    const { service, settings, request } = await fixture(runner); request.createGithubRepo = true
    await expect(service.create(settings, request)).rejects.toThrow('network error')
    const resumed = await service.create(settings, request)
    expect(resumed.pushComplete).toBe(true); expect(resumed.warnings[0]).toContain('kaldığı yerden')
    expect(createCalls).toBe(1); expect(pushCalls).toBe(2)
  })
})
