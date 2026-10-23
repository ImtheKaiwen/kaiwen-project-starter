import { describe, expect, it } from 'vitest'
import { safeMarkdownName, slugifyProjectName, validateRelativeDirectory } from '../src/shared/pathSafety'

describe('path safety', () => {
  it('Türkçe proje adını aynı güvenli klasör ve repo slugına dönüştürür', () => {
    expect(slugifyProjectName('  Çığ ŞÖLENİ Ürün  ')).toBe('cig-soleni-urun')
  })
  it('Windows ayrılmış adlarını ve traversal yollarını reddeder', () => {
    expect(() => slugifyProjectName('CON')).toThrow()
    expect(() => validateRelativeDirectory('../outside')).toThrow()
    expect(() => validateRelativeDirectory('apps/aux')).toThrow()
    expect(() => safeMarkdownName('../SECRET.md')).toThrow()
  })
  it('geçerli göreli kategori yolunu kabul eder', () => expect(validateRelativeDirectory('apps/desktop')).toBe('apps/desktop'))
})
