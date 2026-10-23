import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { JsonStore } from '../src/main/services/jsonStore'

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))) })

describe('JsonStore', () => {
  it('atomik kaydeder ve bozuk JSON için varsayılana döner', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'kaiwen-store-')); roots.push(root); const file = path.join(root, 'settings.json')
    const store = new JsonStore(file, () => ({ version: 1, value: 'fallback' })); await store.write({ version: 1, value: 'saved' })
    expect(JSON.parse(await readFile(file, 'utf8')).value).toBe('saved')
    await writeFile(file, '{broken', 'utf8'); expect((await store.read()).value).toBe('fallback')
  })
})
