<script setup>
import { computed, onUnmounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import BaseIcon from '../components/BaseIcon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { getTrack } from '../data/tracks'
import { kcnaQuestions } from '../data/questions'
import { ckaChallenges } from '../data/challenges'
import { buildCkaExam, buildKcnaExam, scoreCkaExam, scoreKcnaExam } from '../lib/exam'
import { evaluateChallenge, formatClock } from '../lib/command'
import { useProgress } from '../lib/progress'

const route = useRoute()
const progress = useProgress()

const track = computed(() => getTrack(route.params.trackId))
const isKcna = computed(() => track.value?.id === 'kcna')
const phase = ref('brief')
const examItems = ref([])
const answers = reactive({})
const flagged = ref([])
const currentIndex = ref(0)
const remaining = ref(0)
const result = ref(null)
const confirmOpen = ref(false)
const startedAt = ref(0)
const deadline = ref(0)
let timerId = null

const totalSeconds = computed(() => (isKcna.value ? 90 * 60 : 120 * 60))
const itemCount = computed(() => (isKcna.value ? kcnaQuestions.length : ckaChallenges.length))
const currentItem = computed(() => examItems.value[currentIndex.value] || null)
const currentDomain = computed(() =>
  track.value?.domains.find((domain) => domain.id === currentItem.value?.domain),
)
const timerUrgent = computed(() => remaining.value <= 300)
const answeredCount = computed(() => {
  if (!examItems.value.length) return 0
  if (isKcna.value) {
    return examItems.value.filter((item) =>
      Object.prototype.hasOwnProperty.call(answers, item.id),
    ).length
  }
  return examItems.value.filter((item) => (answers[item.id] || '').trim()).length
})

const resultDomains = computed(() => {
  if (!result.value || !track.value) return []
  return track.value.domains.map((domain) => {
    const score = result.value.domains[domain.id] || { correct: 0, total: 0 }
    return {
      ...domain,
      ...score,
      percent: score.total ? Math.round((score.correct / score.total) * 100) : 0,
    }
  })
})

function isAnswered(item) {
  if (!item) return false
  return isKcna.value
    ? Object.prototype.hasOwnProperty.call(answers, item.id)
    : Boolean((answers[item.id] || '').trim())
}

function isFlagged(item) {
  return Boolean(item && flagged.value.includes(item.id))
}

function toggleFlag() {
  if (!currentItem.value) return
  const id = currentItem.value.id
  flagged.value = flagged.value.includes(id)
    ? flagged.value.filter((item) => item !== id)
    : [...flagged.value, id]
}

function startExam() {
  const source = isKcna.value ? kcnaQuestions : ckaChallenges
  examItems.value = isKcna.value ? buildKcnaExam(source) : buildCkaExam(source)
  Object.keys(answers).forEach((key) => delete answers[key])
  flagged.value = []
  currentIndex.value = 0
  result.value = null
  confirmOpen.value = false
  phase.value = 'active'
  startedAt.value = Date.now()
  deadline.value = Date.now() + totalSeconds.value * 1000
  remaining.value = totalSeconds.value
  timerId = window.setInterval(tick, 1000)
  window.addEventListener('beforeunload', onBeforeUnload)
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function tick() {
  remaining.value = Math.max(0, Math.ceil((deadline.value - Date.now()) / 1000))
  if (remaining.value === 0) finishExam()
}

function onBeforeUnload(event) {
  if (phase.value !== 'active') return
  event.preventDefault()
  event.returnValue = ''
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId)
    timerId = null
  }
  window.removeEventListener('beforeunload', onBeforeUnload)
}

function finishExam() {
  if (phase.value !== 'active') return
  stopTimer()
  const elapsedSeconds = Math.max(1, Math.min(totalSeconds.value, Math.round((Date.now() - startedAt.value) / 1000)))
  const score = isKcna.value
    ? scoreKcnaExam(examItems.value, answers)
    : scoreCkaExam(examItems.value, answers)
  result.value = {
    ...score,
    trackId: track.value.id,
    elapsedSeconds,
    durationSeconds: totalSeconds.value,
    practiceTarget: track.value.practiceTarget,
  }
  progress.recordExamAttempt({
    trackId: track.value.id,
    correct: score.correct,
    total: score.total,
    percent: score.percent,
    domains: score.domains,
    elapsedSeconds,
    durationSeconds: totalSeconds.value,
    practiceTarget: track.value.practiceTarget,
  })
  phase.value = 'review'
  currentIndex.value = 0
  confirmOpen.value = false
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function requestSubmit() {
  confirmOpen.value = true
}

function confirmSubmit() {
  confirmOpen.value = false
  finishExam()
}

function cancelSubmit() {
  confirmOpen.value = false
}

function goTo(index) {
  if (index >= 0 && index < examItems.value.length) currentIndex.value = index
}

function next() {
  goTo(currentIndex.value + 1)
}

function previous() {
  goTo(currentIndex.value - 1)
}

function restartBriefing() {
  phase.value = 'brief'
  result.value = null
  examItems.value = []
  Object.keys(answers).forEach((key) => delete answers[key])
  flagged.value = []
  currentIndex.value = 0
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function userAnswerFor(item) {
  if (isKcna.value) {
    const selected = answers[item.id]
    return selected === undefined ? null : selected
  }
  return answers[item.id] || ''
}

function challengeResult(item) {
  return evaluateChallenge(answers[item.id] || '', item)
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

onBeforeRouteLeave(() => {
  if (phase.value !== 'active') return true
  return window.confirm(
    'This simulation is still running. Leave and discard the current attempt?',
  )
})

onUnmounted(stopTimer)
</script>

<template>
  <div v-if="track" class="exam-runner">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <RouterLink to="/exam">Mock exams</RouterLink>
      <BaseIcon name="chevronRight" :size="13" />
      <span>{{ track.code }} simulator</span>
    </nav>

    <section v-if="phase === 'brief'" class="exam-brief">
      <header class="exam-brief-hero" :style="{ '--track-accent': track.accent, '--track-ink': track.accentInk }">
        <div>
          <div class="track-hero-badges">
            <span class="code-badge">{{ track.code }}</span>
            <span class="level-pill">{{ track.level }}</span>
          </div>
          <h1>{{ track.code }} exam simulation</h1>
          <p>
            {{ isKcna
              ? 'A 60-question, 90-minute knowledge exam across all four published KCNA domains.'
              : 'A 17-task, two-hour command simulation across all five published CKA domains.' }}
          </p>
        </div>
        <div class="exam-brief-ring">
          <ProgressRing :value="0" :size="108" :stroke="8" color="#f2efe6" track="rgba(255,255,255,.16)" />
          <span>Not started</span>
        </div>
      </header>

      <div class="brief-grid">
        <div class="brief-facts">
          <div class="brief-fact"><BaseIcon name="grid" :size="19" /><span><strong>{{ itemCount }}</strong><small>{{ isKcna ? 'questions' : 'tasks' }}</small></span></div>
          <div class="brief-fact"><BaseIcon name="timer" :size="19" /><span><strong>{{ isKcna ? '90' : '120' }}</strong><small>minutes</small></span></div>
          <div class="brief-fact"><BaseIcon name="target" :size="19" /><span><strong>{{ track.practiceTarget }}%</strong><small>practice target</small></span></div>
          <div class="brief-fact"><BaseIcon name="layers" :size="19" /><span><strong>{{ track.domains.length }}</strong><small>domains</small></span></div>
        </div>

        <div class="brief-instructions">
          <p class="eyebrow">Exam conditions</p>
          <h2>What happens when you begin.</h2>
          <ul class="brief-list">
            <li><BaseIcon name="check" :size="16" /><span>The timer starts immediately and continues while you navigate.</span></li>
            <li><BaseIcon name="check" :size="16" /><span>{{ isKcna ? 'Answers are locked after selection; feedback appears only after submission.' : 'Commands are not checked until you submit the whole simulation.' }}</span></li>
            <li><BaseIcon name="check" :size="16" /><span>You can flag items and jump between them from the palette.</span></li>
            <li><BaseIcon name="check" :size="16" /><span>At zero, the attempt submits automatically. A page refresh discards it.</span></li>
            <li><BaseIcon name="check" :size="16" /><span>Your score, domain breakdown and attempt history are saved locally.</span></li>
          </ul>
          <div class="brief-warning">
            <BaseIcon name="alert" :size="18" />
            <p>
              {{ isKcna
                ? 'This is a study benchmark, not a replica of the official exam. The official passing standard is set by the certification body.'
                : 'Command-pattern checks cannot see cluster state. Pair this simulator with repeated hands-on practice in a real cluster.' }}
            </p>
          </div>
          <div class="brief-actions">
            <button class="button button-dark button-large" type="button" @click="startExam">
              Begin timed simulation <BaseIcon name="play" :size="17" />
            </button>
            <RouterLink to="/exam" class="button button-quiet">Back to exams</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="phase === 'active'" class="exam-active">
      <div class="exam-toolbar">
        <div class="exam-toolbar-left">
          <span class="code-badge">{{ track.code }}</span>
          <span class="exam-toolbar-label">{{ isKcna ? 'Question' : 'Task' }} {{ currentIndex + 1 }} / {{ examItems.length }}</span>
          <span class="exam-toolbar-answered">{{ answeredCount }} answered</span>
        </div>
        <div class="exam-toolbar-right">
          <span class="exam-timer" :class="{ urgent: timerUrgent }">
            <BaseIcon name="timer" :size="17" />
            {{ formatClock(remaining) }}
          </span>
          <button class="button button-dark button-compact" type="button" @click="requestSubmit">
            Submit exam
          </button>
        </div>
      </div>

      <div class="exam-active-layout">
        <div class="exam-question-panel">
          <div class="question-card-top">
            <div class="question-badges">
              <span class="domain-chip">
                <span class="domain-dot" :style="{ background: currentDomain?.color }"></span>
                {{ currentDomain?.title }}
              </span>
              <span v-if="!isKcna" class="difficulty-chip">{{ currentItem.minutes }} min task</span>
            </div>
            <button class="flag-button" :class="{ active: isFlagged(currentItem) }" type="button" @click="toggleFlag">
              <BaseIcon name="flag" :size="15" />
              {{ isFlagged(currentItem) ? 'Flagged' : 'Flag for review' }}
            </button>
          </div>

          <template v-if="isKcna">
            <h1 class="exam-question-title">{{ currentItem.question }}</h1>
            <div class="answer-list exam-answer-list">
              <button
                v-for="(option, index) in currentItem.options"
                :key="option"
                type="button"
                class="answer-option"
                :class="{ selected: answers[currentItem.id] === index }"
                @click="answers[currentItem.id] = index"
              >
                <span class="answer-letter">{{ String.fromCharCode(65 + index) }}</span>
                <span>{{ option }}</span>
              </button>
            </div>
          </template>

          <template v-else>
            <h1 class="exam-question-title">{{ currentItem.title }}</h1>
            <p class="exam-task-brief">{{ currentItem.brief }}</p>
            <div class="terminal-input-card exam-terminal">
              <div class="terminal-chrome">
                <span class="terminal-dots"><i></i><i></i><i></i></span>
                <span class="terminal-title">exam-task — kubectl</span>
                <span class="terminal-state">no hints</span>
              </div>
              <div class="terminal-input-body">
                <label class="sr-only" :for="`task-${currentItem.id}`">Your kubectl command</label>
                <div class="command-prompt">
                  <span class="prompt">$</span>
                  <textarea
                    :id="`task-${currentItem.id}`"
                    v-model="answers[currentItem.id]"
                    rows="6"
                    spellcheck="false"
                    :placeholder="currentItem.placeholder"
                  ></textarea>
                </div>
                <p class="exam-terminal-note">Commands are not checked until submission. Write the commands you would run.</p>
              </div>
            </div>
          </template>

          <div class="exam-navigation">
            <button class="button button-quiet" type="button" :disabled="currentIndex === 0" @click="previous">
              <BaseIcon name="arrowLeft" :size="16" /> Previous
            </button>
            <div class="exam-navigation-center">
              <button class="text-button" type="button" @click="toggleFlag">
                <BaseIcon name="flag" :size="14" /> {{ isFlagged(currentItem) ? 'Remove flag' : 'Flag' }}
              </button>
            </div>
            <button
              class="button button-dark"
              type="button"
              :disabled="currentIndex === examItems.length - 1"
              @click="next"
            >
              Next <BaseIcon name="arrowRight" :size="16" />
            </button>
          </div>
        </div>

        <aside class="exam-palette-panel">
          <div class="aside-card palette-card">
            <div class="palette-heading">
              <p class="aside-kicker">Question palette</p>
              <span>{{ answeredCount }}/{{ examItems.length }}</span>
            </div>
            <div class="exam-palette">
              <button
                v-for="(item, index) in examItems"
                :key="item.id"
                type="button"
                class="palette-button"
                :class="{
                  active: index === currentIndex,
                  answered: isAnswered(item),
                  flagged: isFlagged(item),
                }"
                @click="goTo(index)"
              >
                {{ index + 1 }}
                <span v-if="isFlagged(item)" class="palette-flag"></span>
              </button>
            </div>
            <div class="palette-legend">
              <span><i class="legend-dot answered"></i> Answered</span>
              <span><i class="legend-dot flag"></i> Flagged</span>
              <span><i class="legend-dot"></i> Open</span>
            </div>
            <div class="palette-summary">
              <div><span>Flagged</span><strong>{{ flagged.length }}</strong></div>
              <div><span>Open</span><strong>{{ examItems.length - answeredCount }}</strong></div>
            </div>
            <button class="button button-quiet palette-submit" type="button" @click="requestSubmit">
              Submit and score
            </button>
          </div>
          <div class="aside-card exam-side-note">
            <BaseIcon name="info" :size="17" />
            <p>{{ isKcna ? 'Flag uncertain questions and return after a first pass.' : 'Write the complete command sequence; partial answers may fail checks.' }}</p>
          </div>
        </aside>
      </div>
    </section>

    <section v-else-if="phase === 'review' && result" class="exam-results">
      <header class="result-hero" :class="result.percent >= result.practiceTarget ? 'result-pass' : 'result-miss'">
        <div class="result-hero-copy">
          <p class="eyebrow">Practice result</p>
          <h1>{{ result.percent }}%</h1>
          <p>
            {{ result.correct }} of {{ result.total }} {{ isKcna ? 'questions' : 'tasks' }} met the
            standard. Practice target: {{ result.practiceTarget }}%.
          </p>
          <div class="result-badges">
            <span class="result-status">
              {{ result.percent >= result.practiceTarget ? 'At or above practice target' : 'Below practice target' }}
            </span>
            <span class="result-time"><BaseIcon name="clock" :size="14" /> {{ formatClock(result.elapsedSeconds) }} used</span>
          </div>
        </div>
        <ProgressRing
          :value="result.percent"
          :size="150"
          :stroke="11"
          :color="result.percent >= result.practiceTarget ? '#1f6b4d' : '#a04a20'"
          track="rgba(255,255,255,.18)"
        />
      </header>

      <div class="result-disclaimer">
        <BaseIcon name="info" :size="18" />
        <p>
          This is a study benchmark, not an official pass/fail result.
          {{ isKcna
            ? 'The official KCNA exam is a proctored multiple-choice exam; passing standards are set by the certification body.'
            : 'The official CKA is a live, performance-based exam. A command-pattern score cannot verify cluster state.' }}
        </p>
      </div>

      <section class="result-domains">
        <div class="section-block-heading">
          <div>
            <p class="eyebrow">Domain breakdown</p>
            <h2>Where the score came from.</h2>
          </div>
          <span class="section-note">Exam weight in brackets</span>
        </div>
        <div class="result-domain-grid">
          <article v-for="domain in resultDomains" :key="domain.id" class="result-domain-card">
            <div class="result-domain-top">
              <span class="domain-dot" :style="{ background: domain.color }"></span>
              <span class="result-domain-weight">{{ domain.weight }}% of exam</span>
            </div>
            <h3>{{ domain.title }}</h3>
            <div class="result-domain-score">
              <strong>{{ domain.percent }}%</strong>
              <span>{{ domain.correct }}/{{ domain.total }}</span>
            </div>
            <div class="domain-bar">
              <span :style="{ width: `${domain.percent}%`, background: domain.color }"></span>
            </div>
          </article>
        </div>
      </section>

      <section class="result-review">
        <div class="section-block-heading">
          <div>
            <p class="eyebrow">Item review</p>
            <h2>Every answer, including the misses.</h2>
          </div>
          <span class="section-note">{{ result.total }} items</span>
        </div>

        <div class="review-list">
          <details
            v-for="(item, index) in examItems"
            :key="item.id"
            class="review-item"
            :class="isKcna
              ? (userAnswerFor(item) === item.answer ? 'review-correct' : 'review-wrong')
              : (challengeResult(item).passed ? 'review-correct' : 'review-wrong')"
          >
            <summary>
              <span class="review-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="review-summary-copy">
                <strong>{{ isKcna ? item.question : item.title }}</strong>
                <small>{{ track.domains.find((domain) => domain.id === item.domain)?.title }}</small>
              </span>
              <span class="review-status">
                <BaseIcon
                  :name="(isKcna ? userAnswerFor(item) === item.answer : challengeResult(item).passed) ? 'check' : 'close'"
                  :size="15"
                />
                {{ isKcna ? (userAnswerFor(item) === item.answer ? 'Correct' : 'Missed') : (challengeResult(item).passed ? 'Passed' : 'Missed') }}
              </span>
            </summary>

            <div class="review-body">
              <template v-if="isKcna">
                <p class="review-question">{{ item.question }}</p>
                <div class="review-answer-row">
                  <span>Your answer</span>
                  <strong>
                    {{ userAnswerFor(item) === null ? 'Not answered' : `${String.fromCharCode(65 + userAnswerFor(item))}. ${item.options[userAnswerFor(item)]}` }}
                  </strong>
                </div>
                <div class="review-answer-row correct-row">
                  <span>Correct answer</span>
                  <strong>{{ String.fromCharCode(65 + item.answer) }}. {{ item.options[item.answer] }}</strong>
                </div>
                <p class="review-explanation">{{ item.explanation }}</p>
              </template>

              <template v-else>
                <p class="review-question">{{ item.brief }}</p>
                <div class="review-command">
                  <span>Your command</span>
                  <pre><code>{{ userAnswerFor(item) || 'No answer submitted.' }}</code></pre>
                </div>
                <ul class="review-checks">
                  <li v-for="check in challengeResult(item).checks" :key="check.label" :class="{ pass: check.pass }">
                    <BaseIcon :name="check.pass ? 'check' : 'close'" :size="14" />
                    {{ check.label }}
                  </li>
                </ul>
                <div class="review-solution">
                  <span>One working solution</span>
                  <pre><code>{{ item.solution }}</code></pre>
                </div>
                <p class="review-explanation">{{ item.explanation }}</p>
              </template>
            </div>
          </details>
        </div>
      </section>

      <div class="result-actions">
        <button class="button button-dark" type="button" @click="startExam">
          <BaseIcon name="rotate" :size="16" /> Retake simulation
        </button>
        <RouterLink to="/practice" class="button button-quiet">Practise weak areas</RouterLink>
        <RouterLink :to="`/track/${track.id}`" class="button button-quiet">Back to course</RouterLink>
        <a :href="track.officialUrl" target="_blank" rel="noreferrer" class="text-link">
          Official exam page <BaseIcon name="external" :size="14" />
        </a>
      </div>

      <p class="result-timestamp">Completed {{ formatDate(Date.now()) }} · saved locally</p>
    </section>

    <div v-if="confirmOpen" class="modal-overlay" @click.self="cancelSubmit">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="submit-title">
        <span class="modal-icon"><BaseIcon name="timer" :size="22" /></span>
        <h2 id="submit-title">Submit this simulation?</h2>
        <p>
          You have answered {{ answeredCount }} of {{ examItems.length }} items. Unanswered items
          will count as missed. You cannot change answers after submission.
        </p>
        <div class="modal-actions">
          <button class="button button-quiet" type="button" @click="cancelSubmit">Keep working</button>
          <button class="button button-dark" type="button" @click="confirmSubmit">Submit and score</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="empty-page">
    <h1>Simulator not found</h1>
    <p>Choose the KCNA or CKA simulation from the exam hub.</p>
    <RouterLink to="/exam" class="button button-dark">Back to exams</RouterLink>
  </div>
</template>
