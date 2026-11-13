<script setup>
import { computed } from 'vue'
import BaseIcon from '../components/BaseIcon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { tracks } from '../data/tracks'
import { allLessons, getLesson, getTrackLessonCount, getTrackMinutes } from '../data/lessons'
import { kcnaQuestions } from '../data/questions'
import { ckaChallenges } from '../data/challenges'
import { useProgress } from '../lib/progress'

const progress = useProgress()

const trackCards = computed(() =>
  tracks.map((track) => ({
    ...track,
    progress: progress.trackProgress(track.id),
    lessonCount: getTrackLessonCount(track.id),
    minutes: getTrackMinutes(track.id),
    domainRows: track.domains.map((domain) => ({
      ...domain,
      lessons: allLessons.filter(
        (lesson) => lesson.trackId === track.id && lesson.domain === domain.id,
      ).length,
    })),
  })),
)

const nextLesson = computed(() => {
  const last = progress.state.lastLesson
  if (last) {
    const lesson = getLesson(last.lessonId)
    if (lesson) return lesson
  }
  return (
    allLessons.find((lesson) => !progress.isLessonComplete(lesson.id)) ||
    allLessons[0]
  )
})

const nextTrack = computed(() => tracks.find((track) => track.id === nextLesson.value?.trackId))
const overallPercent = computed(() =>
  Math.round((progress.totalCompleted.value / allLessons.length) * 100),
)

const loop = [
  {
    icon: 'bookOpen',
    title: 'Learn the model',
    copy: 'Read a focused lesson, then explain the mechanism in your own words. Every lesson maps to an official domain.',
  },
  {
    icon: 'terminal',
    title: 'Drill the command',
    copy: 'Turn knowledge into muscle memory with command challenges that check the shape of a real kubectl answer.',
  },
  {
    icon: 'timer',
    title: 'Simulate the exam',
    copy: 'Work against the clock: 60 KCNA questions in 90 minutes, or 17 CKA tasks in two hours.',
  },
  {
    icon: 'chart',
    title: 'Review the evidence',
    copy: 'Use domain scores and missed checks to choose the next lesson. Progress is saved in your browser.',
  },
]

const features = [
  {
    icon: 'layers',
    title: '27 exam-mapped lessons',
    copy: 'Twelve KCNA foundations lessons and fifteen CKA operator lessons cover every published competency area.',
  },
  {
    icon: 'target',
    title: '60-question KCNA bank',
    copy: 'Filter by domain, answer with immediate explanations, and track correct answers across sessions.',
  },
  {
    icon: 'terminal',
    title: '17 CKA command drills',
    copy: 'Practise RBAC, kubeadm, rollouts, ingress, network policy, storage and troubleshooting command paths.',
  },
  {
    icon: 'timer',
    title: 'Two timed simulator modes',
    copy: 'A multiple-choice exam engine and a command-based CKA scenario engine, both with review screens.',
  },
  {
    icon: 'zap',
    title: 'Searchable field reference',
    copy: 'A curated kubectl cheat sheet and glossary, searchable from anywhere with ⌘K or Ctrl+K.',
  },
  {
    icon: 'chart',
    title: 'Local progress dashboard',
    copy: 'Completed lessons, quiz answers, mock attempts and bookmarks persist in localStorage — no account needed.',
  },
]

const examFacts = [
  { label: 'Format', kcna: 'Multiple-choice, proctored', cka: 'Performance-based, command line' },
  { label: 'Time', kcna: '90 minutes', cka: '2 hours' },
  { label: 'Scope version', kcna: 'Current CNCF curriculum', cka: 'Kubernetes v1.37' },
  { label: 'Prerequisites', kcna: 'None', cka: 'None' },
  { label: 'Certification validity', kcna: '2 years', cka: '2 years' },
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-dot"></span> KCNA + CKA · independent study system</div>
        <h1>From zero to cluster.<br /><span class="hero-highlight">Built for the exam.</span></h1>
        <p class="hero-lede">
          A structured path through Kubernetes fundamentals and real cluster administration.
          Learn the model, drill the commands, then prove it against the clock.
        </p>
        <div class="hero-actions">
          <RouterLink to="/track/kcna" class="button button-dark">
            Start with KCNA
            <BaseIcon name="arrowRight" :size="17" />
          </RouterLink>
          <RouterLink to="/track/cka" class="button button-quiet">
            I’m here for CKA
            <BaseIcon name="arrowRight" :size="17" />
          </RouterLink>
        </div>
        <div class="hero-proof">
          <span><strong>27</strong> lessons</span>
          <span><strong>{{ kcnaQuestions.length }}</strong> KCNA questions</span>
          <span><strong>{{ ckaChallenges.length }}</strong> CKA drills</span>
          <span><strong>100%</strong> domain coverage</span>
        </div>
      </div>

      <div class="terminal-window hero-terminal" aria-label="D3vex Academy study progress terminal">
        <div class="terminal-chrome">
          <span class="terminal-dots"><i></i><i></i><i></i></span>
          <span class="terminal-title">d3vex — study session</span>
          <span class="terminal-state">live</span>
        </div>
        <div class="terminal-body">
          <p><span class="prompt">$</span> kubectl get targets</p>
          <div class="terminal-table">
            <div class="terminal-row terminal-head">
              <span>NAME</span><span>LEVEL</span><span>PROGRESS</span>
            </div>
            <div class="terminal-row">
              <span>kcna</span><span>foundations</span><span>{{ trackCards[0].progress.percent }}%</span>
            </div>
            <div class="terminal-row">
              <span>cka</span><span>operator</span><span>{{ trackCards[1].progress.percent }}%</span>
            </div>
          </div>
          <p class="terminal-gap"><span class="prompt">$</span> d3vex next</p>
          <p class="terminal-output">
            <span class="terminal-muted">{{ nextTrack?.code }} /</span> {{ nextLesson?.title }}
          </p>
          <div class="terminal-progress">
            <div class="terminal-progress-label">
              <span>Study system progress</span>
              <span>{{ overallPercent }}%</span>
            </div>
            <div class="terminal-progress-bar"><span :style="{ width: `${overallPercent}%` }"></span></div>
          </div>
          <div class="terminal-footer">
            <span><span class="terminal-pulse"></span> progress saved locally</span>
            <span class="terminal-muted">v1.0</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section track-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Two paths, one system</p>
          <h2>Choose your operating level.</h2>
        </div>
        <p class="section-side">
          KCNA builds the mental model. CKA turns it into operational practice. Start where you are;
          the lessons connect.
        </p>
      </div>

      <div class="track-grid">
        <article
          v-for="track in trackCards"
          :key="track.id"
          class="track-card"
          :style="{ '--track-accent': track.accent, '--track-ink': track.accentInk }"
        >
          <div class="track-card-top">
            <span class="code-badge">{{ track.code }}</span>
            <span class="level-pill">{{ track.level }}</span>
            <span class="track-arrow"><BaseIcon name="arrowRight" :size="18" /></span>
          </div>
          <h3>{{ track.title }}</h3>
          <p class="track-tagline">{{ track.tagline }}</p>

          <div class="domain-bars">
            <div v-for="domain in track.domainRows" :key="domain.id" class="domain-bar-row">
              <div class="domain-bar-label">
                <span>{{ domain.title }}</span>
                <span>{{ domain.weight }}%</span>
              </div>
              <div class="domain-bar">
                <span
                  :style="{ width: `${domain.weight}%`, background: domain.color }"
                ></span>
              </div>
              <span class="domain-lesson-count">{{ domain.lessons }} lessons</span>
            </div>
          </div>

          <div class="track-meta">
            <div><span>Lessons</span><strong>{{ track.lessonCount }}</strong></div>
            <div><span>Study time</span><strong>~{{ Math.round(track.minutes / 60) }}h</strong></div>
            <div><span>Exam</span><strong>{{ track.minutes }} min</strong></div>
          </div>

          <div class="track-progress-row">
            <ProgressRing
              :value="track.progress.percent"
              :size="54"
              :stroke="5"
              :color="track.accent === '#ffd36e' ? '#b98500' : '#4d6b00'"
            />
            <div class="track-progress-copy">
              <span>{{ track.progress.completed }} of {{ track.progress.total }} lessons complete</span>
              <span class="muted">{{ track.format }}</span>
            </div>
          </div>

          <RouterLink :to="`/track/${track.id}`" class="track-link">
            Open {{ track.code }} track
            <BaseIcon name="arrowRight" :size="16" />
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="section loop-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">The study loop</p>
          <h2>Knowledge becomes skill here.</h2>
        </div>
        <p class="section-side">
          Reading alone is not exam preparation. Each pass through the loop adds a different kind of
          evidence.
        </p>
      </div>
      <div class="loop-grid">
        <article v-for="(item, index) in loop" :key="item.title" class="loop-card">
          <div class="loop-top">
            <span class="loop-number">0{{ index + 1 }}</span>
            <span class="loop-icon"><BaseIcon :name="item.icon" :size="21" /></span>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.copy }}</p>
        </article>
      </div>
    </section>

    <section class="section features-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Inside the lab</p>
          <h2>Everything is connected to the blueprint.</h2>
        </div>
        <RouterLink to="/resources" class="text-link">
          See official sources <BaseIcon name="arrowRight" :size="15" />
        </RouterLink>
      </div>
      <div class="feature-grid">
        <article v-for="feature in features" :key="feature.title" class="feature-card">
          <span class="feature-icon"><BaseIcon :name="feature.icon" :size="20" /></span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.copy }}</p>
        </article>
      </div>
    </section>

    <section class="section exam-section">
      <div class="exam-panel">
        <div class="exam-panel-copy">
          <p class="eyebrow">Exam facts, without folklore</p>
          <h2>Know exactly what you are preparing for.</h2>
          <p>
            These are the public formats from the Linux Foundation pages and CNCF curricula. This
            platform maps its lessons to those domains; the official pages always govern.
          </p>
          <div class="exam-panel-links">
            <a
              class="text-link"
              href="https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/"
              target="_blank"
              rel="noreferrer"
            >
              KCNA official page <BaseIcon name="external" :size="14" />
            </a>
            <a
              class="text-link"
              href="https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/"
              target="_blank"
              rel="noreferrer"
            >
              CKA official page <BaseIcon name="external" :size="14" />
            </a>
          </div>
        </div>
        <div class="exam-table-wrap">
          <table class="exam-table">
            <thead>
              <tr>
                <th scope="col">Detail</th>
                <th scope="col">KCNA</th>
                <th scope="col">CKA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in examFacts" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td>{{ row.kcna }}</td>
                <td>{{ row.cka }}</td>
              </tr>
            </tbody>
          </table>
          <p class="exam-footnote">
            Practice targets in this app are study benchmarks, not official passing scores.
          </p>
        </div>
      </div>
    </section>

    <section class="section final-cta">
      <div class="final-cta-inner">
        <div>
          <p class="eyebrow">The next 20 minutes</p>
          <h2>Open lesson one. Close the gap.</h2>
          <p>No account, no setup. Your progress stays in this browser.</p>
        </div>
        <div class="final-cta-actions">
          <RouterLink :to="`/track/${nextLesson.trackId}/lesson/${nextLesson.id}`" class="button button-light">
            Resume {{ nextTrack?.code }} <BaseIcon name="arrowRight" :size="17" />
          </RouterLink>
          <RouterLink to="/exam" class="button button-ghost-light">Take a mock exam</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
