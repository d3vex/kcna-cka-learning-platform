import { getTrack, tracks } from '../data/tracks'

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildSearchIndex(lessons, cheatGroups, glossary) {
  const entries = []
  for (const lesson of lessons) {
    const track = getTrack(lesson.trackId)
    const domain = track?.domains.find((item) => item.id === lesson.domain)
    entries.push({
      type: 'lesson',
      id: lesson.id,
      title: lesson.title,
      subtitle: `${track?.code ?? ''} · ${domain?.title ?? ''}`,
      text: `${lesson.summary} ${stripMarkdown(lesson.body)}`,
      route: `/track/${lesson.trackId}/lesson/${lesson.id}`,
    })
  }
  for (const group of cheatGroups) {
    for (const item of group.commands) {
      entries.push({
        type: 'command',
        id: `${group.id}-${item.cmd}`,
        title: item.cmd,
        subtitle: group.title,
        text: item.note,
        route: { path: '/reference', query: { tab: 'cheatsheet', q: item.cmd } },
      })
    }
  }
  for (const item of glossary) {
    entries.push({
      type: 'term',
      id: item.term,
      title: item.term,
      subtitle: 'Glossary',
      text: item.definition,
      route: { path: '/reference', query: { tab: 'glossary', q: item.term } },
    })
  }
  return entries
}

export function searchEntries(entries, rawQuery, limit = 12) {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return []
  const tokens = query.split(/\s+/).filter(Boolean)
  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase()
      const subtitle = entry.subtitle.toLowerCase()
      const text = entry.text.toLowerCase()
      let score = 0
      for (const token of tokens) {
        if (title.startsWith(token)) score += 12
        else if (title.includes(token)) score += 8
        if (subtitle.includes(token)) score += 4
        if (text.includes(token)) score += 2
      }
      if (title.includes(query)) score += 10
      return { ...entry, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export const trackOptions = tracks.map((track) => ({ id: track.id, code: track.code, title: track.title }))
