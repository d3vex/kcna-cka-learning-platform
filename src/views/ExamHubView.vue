<script setup>
import { computed } from 'vue'
import BaseIcon from '../components/BaseIcon.vue'
import { tracks } from '../data/tracks'
import { kcnaQuestions } from '../data/questions'
import { ckaChallenges } from '../data/challenges'
import { useProgress } from '../lib/progress'

const progress = useProgress()

const exams = computed(() =>
  tracks.map((track) => {
    const attempts = progress.state.examAttempts.filter((attempt) => attempt.trackId === track.id)
    const best = attempts.length ? Math.max(...attempts.map((attempt) => attempt.percent)) : null
    const latest = attempts[0] || null
    return {
      ...track,
      attempts,
      best,
      latest,
      itemCount: track.id === 'kcna' ? kcnaQuestions.length : ckaChallenges.length,
      durationLabel: track.id === 'kcna' ? '90 minutes' : '2 hours',
      modeLabel: track.id === 'kcna' ? '60 multiple-choice questions' : '17 command scenarios',
    }
  }),
)

function formatDate(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function formatDuration(seconds) {
  if (!seconds) return '—'
  const minutes = Math.round(seconds / 60)
  return `${minutes} min`
}
</script>

<template>
  <div class="exam-hub">
    <header class="page-header exam-hub-header">
      <div>
        <p class="eyebrow">Exam simulator</p>
        <h1>Two simulators. One honest score.</h1>
        <p class="page-lede">
          Work in one sitting, without hints. The KCNA simulator scores knowledge across all four
          domains. The CKA simulator checks the shape of your kubectl commands across all five.
        </p>
      </div>
      <div class="exam-hub-note">
        <BaseIcon name="info" :size="18" />
        <p>Simulators are study tools, not official exam products. Use a real cluster for CKA practice.</p>
      </div>
    </header>

    <div class="exam-mode-grid">
      <article
        v-for="exam in exams"
        :id="exam.id"
        :key="exam.id"
        class="exam-mode-card"
        :style="{ '--track-accent': exam.accent, '--track-ink': exam.accentInk }"
      >
        <div class="exam-mode-top">
          <span class="code-badge">{{ exam.code }}</span>
          <span class="level-pill">{{ exam.level }}</span>
        </div>
        <h2>{{ exam.title }}</h2>
        <p class="exam-mode-description">
          {{
            exam.id === 'kcna'
              ? 'A timed knowledge exam covering fundamentals, orchestration, delivery and architecture.'
              : 'A timed command-line simulation: RBAC, kubeadm, rollouts, networking, storage and troubleshooting.'
          }}
        </p>

        <dl class="exam-mode-facts">
          <div><dt>Mode</dt><dd>{{ exam.modeLabel }}</dd></div>
          <div><dt>Time limit</dt><dd>{{ exam.durationLabel }}</dd></div>
          <div><dt>Practice target</dt><dd>{{ exam.practiceTarget }}%</dd></div>
          <div><dt>Scope</dt><dd>{{ exam.version }}</dd></div>
        </dl>

        <div class="exam-mode-score">
          <div>
            <span>Personal best</span>
            <strong>{{ exam.best === null ? '—' : `${exam.best}%` }}</strong>
          </div>
          <div>
            <span>Attempts</span>
            <strong>{{ exam.attempts.length }}</strong>
          </div>
        </div>

        <RouterLink :to="`/exam/${exam.id}`" class="button button-dark exam-start">
          {{ exam.attempts.length ? 'Take another simulation' : 'Start simulation' }}
          <BaseIcon name="play" :size="16" />
        </RouterLink>

        <div v-if="exam.latest" class="exam-latest">
          <span>Last attempt · {{ formatDate(exam.latest.completedAt) }}</span>
          <span>{{ exam.latest.correct }}/{{ exam.latest.total }} · {{ formatDuration(exam.latest.elapsedSeconds) }}</span>
        </div>
      </article>
    </div>

    <section class="exam-rules-panel">
      <div class="exam-rules-copy">
        <p class="eyebrow">Before you begin</p>
        <h2>Treat it like the real thing.</h2>
        <p>
          The value of a simulation comes from the constraint. One sitting, no lesson tabs, no
          hints, and a review pass at the end.
        </p>
      </div>
      <ul class="rules-list">
        <li><span>01</span><div><strong>No feedback until submission</strong><p>Answers are locked in and scored together, like an exam.</p></div></li>
        <li><span>02</span><div><strong>The timer is real</strong><p>The attempt auto-submits when time runs out. Plan a final review pass.</p></div></li>
        <li><span>03</span><div><strong>Review the misses</strong><p>Every result includes explanations and, for CKA, accepted command patterns.</p></div></li>
        <li><span>04</span><div><strong>Know the limitation</strong><p>KCNA is multiple-choice; CKA is hands-on. A command-pattern score is not a cluster score.</p></div></li>
      </ul>
    </section>

    <section class="attempt-history">
      <div class="section-block-heading">
        <div>
          <p class="eyebrow">Attempt history</p>
          <h2>Evidence over vibes.</h2>
        </div>
        <span class="section-note">Last 20 attempts per device</span>
      </div>
      <div v-if="progress.state.examAttempts.length" class="attempt-table-wrap">
        <table class="attempt-table">
          <thead>
            <tr>
              <th scope="col">Exam</th>
              <th scope="col">Date</th>
              <th scope="col">Score</th>
              <th scope="col">Target</th>
              <th scope="col">Time used</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attempt in progress.state.examAttempts" :key="attempt.id">
              <td><span class="attempt-code">{{ attempt.trackId.toUpperCase() }}</span></td>
              <td>{{ formatDate(attempt.completedAt) }}</td>
              <td><strong>{{ attempt.percent }}%</strong> <span class="muted">({{ attempt.correct }}/{{ attempt.total }})</span></td>
              <td>{{ attempt.practiceTarget }}%</td>
              <td>{{ formatDuration(attempt.elapsedSeconds) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-inline">
        <BaseIcon name="timer" :size="22" />
        <p>No attempts yet. Your first baseline is the most useful one.</p>
      </div>
    </section>
  </div>
</template>
