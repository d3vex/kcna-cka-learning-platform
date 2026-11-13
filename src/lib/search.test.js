import { describe, expect, it } from 'vitest'
import { allLessons } from '../data/lessons'
import { cheatGroups, glossary } from '../data/reference'
import { buildSearchIndex, searchEntries } from './search'

const index = buildSearchIndex(allLessons, cheatGroups, glossary)

describe('search index', () => {
  it('indexes lessons, commands and glossary terms', () => {
    expect(index.some((entry) => entry.type === 'lesson')).toBe(true)
    expect(index.some((entry) => entry.type === 'command')).toBe(true)
    expect(index.some((entry) => entry.type === 'term')).toBe(true)
  })

  it('finds a lesson from a phrase in its body', () => {
    const results = searchEntries(index, 'reconciliation system')
    const lesson = results.find((entry) => entry.id === 'kcna-cluster-model')
    expect(lesson).toBeTruthy()
    expect(lesson.route).toBe('/track/kcna/lesson/kcna-cluster-model')
  })

  it('finds cheatsheet commands and glossary definitions', () => {
    expect(searchEntries(index, 'endpointslice').some((entry) => entry.type === 'command')).toBe(true)
    expect(searchEntries(index, 'quorum').some((entry) => entry.type === 'term')).toBe(true)
  })

  it('returns nothing for an empty query or a miss', () => {
    expect(searchEntries(index, '   ')).toEqual([])
    expect(searchEntries(index, 'zzzz-not-a-term')).toEqual([])
  })
})
