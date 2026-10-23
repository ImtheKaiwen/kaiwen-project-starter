import { access, lstat, readdir, realpath } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { AppSettings, ProjectRecord } from '../../shared/contracts'
import { JsonStore } from './jsonStore'

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.venv', 'venv', '.next', 'coverage', 'checkpoints', 'datasets', 'assets'])

export class ProjectCatalog {
  private readonly store: JsonStore<ProjectRecord[]>
  constructor(filePath: string) { this.store = new JsonStore(filePath, () => []) }
  read(): Promise<ProjectRecord[]> { return this.store.read() }

  async save(records: ProjectRecord[]): Promise<void> { await this.store.write(records) }

  async add(record: ProjectRecord): Promise<ProjectRecord[]> {
    const records = await this.read(); const existing = records.findIndex((item) => path.resolve(item.path).toLowerCase() === path.resolve(record.path).toLowerCase())
    if (existing >= 0) records[existing] = { ...records[existing]!, ...record }
    else records.push(record)
    await this.save(records); return records
  }

  async remove(id: string): Promise<ProjectRecord[]> { const records = (await this.read()).filter((item) => item.id !== id); await this.save(records); return records }

  async markOpened(id: string): Promise<ProjectRecord | undefined> {
    const records = await this.read(); const record = records.find((item) => item.id === id)
    if (record) { record.lastOpenedAt = new Date().toISOString(); record.missing = false; await this.save(records) }
    return record
  }

  async refresh(settings: AppSettings, signal?: AbortSignal): Promise<ProjectRecord[]> {
    const previous = await this.read(); const byPath = new Map(previous.map((item) => [path.resolve(item.path).toLowerCase(), item]))
    let visited = 0
    for (const category of settings.categories.filter((item) => item.enabled)) {
      if (signal?.aborted) break
      const parent = path.join(settings.workspaceRoot, category.relativePath)
      let entries: Dirent[] = []
      try { entries = await readdir(parent, { withFileTypes: true }) } catch { continue }
      for (const entry of entries) {
        if (signal?.aborted || ++visited > 1000 || !entry.isDirectory() || entry.isSymbolicLink() || SKIP.has(entry.name.toLowerCase())) continue
        const candidate = path.join(parent, entry.name)
        try {
          const info = await lstat(candidate); if (info.isSymbolicLink()) continue
          const canonical = await realpath(candidate); const key = path.resolve(canonical).toLowerCase()
          const existing = byPath.get(key)
          byPath.set(key, { id: existing?.id ?? randomUUID(), name: existing?.name ?? entry.name, path: canonical, categoryId: category.id, lastOpenedAt: existing?.lastOpenedAt ?? null, missing: false, manual: existing?.manual ?? false })
        } catch { /* inaccessible directory */ }
      }
    }
    const output: ProjectRecord[] = []
    for (const record of byPath.values()) { try { await access(record.path); output.push({ ...record, missing: false }) } catch { output.push({ ...record, missing: true }) } }
    await this.save(output); return output
  }
}
