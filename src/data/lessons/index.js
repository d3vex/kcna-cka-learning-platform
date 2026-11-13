import { kcnaLessons } from './kcna'
import { ckaLessons } from './cka'
import { tracks, getTrack } from '../tracks'

export const allLessons = [...kcnaLessons, ...ckaLessons]

export function getLesson(lessonId) {
  return allLessons.find((lesson) => lesson.id === lessonId)
}

export function getLessonsForTrack(trackId) {
  return allLessons.filter((lesson) => lesson.trackId === trackId)
}

export function getLessonsForModule(trackId, moduleId) {
  const module = getTrack(trackId)?.modules.find((item) => item.id === moduleId)
  if (!module) return []
  return module.lessonIds.map((id) => getLesson(id)).filter(Boolean)
}

export function getLessonNeighbors(lessonId) {
  const lesson = getLesson(lessonId)
  if (!lesson) return { previous: null, next: null }
  const lessons = getLessonsForTrack(lesson.trackId)
  const index = lessons.findIndex((item) => item.id === lessonId)
  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
  }
}

export function getDomainLessons(trackId, domainId) {
  return getLessonsForTrack(trackId).filter((lesson) => lesson.domain === domainId)
}

export function getTrackLessonCount(trackId) {
  return getLessonsForTrack(trackId).length
}

export function getTrackMinutes(trackId) {
  return getLessonsForTrack(trackId).reduce((total, lesson) => total + lesson.minutes, 0)
}

export function getTrackDomainsWithLessons(trackId) {
  const track = getTrack(trackId)
  if (!track) return []
  return track.domains.map((domain) => ({
    ...domain,
    lessons: getDomainLessons(trackId, domain.id),
  }))
}

export const curriculumStats = tracks.map((track) => ({
  trackId: track.id,
  code: track.code,
  lessonCount: getTrackLessonCount(track.id),
  minutes: getTrackMinutes(track.id),
}))

export function validateCurriculum() {
  const errors = []
  const ids = new Set()
  for (const lesson of allLessons) {
    if (ids.has(lesson.id)) errors.push(`Duplicate lesson id: ${lesson.id}`)
    ids.add(lesson.id)
    const track = getTrack(lesson.trackId)
    if (!track) errors.push(`${lesson.id}: unknown track ${lesson.trackId}`)
    else if (!track.domains.some((domain) => domain.id === lesson.domain)) {
      errors.push(`${lesson.id}: unknown domain ${lesson.domain}`)
    }
    const inModule = track?.modules.some((module) => module.lessonIds.includes(lesson.id))
    if (!inModule) errors.push(`${lesson.id}: not referenced by any module`)
  }
  for (const track of tracks) {
    const total = track.domains.reduce((sum, domain) => sum + domain.weight, 0)
    if (total !== 100) errors.push(`${track.code}: domain weights sum to ${total}`)
    for (const module of track.modules) {
      for (const id of module.lessonIds) {
        if (!ids.has(id)) errors.push(`${module.id}: missing lesson ${id}`)
      }
    }
  }
  return errors
}
