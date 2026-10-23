import type { ProjectRecord } from './contracts'

function fold(value: string): string {
  return value.toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i')
}

export function searchProjects(projects: ProjectRecord[], query: string): ProjectRecord[] {
  const needle = fold(query.trim())
  return projects
    .map((project) => {
      const name = fold(project.name); const fullPath = fold(project.path)
      const score = !needle ? 3 : name === needle ? 0 : name.startsWith(needle) ? 1 : name.includes(needle) || fullPath.includes(needle) ? 2 : 99
      return { project, score }
    })
    .filter(({ score }) => score < 99)
    .sort((a, b) => a.score - b.score || Date.parse(b.project.lastOpenedAt ?? '1970-01-01') - Date.parse(a.project.lastOpenedAt ?? '1970-01-01') || a.project.name.localeCompare(b.project.name, 'tr'))
    .map(({ project }) => project)
}
