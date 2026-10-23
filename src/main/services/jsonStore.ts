import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

export class JsonStore<T> {
  constructor(private readonly filePath: string, private readonly fallback: () => T) {}

  async read(): Promise<T> {
    try { return JSON.parse(await readFile(this.filePath, 'utf8')) as T }
    catch {
      try { await rename(this.filePath, `${this.filePath}.corrupt-${Date.now()}`) } catch { /* missing file */ }
      const value = this.fallback(); await this.write(value); return value
    }
  }

  async write(value: T): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    const temporary = `${this.filePath}.${process.pid}.${Date.now()}.tmp`
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, this.filePath)
  }
}
