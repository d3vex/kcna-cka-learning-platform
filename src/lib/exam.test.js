import { describe, expect, it } from 'vitest'
import { buildCkaExam, buildKcnaExam, scoreCkaExam, scoreKcnaExam } from './exam'
import { kcnaQuestions } from '../data/questions'
import { ckaChallenges } from '../data/challenges'

describe('KCNA exam engine', () => {
  it('builds a full exam without dropping or duplicating questions', () => {
    const exam = buildKcnaExam(kcnaQuestions, () => 0.5)
    expect(exam).toHaveLength(60)
    expect(new Set(exam.map((question) => question.id)).size).toBe(60)
  })

  it('scores correct answers and domain breakdowns', () => {
    const answers = Object.fromEntries(
      kcnaQuestions.map((question, index) => [
        question.id,
        index < 30 ? question.answer : (question.answer + 1) % question.options.length,
      ]),
    )
    const result = scoreKcnaExam(kcnaQuestions, answers)
    expect(result.correct).toBe(30)
    expect(result.total).toBe(60)
    expect(result.percent).toBe(50)
    expect(Object.keys(result.domains)).toHaveLength(4)
  })

  it('counts unanswered questions as incorrect', () => {
    const result = scoreKcnaExam(kcnaQuestions.slice(0, 5), {})
    expect(result.correct).toBe(0)
    expect(result.percent).toBe(0)
  })
})

describe('CKA exam engine', () => {
  it('scores all canonical solutions as passing', () => {
    const responses = Object.fromEntries(
      ckaChallenges.map((challenge) => [challenge.id, challenge.solution]),
    )
    const result = scoreCkaExam(ckaChallenges, responses)
    expect(result.correct).toBe(17)
    expect(result.percent).toBe(100)
    expect(Object.keys(result.domains)).toHaveLength(5)
  })

  it('builds a full scenario exam', () => {
    const exam = buildCkaExam(ckaChallenges, () => 0.4)
    expect(exam).toHaveLength(17)
    expect(new Set(exam.map((challenge) => challenge.id)).size).toBe(17)
  })

  it('scores missing responses as zero', () => {
    const result = scoreCkaExam(ckaChallenges.slice(0, 3), {})
    expect(result.correct).toBe(0)
    expect(result.results[ckaChallenges[0].id].passed).toBe(false)
  })
})
