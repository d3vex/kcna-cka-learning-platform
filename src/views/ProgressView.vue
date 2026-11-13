<script setup>
import { computed, ref } from 'vue'
import BaseIcon from '../components/BaseIcon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { tracks } from '../data/tracks'
import { allLessons, getLesson, getLessonsForTrack } from '../data/lessons'
import { kcnaQuestions } from '../data/questions'
import { ckaChallenges } from '../data/challenges'
import { useProgress } from '../lib/progress'

const progress = useProgress()
const resetOpen = ref(false)

const overall = computed(() => ({
  completed: progress.totalCompleted.value,
  total: allLessons.length,
  percent: Math.round((progress.totalCompleted.value / allLessons.length) * 100),
}))

const quizStats = computed(() => progress.quizStats(kcnaQuestions.map((question) => question.id)))
const drillPassed = computed(
  () => Object.values(progress.state.drillPasses).filter((entry) => entry.passed).length,
)
const bestExam = computed(() => {
  if (!progress.state.examAttempts.length) return null
  return Math.max(...progress.state.examAttempts.map((attempt) => attempt.percent))
})

const trackCards = computed(() =>
  tracks.map((track) => ({
    ...track,
    progress: progress.trackProgress(track.id),
    lessons: getLessonsForTrack(track.id),
    domains: track.domains.map((domain) => ({
      ...domain,
      progress: progress.domainProgress(track.id, domain.id),
    })),
  })),
)

const lastLesson = computed(() => {
  if (!progress.state.lastLesson) return null
  return getLesson(progress.state.lastLesson.lessonId)
})

const nextLesson = computed(() => {
  if (lastLesson.value && !progress.isLessonComplete(lastLesson.value.id)) return lastLesson.value
  return allLessons.find((lesson) => !progress.isLessonComplete(lesson.id)) || allLessons[0]
})

const bookmarkedLessons = computed(() =>
  progress.state.bookmarks.map((id) => getLesson(id)).filter(Boolean),
)

function formatDate(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function resetProgress() {
  progress.resetAll()
  resetOpen.value = false
}
</script>

<template>
  <div class="progress-page">
    <header class="progress-header">
      <div>
        <p class="eyebrow">Your evidence</p>
        <h1>{{ overall.completed ? 'The loop is working.' : 'Start building the record.' }}</h1>
        <p class="page-lede">
          Progress here is more than a percentage: lessons completed, answers explained, commands
          checked and timed attempts finished. It lives in this browser.
        </p>
        <RouterLink
          :to="`/track/${nextLesson.trackId}/lesson/${nextLesson.id}`"
          class="button button-dark"
        >
          {{ overall.completed ? 'Continue where you left off' : 'Open your first lesson' }}
          <BaseIcon name="arrowRight" :size="16" />
        </RouterLink>
      </div>
      <div class="progress-hero-ring">
        <ProgressRing :value="overall.percent" :size="154" :stroke="11" color="var(--ink)" />
        <div class="progress-hero-caption">
          <strong>{{ overall.completed }} of {{ overall.total }}</strong>
          <span>lessons complete</span>
        </div>
      </div>
    </header>

    <section class="stats-grid">
      <article class="stat-card">
        <span class="stat-icon"><BaseIcon name="bookOpen" :size="19" /></span>
        <strong>{{ overall.completed }}<span>/{{ overall.total }}</span></strong>
        <p>Lessons complete</p>
      </article>
      <article class="stat-card">
        <span class="stat-icon"><BaseIcon name="target" :size="19" /></span>
        <strong>{{ quizStats.correct }}<span>/{{ quizStats.answered }}</span></strong>
        <p>KCNA answers correct / attempted</p>
      </article>
      <article class="stat-card">
        <span class="stat-icon"><BaseIcon name="terminal" :size="19" /></span>
        <strong>{{ drillPassed }}<span>/{{ ckaChallenges.length }}</span></strong>
        <p>CKA drills passed</p>
      </article>
      <article class="stat-card">
        <span class="stat-icon"><BaseIcon name="timer" :size="19" /></span>
        <strong>{{ progress.state.examAttempts.length }}<span v-if="bestExam !== null"> · {{ bestExam }}%</span></strong>
        <p>Timed simulations</p>
      </article>
    </section>

    <section class="track-progress-section">
      <div class="section-block-heading">
        <div>
          <p class="eyebrow">By certification</p>
          <h2>Two tracks, separate evidence.</h2>
        </div>
        <span class="section-note">Domain completion, not exam scores</span>
      </div>
      <div class="track-progress-grid">
        <article
          v-for="track in trackCards"
          :key="track.id"
          class="track-progress-card"
          :style="{ '--track-accent': track.accent, '--track-ink': track.accentInk }"
        >
          <div class="track-progress-head">
            <span class="code-badge">{{ track.code }}</span>
            <div>
              <h3>{{ track.title }}</h3>
              <p>{{ track.progress.completed }}/{{ track.progress.total }} lessons</p>
            </div>
            <ProgressRing :value="track.progress.percent" :size="58" :stroke="5" color="var(--ink)" />
          </div>
          <div class="domain-progress-list">
            <div v-for="domain in track.domains" :key="domain.id" class="domain-progress-row">
              <div class="domain-progress-label">
                <span><i class="legend-dot" :style="{ background: domain.color }"></i>{{ domain.title }}</span>
                <span>{{ domain.progress.completed }}/{{ domain.progress.total }}</span>
              </div>
              <div class="mini-bar"><span :style="{ width: `${domain.progress.percent}%`, background: domain.color }"></span></div>
            </div>
          </div>
          <RouterLink :to="`/track/${track.id}`" class="aside-link">
            Open the {{ track.code }} track <BaseIcon name="arrowRight" :size="14" />
          </RouterLink>
        </article>
      </div>
    </section>

    <div class="progress-lower-grid">
      <section class="progress-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Recent activity</p>
            <h2>Simulation history.</h2>
          </div>
          <RouterLink to="/exam" class="text-link">All exams <BaseIcon name="arrowRight" :size="14" /></RouterLink>
        </div>
        <div v-if="progress.state.examAttempts.length" class="attempt-table-wrap compact">
          <table class="attempt-table">
            <thead>
              <tr><th scope="col">Exam</th><th scope="col">When</th><th scope="col">Score</th><th scope="col">Target</th></tr>
            </thead>
            <tbody>
              <tr v-for="attempt in progress.state.examAttempts.slice(0, 6)" :key="attempt.id">
                <td><span class="attempt-code">{{ attempt.trackId.toUpperCase() }}</span></td>
                <td>{{ formatDate(attempt.completedAt) }}</td>
                <td><strong>{{ attempt.percent }}%</strong> <span class="muted">{{ attempt.correct }}/{{ attempt.total }}</span></td>
                <td>{{ attempt.practiceTarget }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-inline">
          <BaseIcon name="timer" :size="21" />
          <p>No timed attempts yet. A baseline is a useful place to start.</p>
        </div>
      </section>

      <aside class="progress-side">
        <section class="progress-panel bookmarks-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Saved</p>
              <h2>Bookmarks.</h2>
            </div>
            <span class="section-note">{{ bookmarkedLessons.length }}</span>
          </div>
          <div v-if="bookmarkedLessons.length" class="bookmark-list">
            <RouterLink
              v-for="lesson in bookmarkedLessons"
              :key="lesson.id"
              :to="`/track/${lesson.trackId}/lesson/${lesson.id}`"
              class="bookmark-item"
            >
              <BaseIcon name="bookmark" :size="15" />
              <span><strong>{{ lesson.title }}</strong><small>{{ lesson.trackId.toUpperCase() }} · {{ lesson.minutes }} min</small></span>
            </RouterLink>
          </div>
          <div v-else class="empty-inline small">
            <BaseIcon name="bookmark" :size="19" />
            <p>Bookmark a lesson and it will appear here.</p>
          </div>
        </section>

        <section class="progress-panel reset-panel">
          <p class="eyebrow">Local data</p>
          <h2>Reset the record.</h2>
          <p>This clears completed lessons, quiz answers, drill passes, exam attempts and bookmarks from this browser.</p>
          <button class="button button-danger" type="button" @click="resetOpen = true">
            Reset all progress
          </button>
        </section>
      </aside>
    </div>

    <div v-if="resetOpen" class="modal-overlay" @click.self="resetOpen = false">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="reset-title">
        <span class="modal-icon danger"><BaseIcon name="alert" :size="22" /></span>
        <h2 id="reset-title">Erase all local progress?</h2>
        <p>This cannot be undone. Lessons, quiz answers, drill results, exam attempts and bookmarks will be removed from this browser.</p>
        <div class="modal-actions">
          <button class="button button-quiet" type="button" @click="resetOpen = false">Cancel</button>
          <button class="button button-danger" type="button" @click="resetProgress">Reset everything</button>
        </div>
      </div>
    </div>
  </div>
</template>
