import type { GithubStatus, GitHubVisibility } from '../../shared/contracts'
import type { CommandRunner } from './commandRunner'

export class GithubService {
  constructor(private readonly runner: CommandRunner) {}

  async status(): Promise<GithubStatus> {
    try {
      const version = await this.runner.run('gh', ['--version'], { timeoutMs: 10_000 })
      if (version.code !== 0) return { installed: false, authenticated: false, owner: '', message: 'GitHub CLI bulunamadı.' }
      const auth = await this.runner.run('gh', ['auth', 'status'], { timeoutMs: 15_000 })
      if (auth.code !== 0) return { installed: true, authenticated: false, owner: '', message: 'GitHub CLI oturumu açık değil.' }
      const user = await this.runner.run('gh', ['api', 'user', '--jq', '.login'], { timeoutMs: 15_000 })
      return { installed: true, authenticated: user.code === 0, owner: user.stdout.trim(), message: user.code === 0 ? 'GitHub bağlantısı hazır.' : 'GitHub hesabı okunamadı.' }
    } catch { return { installed: false, authenticated: false, owner: '', message: 'GitHub CLI bulunamadı.' } }
  }

  async assertGitIdentity(): Promise<void> {
    for (const key of ['user.name', 'user.email']) {
      const result = await this.runner.run('git', ['config', '--get', key], { timeoutMs: 10_000 })
      if (result.code !== 0 || !result.stdout.trim()) throw new Error(`Git ${key} ayarı eksik. Önce git config --global ${key} değerini ayarlayın.`)
    }
  }

  async createRemote(owner: string, slug: string, visibility: GitHubVisibility): Promise<string> {
    const status = await this.status()
    if (!status.installed || !status.authenticated) throw new Error(status.message)
    const actualOwner = owner.trim() || status.owner
    if (!actualOwner || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(actualOwner)) throw new Error('Geçerli GitHub sahibi belirlenemedi.')
    await this.assertGitIdentity()
    const fullName = `${actualOwner}/${slug}`
    const created = await this.runner.run('gh', ['repo', 'create', fullName, visibility === 'public' ? '--public' : '--private'], { timeoutMs: 60_000 })
    if (created.code !== 0) throw new Error(this.safeError(created.stderr || created.stdout, 'GitHub reposu oluşturulamadı. Aynı ad mevcut veya yetki yetersiz olabilir.'))
    const view = await this.runner.run('gh', ['repo', 'view', fullName, '--json', 'url,nameWithOwner', '--jq', '.url'], { timeoutMs: 20_000 })
    if (view.code !== 0 || !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(view.stdout.trim())) throw new Error('Repo oluşturuldu ancak güvenilir uzak URL doğrulanamadı.')
    return view.stdout.trim().replace(/\/$/, '')
  }

  private safeError(value: string, fallback: string): string {
    const cleaned = value.replace(/(token|authorization|password)\s*[:=]\s*\S+/gi, '$1=[gizlendi]').slice(0, 600).trim()
    return cleaned || fallback
  }
}
