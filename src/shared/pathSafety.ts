const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i
// Windows forbids ASCII control characters in path components.
// eslint-disable-next-line no-control-regex
const INVALID_WINDOWS = new RegExp('[<>:"/\\\\|?*\\x00-\\x1F]')

export function slugifyProjectName(value: string): string {
  const replacements: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' }
  const transliterated = [...value.trim()].map((char) => replacements[char] ?? char).join('')
  const slug = transliterated.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
  if (!slug || WINDOWS_RESERVED.test(slug) || slug.endsWith('.') || slug.endsWith(' ')) throw new Error('Proje adı güvenli bir klasör adına dönüştürülemedi.')
  return slug
}

export function validateRelativeDirectory(value: string): string {
  const normalized = value.trim().replace(/\\/g, '/')
  if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || normalized.split('/').some((part) => !part || part === '..' || part === '.' || WINDOWS_RESERVED.test(part) || INVALID_WINDOWS.test(part) || /[. ]$/.test(part))) {
    throw new Error('Kategori yolu çalışma alanına göre güvenli bir göreli dizin olmalıdır.')
  }
  return normalized
}

export function safeMarkdownName(name: string): string {
  const base = name.trim()
  if (!base || base.includes('/') || base.includes('\\') || !base.toLowerCase().endsWith('.md') || INVALID_WINDOWS.test(base) || WINDOWS_RESERVED.test(base) || /[. ]$/.test(base)) throw new Error(`Geçersiz Markdown dosya adı: ${name}`)
  return base
}
