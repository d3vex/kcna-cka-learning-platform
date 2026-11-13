export function normalizeCommand(value) {
  return value
    .replace(/\\\r?\n/g, ' ')
    .replace(/^\s*\$\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function evaluateChallenge(input, challenge) {
  const normalized = normalizeCommand(input)
  const checks = (challenge.checks || []).map((check) => {
    let pass = false
    try {
      pass = new RegExp(check.pattern, 'i').test(normalized)
    } catch {
      pass = false
    }
    return { ...check, pass }
  })
  return {
    normalized,
    checks,
    passed: normalized.length > 0 && checks.length > 0 && checks.every((check) => check.pass),
    missing: checks.filter((check) => !check.pass).map((check) => check.label),
  }
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
