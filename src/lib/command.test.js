import { describe, expect, it } from 'vitest'
import { evaluateChallenge, formatClock, normalizeCommand } from './command'

const challenge = {
  checks: [
    { label: 'drains the node', pattern: 'kubectl\\s+drain\\s+worker-1\\b' },
    { label: 'ignores daemonsets', pattern: '--ignore-daemonsets\\b' },
  ],
}

describe('normalizeCommand', () => {
  it('collapses whitespace, strips prompts and preserves a single command line', () => {
    expect(normalizeCommand('  $ kubectl   get pods\n')).toBe('kubectl get pods')
  })

  it('joins shell line continuations', () => {
    expect(normalizeCommand('kubectl get \\\n pods')).toBe('kubectl get pods')
  })
})

describe('evaluateChallenge', () => {
  it('passes when every required pattern matches', () => {
    const result = evaluateChallenge(
      'kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data',
      challenge,
    )
    expect(result.passed).toBe(true)
    expect(result.missing).toEqual([])
  })

  it('reports the missing requirement', () => {
    const result = evaluateChallenge('kubectl drain worker-1', challenge)
    expect(result.passed).toBe(false)
    expect(result.missing).toEqual(['ignores daemonsets'])
  })

  it('does not pass an empty answer', () => {
    const result = evaluateChallenge('   ', challenge)
    expect(result.passed).toBe(false)
  })

  it('is case-insensitive and tolerates extra spacing', () => {
    const result = evaluateChallenge(
      'KUBECTL   DRAIN worker-1   --IGNORE-DAEMONSETS',
      challenge,
    )
    expect(result.passed).toBe(true)
  })
})

describe('formatClock', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(90 * 60)).toBe('1:30:00')
    expect(formatClock(65)).toBe('01:05')
    expect(formatClock(-1)).toBe('00:00')
  })
})
