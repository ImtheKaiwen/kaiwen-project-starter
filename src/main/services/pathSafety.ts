import path from 'node:path'

export function assertInside(root: string, candidate: string): void {
  const resolvedRoot = path.resolve(root)
  const resolvedCandidate = path.resolve(candidate)
  const relative = path.relative(resolvedRoot, resolvedCandidate)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Hedef yol çalışma alanı kökü içinde olmalıdır.')
}
