import { evaluateChallenge } from './command'

export function shuffle(items, random = Math.random) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const next = Math.floor(random() * (index + 1))
    ;[copy[index], copy[next]] = [copy[next], copy[index]]
  }
  return copy
}

export function buildKcnaExam(questions, random = Math.random) {
  return shuffle(questions, random)
}

export function buildCkaExam(challenges, random = Math.random) {
  return shuffle(challenges, random)
}

export function scoreKcnaExam(questions, answers) {
  let correct = 0
  const domains = {}
  for (const question of questions) {
    const selected = answers[question.id]
    const isCorrect = selected === question.answer
    if (isCorrect) correct += 1
    if (!domains[question.domain]) {
      domains[question.domain] = { correct: 0, total: 0 }
    }
    domains[question.domain].total += 1
    if (isCorrect) domains[question.domain].correct += 1
  }
  return {
    correct,
    total: questions.length,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    domains,
  }
}

export function scoreCkaExam(challenges, responses) {
  let correct = 0
  const domains = {}
  const results = {}
  for (const challenge of challenges) {
    const result = evaluateChallenge(responses[challenge.id] || '', challenge)
    results[challenge.id] = result
    if (result.passed) correct += 1
    if (!domains[challenge.domain]) {
      domains[challenge.domain] = { correct: 0, total: 0 }
    }
    domains[challenge.domain].total += 1
    if (result.passed) domains[challenge.domain].correct += 1
  }
  return {
    correct,
    total: challenges.length,
    percent: challenges.length ? Math.round((correct / challenges.length) * 100) : 0,
    domains,
    results,
  }
}
