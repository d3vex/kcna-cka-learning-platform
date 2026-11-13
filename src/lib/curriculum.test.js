import { describe, expect, it } from 'vitest'
import { allLessons, getLessonsForTrack, validateCurriculum } from '../data/lessons'
import { tracks } from '../data/tracks'
import { kcnaQuestions } from '../data/questions'
import { ckaChallenges } from '../data/challenges'
import { evaluateChallenge } from './command'

describe('curriculum integrity', () => {
  it('has no duplicate or orphaned lessons', () => {
    expect(validateCurriculum()).toEqual([])
  })

  it('covers both tracks with the planned lesson counts', () => {
    expect(allLessons).toHaveLength(27)
    expect(getLessonsForTrack('kcna')).toHaveLength(12)
    expect(getLessonsForTrack('cka')).toHaveLength(15)
  })

  it('keeps every official domain weight sum at 100', () => {
    for (const track of tracks) {
      expect(track.domains.reduce((sum, domain) => sum + domain.weight, 0)).toBe(100)
    }
  })

  it('maps every lesson to a declared domain and module', () => {
    for (const lesson of allLessons) {
      const track = tracks.find((item) => item.id === lesson.trackId)
      expect(track).toBeTruthy()
      expect(track.domains.some((domain) => domain.id === lesson.domain)).toBe(true)
      expect(track.modules.some((module) => module.lessonIds.includes(lesson.id))).toBe(true)
      expect(lesson.objectives.length).toBeGreaterThan(0)
      expect(lesson.checkpoint.answer).toBeGreaterThanOrEqual(0)
      expect(lesson.checkpoint.answer).toBeLessThan(lesson.checkpoint.options.length)
    }
  })

  it('provides 60 valid KCNA questions', () => {
    expect(kcnaQuestions).toHaveLength(60)
    const ids = new Set()
    const domains = new Set(tracks.find((track) => track.id === 'kcna').domains.map((d) => d.id))
    for (const question of kcnaQuestions) {
      expect(ids.has(question.id)).toBe(false)
      ids.add(question.id)
      expect(question.options).toHaveLength(4)
      expect(question.answer).toBeGreaterThanOrEqual(0)
      expect(question.answer).toBeLessThan(question.options.length)
      expect(question.explanation.length).toBeGreaterThan(20)
      expect(domains.has(question.domain)).toBe(true)
    }
  })

  it('provides 17 valid CKA challenges whose solutions pass their own checks', () => {
    expect(ckaChallenges).toHaveLength(17)
    const domains = new Set(tracks.find((track) => track.id === 'cka').domains.map((d) => d.id))
    for (const challenge of ckaChallenges) {
      expect(challenge.checks.length).toBeGreaterThan(0)
      expect(domains.has(challenge.domain)).toBe(true)
      const result = evaluateChallenge(challenge.solution, challenge)
      for (const check of result.checks) {
        expect(check.pass, `${challenge.id}: ${check.label}`).toBe(true)
      }
      expect(result.passed, `${challenge.id} solution should pass`).toBe(true)
    }
  })
})
