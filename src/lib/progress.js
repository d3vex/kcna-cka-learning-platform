import { computed, reactive } from 'vue'
import { getLessonsForTrack } from '../data/lessons'

export const PROGRESS_KEY = 'd3vex-academy-progress-v1'
export const LEGACY_PROGRESS_KEY = 'cloudpath-progress-v1'

export function emptyProgress() {
  return {
    version: 1,
    completedLessons: [],
    bookmarks: [],
    quizAnswers: {},
    drillPasses: {},
    examAttempts: [],
    lastLesson: null,
  }
}

function read(storage) {
  if (!storage) return emptyProgress()
  try {
    let raw = storage.getItem(PROGRESS_KEY)
    if (!raw) {
      const legacy = storage.getItem(LEGACY_PROGRESS_KEY)
      if (legacy) {
        raw = legacy
        try {
          storage.setItem(PROGRESS_KEY, legacy)
        } catch {
          // If migration cannot be written, the legacy data can still be read.
        }
      }
    }
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 1) return emptyProgress()
    return {
      ...emptyProgress(),
      ...parsed,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      quizAnswers:
        parsed.quizAnswers && typeof parsed.quizAnswers === 'object' ? parsed.quizAnswers : {},
      drillPasses:
        parsed.drillPasses && typeof parsed.drillPasses === 'object' ? parsed.drillPasses : {},
      examAttempts: Array.isArray(parsed.examAttempts) ? parsed.examAttempts : [],
    }
  } catch {
    return emptyProgress()
  }
}

export function createProgressStore(storage) {
  const state = reactive(read(storage))

  function persist() {
    if (!storage) return
    try {
      storage.setItem(PROGRESS_KEY, JSON.stringify(state))
    } catch {
      // A full or unavailable storage should not break the study session.
    }
  }

  const completedSet = computed(() => new Set(state.completedLessons))
  const bookmarkedSet = computed(() => new Set(state.bookmarks))

  function isLessonComplete(lessonId) {
    return completedSet.value.has(lessonId)
  }

  function markLessonComplete(lessonId, complete = true) {
    const set = new Set(state.completedLessons)
    if (complete) set.add(lessonId)
    else set.delete(lessonId)
    state.completedLessons = [...set]
    persist()
  }

  function toggleBookmark(lessonId) {
    const set = new Set(state.bookmarks)
    if (set.has(lessonId)) set.delete(lessonId)
    else set.add(lessonId)
    state.bookmarks = [...set]
    persist()
  }

  function isBookmarked(lessonId) {
    return bookmarkedSet.value.has(lessonId)
  }

  function recordQuizAnswer(questionId, selected, correct) {
    state.quizAnswers = {
      ...state.quizAnswers,
      [questionId]: { selected, correct, answeredAt: Date.now() },
    }
    persist()
  }

  function resetQuizAnswer(questionId) {
    const next = { ...state.quizAnswers }
    delete next[questionId]
    state.quizAnswers = next
    persist()
  }

  function recordExamAttempt(attempt) {
    state.examAttempts = [
      {
        ...attempt,
        id: `attempt-${Date.now()}`,
        completedAt: Date.now(),
      },
      ...state.examAttempts,
    ].slice(0, 20)
    persist()
  }

  function recordDrillPass(challengeId, passed) {
    const previouslyPassed = state.drillPasses[challengeId]?.passed === true
    state.drillPasses = {
      ...state.drillPasses,
      [challengeId]: { passed: previouslyPassed || passed, checkedAt: Date.now() },
    }
    persist()
  }

  function setLastLesson(trackId, lessonId) {
    state.lastLesson = { trackId, lessonId, at: Date.now() }
    persist()
  }

  function resetAll() {
    Object.assign(state, emptyProgress())
    persist()
  }

  function trackProgress(trackId) {
    const lessons = getLessonsForTrack(trackId)
    const total = lessons.length
    const completed = lessons.filter((lesson) => completedSet.value.has(lesson.id)).length
    return {
      total,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0,
    }
  }

  function domainProgress(trackId, domainId) {
    const lessons = getLessonsForTrack(trackId).filter((lesson) => lesson.domain === domainId)
    const completed = lessons.filter((lesson) => completedSet.value.has(lesson.id)).length
    return {
      total: lessons.length,
      completed,
      percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
    }
  }

  function quizStats(questionIds) {
    const answers = questionIds
      .map((id) => state.quizAnswers[id])
      .filter(Boolean)
    const correct = answers.filter((answer) => answer.correct).length
    return {
      answered: answers.length,
      correct,
      percent: answers.length ? Math.round((correct / answers.length) * 100) : 0,
    }
  }

  const totalCompleted = computed(() => state.completedLessons.length)
  const totalBookmarks = computed(() => state.bookmarks.length)

  return {
    state,
    completedSet,
    bookmarkedSet,
    totalCompleted,
    totalBookmarks,
    isLessonComplete,
    markLessonComplete,
    toggleBookmark,
    isBookmarked,
    recordQuizAnswer,
    resetQuizAnswer,
    recordDrillPass,
    recordExamAttempt,
    setLastLesson,
    resetAll,
    trackProgress,
    domainProgress,
    quizStats,
  }
}

const browserStorage = typeof window !== 'undefined' ? window.localStorage : null
export const progressStore = createProgressStore(browserStorage)

export function useProgress() {
  return progressStore
}
