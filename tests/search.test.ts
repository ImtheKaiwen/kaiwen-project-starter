import { describe, expect, it } from 'vitest'
import { searchProjects } from '../src/shared/search'
import type { ProjectRecord } from '../src/shared/contracts'

const project = (id: string, name: string, path: string, lastOpenedAt: string | null): ProjectRecord => ({ id, name, path, categoryId: 'desktop', lastOpenedAt, missing: false, manual: false })
const projects = [project('1', 'Çizim Aracı', 'C:/Kaiwen/apps/desktop/cizim', '2026-01-01T00:00:00Z'), project('2', 'Çizim', 'C:/Kaiwen/apps/web/cizim', '2026-02-01T00:00:00Z'), project('3', 'Notlar', 'C:/Kaiwen/özel/çizim-notları', null)]

describe('project search', () => {
  it('Türkçe karakterleri katlayıp exact/prefix/partial sıralar', () => expect(searchProjects(projects, 'cizim').map((item) => item.id)).toEqual(['2', '1', '3']))
  it('boş sorguda son açılanları önce getirir', () => expect(searchProjects(projects, '').map((item) => item.id)).toEqual(['2', '1', '3']))
  it('eşleşme yokken boş döner; Enter için yanlış kayıt üretmez', () => expect(searchProjects(projects, 'yok')).toEqual([]))
})
