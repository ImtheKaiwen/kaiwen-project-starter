import { createHash, randomUUID } from 'node:crypto'
import { access, copyFile, lstat, mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import path from 'node:path'
import type { AppSettings, CreateProjectRequest, CreateProjectResult, LogoDescriptor, OperationRecord, ProjectRecord } from '../../shared/contracts'
import { safeMarkdownName, slugifyProjectName, validateRelativeDirectory } from '../../shared/pathSafety'
import type { CommandRunner } from './commandRunner'
import { GithubService } from './githubService'
import { JsonStore } from './jsonStore'
import { ProjectCatalog } from './projectCatalog'
import { TemplateService } from './templateService'
import { assertInside } from './pathSafety'

const MAX_LOGO_BYTES = 10 * 1024 * 1024
const MAX_CUSTOM_BYTES = 1024 * 1024
const SECRET_PATTERN = /(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|secret|password|token)\s*[:=]\s*[^\s<]{8,})/i

interface ProjectManifest {
  version: 1; id: string; name: string; slug: string; categoryId: string; createdAt: string
  templates: { source: string; target: string; sha256: string }[]; assets: string[]
}

export class ProjectCreationService {
  constructor(
    private readonly templates: TemplateService,
    private readonly catalog: ProjectCatalog,
    private readonly github: GithubService,
    private readonly runner: CommandRunner,
    private readonly operations: JsonStore<OperationRecord[]>
  ) {}

  async listLogos(settings: AppSettings): Promise<LogoDescriptor[]> {
    let entries: Dirent[] = []
    try { entries = await readdir(settings.brandingRoot, { withFileTypes: true }) } catch { return [] }
    const result: LogoDescriptor[] = []
    for (const entry of entries) {
      if (!entry.isFile() || entry.isSymbolicLink() || !/\.(png|svg|webp)$/i.test(entry.name)) continue
      const sourcePath = path.join(settings.brandingRoot, entry.name); const info = await stat(sourcePath)
      if (info.size <= MAX_LOGO_BYTES) result.push({ name: entry.name, sourcePath, size: info.size })
    }
    return result
  }

  async create(settings: AppSettings, request: CreateProjectRequest): Promise<CreateProjectResult> {
    const operationId = randomUUID(); const slug = slugifyProjectName(request.name)
    const category = settings.categories.find((item) => item.id === request.categoryId && item.enabled)
    if (!category) throw new Error('Etkin proje kategorisi bulunamadı.')
    const categoryPath = validateRelativeDirectory(category.relativePath)
    const targetPath = path.join(settings.workspaceRoot, categoryPath, slug); assertInside(settings.workspaceRoot, targetPath)
    const savedOperations = await this.operations.read()
    const resumable = request.createGithubRepo ? [...savedOperations].reverse().find((item) => item.slug === slug && path.resolve(item.targetPath).toLowerCase() === path.resolve(targetPath).toLowerCase() && item.remoteUrl && ['LOCAL_FAILED_AFTER_REMOTE', 'PUSH_FAILED'].includes(item.state)) : undefined
    if (resumable?.state === 'PUSH_FAILED' && await this.exists(targetPath)) return this.resumePush(settings, request, category.id, resumable)
    await this.assertTargetMissing(targetPath)
    const operation: OperationRecord = resumable ?? { id: operationId, state: 'VALIDATING', slug, targetPath, updatedAt: new Date().toISOString() }
    delete operation.error
    if (resumable) await this.update(operation, 'VALIDATING'); else await this.record(operation)
    await this.validateInputs(settings, request)
    let remoteUrl: string | undefined = operation.remoteUrl
    if (request.createGithubRepo) {
      if (remoteUrl) this.assertRemoteMatches(remoteUrl, slug)
      else {
        await this.update(operation, 'CREATING_REMOTE')
        try { remoteUrl = await this.github.createRemote(settings.githubOwner, slug, request.githubVisibility); operation.remoteUrl = remoteUrl }
        catch (error) { await this.fail(operation, 'REMOTE_FAILED', error); throw error }
      }
    }
    await this.update(operation, 'CREATING_LOCAL')
    const staging = `${targetPath}.kaiwen-staging-${operationId}`
    const warnings: string[] = []; const copiedAssets: string[] = []
    try {
      await mkdir(path.dirname(targetPath), { recursive: true }); await mkdir(staging, { recursive: false })
      const manifest = await this.writeProject(staging, settings, request, slug, copiedAssets, warnings)
      await writeFile(path.join(staging, '.kaiwen', 'project.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
      await rename(staging, targetPath)
    } catch (error) {
      await rm(staging, { recursive: true, force: true })
      await this.fail(operation, remoteUrl ? 'LOCAL_FAILED_AFTER_REMOTE' : 'LOCAL_FAILED_AFTER_REMOTE', error); throw error
    }
    let commitSha: string | undefined; let pushComplete = false
    if (request.createGithubRepo || request.initGit) {
      try {
        await this.update(operation, 'INITIAL_COMMIT')
        await this.git(targetPath, ['init', '-b', 'main']); await this.git(targetPath, ['add', '.']); await this.git(targetPath, ['commit', '-m', 'chore: initialize project'])
        commitSha = (await this.git(targetPath, ['rev-parse', 'HEAD'])).stdout
        if (remoteUrl) {
          await this.update(operation, 'PUSHING'); await this.git(targetPath, ['remote', 'add', 'origin', `${remoteUrl}.git`]); await this.git(targetPath, ['push', '-u', 'origin', 'main'], 120_000); pushComplete = true
        }
      } catch (error) { await this.fail(operation, remoteUrl ? 'PUSH_FAILED' : 'LOCAL_FAILED_AFTER_REMOTE', error); throw error }
    }
    const project: ProjectRecord = { id: randomUUID(), name: request.name.trim(), path: targetPath, categoryId: category.id, lastOpenedAt: null, missing: false, manual: false }
    await this.catalog.add(project); await this.update(operation, 'COMPLETED')
    const prompt = this.buildPrompt(request.templates.filter((item) => item.selected).map((item) => item.targetPath), request.customMarkdown.map((item) => `docs/custom/${safeMarkdownName(item.name)}`))
    return { operationId, project, warnings, copiedAssets, ...(remoteUrl ? { githubUrl: remoteUrl } : {}), ...(commitSha ? { commitSha } : {}), pushComplete, prompt }
  }

  private async resumePush(settings: AppSettings, request: CreateProjectRequest, categoryId: string, operation: OperationRecord): Promise<CreateProjectResult> {
    await this.validateInputs(settings, request)
    const remoteUrl = operation.remoteUrl
    if (!remoteUrl) throw new Error('Kayıtlı uzak repo URL’si bulunamadı; işlem güvenle sürdürülemiyor.')
    this.assertRemoteMatches(remoteUrl, operation.slug)
    try {
      await this.update(operation, 'INITIAL_COMMIT')
      if (!await this.exists(path.join(operation.targetPath, '.git'))) await this.git(operation.targetPath, ['init', '-b', 'main'])
      await this.git(operation.targetPath, ['add', '.'])
      const head = await this.runner.run('git', ['rev-parse', '--verify', 'HEAD'], { cwd: operation.targetPath, timeoutMs: 10_000 })
      if (head.code !== 0) await this.git(operation.targetPath, ['commit', '-m', 'chore: initialize project'])
      const commitSha = (await this.git(operation.targetPath, ['rev-parse', 'HEAD'])).stdout
      const remote = await this.runner.run('git', ['remote', 'get-url', 'origin'], { cwd: operation.targetPath, timeoutMs: 10_000 })
      const expected = `${remoteUrl}.git`
      if (remote.code !== 0) await this.git(operation.targetPath, ['remote', 'add', 'origin', expected])
      else if (remote.stdout.replace(/\.git$/, '') !== remoteUrl) throw new Error('Kayıtlı origin bu oluşturma işlemindeki GitHub reposuyla eşleşmiyor; devam edilmedi.')
      await this.update(operation, 'PUSHING'); await this.git(operation.targetPath, ['push', '-u', 'origin', 'main'], 120_000)
      const project: ProjectRecord = { id: randomUUID(), name: request.name.trim(), path: operation.targetPath, categoryId, lastOpenedAt: null, missing: false, manual: false }
      await this.catalog.add(project); await this.update(operation, 'COMPLETED')
      const manifest = JSON.parse(await readFile(path.join(operation.targetPath, '.kaiwen', 'project.json'), 'utf8')) as ProjectManifest
      const prompt = this.buildPrompt(request.templates.filter((item) => item.selected).map((item) => item.targetPath), request.customMarkdown.map((item) => `docs/custom/${safeMarkdownName(item.name)}`))
      return { operationId: operation.id, project, warnings: ['Önceki işlem güvenli biçimde kaldığı yerden sürdürüldü.'], copiedAssets: manifest.assets, githubUrl: remoteUrl, commitSha, pushComplete: true, prompt }
    } catch (error) { await this.fail(operation, 'PUSH_FAILED', error); throw error }
  }

  private async validateInputs(settings: AppSettings, request: CreateProjectRequest): Promise<void> {
    if (!request.name.trim() || request.name.length > 120) throw new Error('Proje adı 1–120 karakter olmalıdır.')
    for (const template of request.templates.filter((item) => item.selected)) { assertInside(settings.templatesRoot, template.sourcePath); await this.templates.read(settings, template.sourcePath) }
    const targets = new Set<string>()
    for (const target of [...request.templates.filter((item) => item.selected).map((item) => item.targetPath), ...request.customMarkdown.map((item) => `docs/custom/${safeMarkdownName(item.name)}`)]) {
      const key = target.toLowerCase(); if (targets.has(key)) throw new Error(`Belge hedefi çakışıyor: ${target}`); targets.add(key)
    }
    for (const custom of request.customMarkdown) {
      if (Buffer.byteLength(custom.content) > MAX_CUSTOM_BYTES) throw new Error(`${custom.name} 1 MB sınırını aşıyor.`)
      if (request.createGithubRepo && request.githubVisibility === 'public' && SECRET_PATTERN.test(custom.content)) throw new Error(`${custom.name} olası gizli bilgi içeriyor; public repo oluşturulmadı.`)
    }
    for (const template of request.templates) {
      if (template.content !== undefined && Buffer.byteLength(template.content) > MAX_CUSTOM_BYTES) throw new Error(`${template.name} proje özelleştirmesi 1 MB sınırını aşıyor.`)
      if (template.content !== undefined && request.createGithubRepo && request.githubVisibility === 'public' && SECRET_PATTERN.test(template.content)) throw new Error(`${template.name} olası gizli bilgi içeriyor; public repo oluşturulmadı.`)
    }
  }

  private async writeProject(staging: string, settings: AppSettings, request: CreateProjectRequest, slug: string, copiedAssets: string[], warnings: string[]): Promise<ProjectManifest> {
    const templateRecords: ProjectManifest['templates'] = []
    await mkdir(path.join(staging, '.kaiwen'), { recursive: true }); await mkdir(path.join(staging, 'docs', 'decisions'), { recursive: true })
    for (const template of request.templates.filter((item) => item.selected)) {
      const content = template.content ?? await this.templates.read(settings, template.sourcePath); const destination = path.join(staging, template.targetPath); assertInside(staging, destination)
      await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, content, { encoding: 'utf8', flag: 'wx' })
      templateRecords.push({ source: `${template.profile}/${template.name}`, target: template.targetPath.replace(/\\/g, '/'), sha256: createHash('sha256').update(content).digest('hex') })
    }
    for (const custom of request.customMarkdown) {
      const destination = path.join(staging, 'docs', 'custom', safeMarkdownName(custom.name)); assertInside(staging, destination)
      await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, custom.content, { encoding: 'utf8', flag: 'wx' })
      templateRecords.push({ source: custom.sourcePath ? `import:${path.basename(custom.sourcePath)}` : 'inline', target: path.relative(staging, destination).replace(/\\/g, '/'), sha256: createHash('sha256').update(custom.content).digest('hex') })
    }
    if (request.includeLogos) {
      const logos = await this.listLogos(settings)
      if (!logos.length) warnings.push('Desteklenen marka logosu bulunamadı; proje logosuz oluşturuldu.')
      for (const logo of logos) {
        const canonicalRoot = await realpath(settings.brandingRoot); const canonical = await realpath(logo.sourcePath); assertInside(canonicalRoot, canonical)
        if ((await lstat(canonical)).isSymbolicLink()) throw new Error('Sembolik bağlantı logo olarak kopyalanamaz.')
        const destination = path.join(staging, 'branding', 'logos', logo.name); await mkdir(path.dirname(destination), { recursive: true }); await copyFile(canonical, destination); copiedAssets.push(`branding/logos/${logo.name}`)
      }
    }
    const docs = templateRecords.map((item) => item.target)
    const prompt = this.buildPrompt(docs, [])
    await writeFile(path.join(staging, 'README.md'), this.readme(request.name.trim(), copiedAssets), { encoding: 'utf8', flag: 'wx' })
    await writeFile(path.join(staging, 'AGENTS.md'), this.agents(docs), { encoding: 'utf8', flag: 'wx' })
    await writeFile(path.join(staging, 'docs', 'decisions', 'README.md'), '# Karar Kayıtları\n\nMimari ve ürün kararlarını bu dizinde kısa ADR belgeleri olarak kaydedin.\n', { encoding: 'utf8', flag: 'wx' })
    await writeFile(path.join(staging, '.kaiwen', 'START_PROMPT.md'), `${prompt}\n`, { encoding: 'utf8', flag: 'wx' })
    await writeFile(path.join(staging, '.gitignore'), 'node_modules/\ndist/\nbuild/\n.env\n.env.*\n!.env.example\n*.pem\n*.key\n', { encoding: 'utf8', flag: 'wx' })
    return { version: 1, id: randomUUID(), name: request.name.trim(), slug, categoryId: request.categoryId, createdAt: new Date().toISOString(), templates: templateRecords, assets: copiedAssets }
  }

  private buildPrompt(templatePaths: string[], customPaths: string[]): string {
    const paths = [...templatePaths, ...customPaths]
    return `Bu projenin AGENTS.md dosyasını oku. Özellikle aşağıdaki mevcut belgeleri aç: ${paths.length ? paths.join(', ') : 'docs/decisions/README.md'}. Projenin amacını, işlevsel gereksinimlerini ve kısıtlarını belirle. Birbiriyle çelişen kurallar veya doldurulmamış TODO alanları varsa bildir. Kısa uygulanabilir bir geliştirme sırası oluştur, ardından ilk çalışan ve test edilebilir aşamayı geliştir. Test sonuçlarını raporla. Mevcut dosyaları gereksiz yere silme; bu proje için özel yetki verilmedikçe git push veya release yapma.`
  }

  private agents(paths: string[]): string { return `# Proje Talimatları\n\nÖnce README.md ve gerçekten mevcut aşağıdaki belgeleri oku:\n${paths.map((item) => `- \`${item}\``).join('\n') || '- `docs/decisions/README.md`'}\n\nTODO işaretli şablonlar taslaktır; tamamlanmış politika gibi yorumlama. Mevcut dosyaları incelemeden silme veya yeniden yazma. Güvenlik, erişilebilirlik ve testleri koru. Açıkça istenmedikçe push veya release yapma.\n` }
  private readme(name: string, assets: string[]): string { return `# ${name}\n\nKaiwen Project Starter ile oluşturuldu. Gereksinimleri seçili \`docs/standards/\` ve \`docs/custom/\` belgelerinde tanımlayın.\n${assets.length ? '\nMarka varlıkları `branding/logos/` altına kaynakları değiştirilmeden kopyalandı.\n' : ''}` }
  private async assertTargetMissing(target: string): Promise<void> { try { await access(target); throw new Error('Aynı adlı proje klasörü zaten mevcut; hiçbir dosya değiştirilmedi.') } catch (error) { if (error instanceof Error && error.message.startsWith('Aynı')) throw error } }
  private async exists(target: string): Promise<boolean> { try { await access(target); return true } catch { return false } }
  private assertRemoteMatches(remoteUrl: string, slug: string): void { if (!new RegExp(`^https://github\\.com/[A-Za-z0-9_.-]+/${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i').test(remoteUrl)) throw new Error('Kayıtlı uzak repo bu proje slug’ıyla eşleşmiyor; devam edilmedi.') }
  private async git(cwd: string, args: string[], timeoutMs = 60_000) { const result = await this.runner.run('git', args, { cwd, timeoutMs }); if (result.code !== 0) throw new Error((result.stderr || result.stdout || 'Git işlemi başarısız.').slice(0, 800)); return result }
  private async record(record: OperationRecord): Promise<void> { const records = await this.operations.read(); records.push(record); await this.operations.write(records.slice(-100)) }
  private async update(record: OperationRecord, state: OperationRecord['state']): Promise<void> { record.state = state; record.updatedAt = new Date().toISOString(); const records = await this.operations.read(); const index = records.findIndex((item) => item.id === record.id); if (index >= 0) records[index] = { ...record }; else records.push({ ...record }); await this.operations.write(records) }
  private async fail(record: OperationRecord, state: OperationRecord['state'], error: unknown): Promise<void> { record.error = error instanceof Error ? error.message.slice(0, 800) : 'Bilinmeyen hata'; await this.update(record, state) }
}
