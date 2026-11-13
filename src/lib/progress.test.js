import { describe, expect, it } from 'vitest'
import {
  createProgressStore,
  emptyProgress,
  LEGACY_PROGRESS_KEY,
  PROGRESS_KEY,
} from './progress'

function createMemoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
    _map: map,
  }
}

describe('progress store', () => {
  it('starts empty and marks lessons complete', () => {
    const storage = createMemoryStorage()
    const store = createProgressStore(storage)
    expect(store.totalCompleted.value).toBe(0)
    store.markLessonComplete('kcna-cluster-model')
    expect(store.isLessonComplete('kcna-cluster-model')).toBe(true)
    expect(store.trackProgress('kcna')).toEqual({ total: 12, completed: 1, percent: 8 })
  })

  it('persists and rehydrates state', () => {
    const storage = createMemoryStorage()
    const first = createProgressStore(storage)
    first.markLessonComplete('cka-rbac')
    first.toggleBookmark('cka-rbac')
    first.recordQuizAnswer('kcna-q001', 1, true)
    first.recordDrillPass('cka-t01', true)

    const second = createProgressStore(storage)
    expect(second.isLessonComplete('cka-rbac')).toBe(true)
    expect(second.isBookmarked('cka-rbac')).toBe(true)
    expect(second.state.quizAnswers['kcna-q001'].correct).toBe(true)
    expect(second.state.drillPasses['cka-t01'].passed).toBe(true)
  })

  it('caps exam attempts at twenty and keeps the latest first', () => {
    const store = createProgressStore(createMemoryStorage())
    for (let index = 0; index < 22; index += 1) {
      store.recordExamAttempt({ trackId: 'kcna', percent: index })
    }
    expect(store.state.examAttempts).toHaveLength(20)
    expect(store.state.examAttempts[0].percent).toBe(21)
  })

  it('calculates quiz and domain statistics', () => {
    const store = createProgressStore(createMemoryStorage())
    store.recordQuizAnswer('q1', 0, true)
    store.recordQuizAnswer('q2', 1, false)
    expect(store.quizStats(['q1', 'q2', 'q3'])).toEqual({
      answered: 2,
      correct: 1,
      percent: 50,
    })
    expect(store.domainProgress('kcna', 'fundamentals')).toEqual({
      total: 3,
      completed: 0,
      percent: 0,
    })
  })

  it('resets all state and writes an empty record', () => {
    const storage = createMemoryStorage()
    const store = createProgressStore(storage)
    store.markLessonComplete('kcna-cluster-model')
    store.resetAll()
    expect(store.state.completedLessons).toEqual([])
    const persisted = JSON.parse(storage.getItem(PROGRESS_KEY))
    expect(persisted).toEqual(emptyProgress())
  })

  it('recovers from malformed storage', () => {
    const storage = createMemoryStorage({ [PROGRESS_KEY]: '{broken' })
    const store = createProgressStore(storage)
    expect(store.totalCompleted.value).toBe(0)
  })

  it('migrates progress saved under the former CloudPath key', () => {
    const legacyState = {
      ...emptyProgress(),
      completedLessons: ['kcna-cluster-model'],
      bookmarks: ['cka-rbac'],
    }
    const storage = createMemoryStorage({
      [LEGACY_PROGRESS_KEY]: JSON.stringify(legacyState),
    })
    const store = createProgressStore(storage)
    expect(store.isLessonComplete('kcna-cluster-model')).toBe(true)
    expect(store.isBookmarked('cka-rbac')).toBe(true)
    expect(storage.getItem(PROGRESS_KEY)).toBe(JSON.stringify(legacyState))
  })
})
