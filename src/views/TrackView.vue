<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from '../components/BaseIcon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { getTrack } from '../data/tracks'
import { getLessonsForTrack, getTrackMinutes } from '../data/lessons'
import { useProgress } from '../lib/progress'

const route = useRoute()
const progress = useProgress()
const track = computed(() => getTrack(route.params.trackId))

const lessons = computed(() => (track.value ? getLessonsForTrack(track.value.id) : []))
const completed = computed(() => progress.trackProgress(track.value?.id))
const totalMinutes = computed(() => (track.value ? getTrackMinutes(track.value.id) : 0))
const nextLesson = computed(
  () => lessons.value.find((lesson) => !progress.isLessonComplete(lesson.id)) || lessons.value[0],
)

const modules = computed(() => {
  if (!track.value) return []
  return track.value.modules.map((module) => {
    const moduleLessons = module.lessonIds
      .map((id) => lessons.value.find((lesson) => lesson.id === id))
      .filter(Boolean)
    const domain = track.value.domains.find((item) => item.id === module.domain)
    const done = moduleLessons.filter((lesson) => progress.isLessonComplete(lesson.id)).length
    return { ...module, lessons: moduleLessons, domain, done }
  })
})

const domains = computed(() => {
  if (!track.value) return []
  return track.value.domains.map((domain) => ({
    ...domain,
    progress: progress.domainProgress(track.value.id, domain.id),
  }))
})

watch(
  track,
  (value) => {
    if (value) document.title = `${value.code} · D3vex Academy`
  },
  { immediate: true },
)

const plan = computed(() => {
  if (!track.value) return []
  const code = track.value.code
  if (code === 'KCNA') {
    return [
      { title: 'Orient', copy: 'Skim the four domains and take the question bank once without studying. Record what feels unfamiliar.' },
      { title: 'Build the model', copy: 'Read the fundamentals lessons in order. Explain each object and control loop before moving on.' },
      { title: 'Connect the system', copy: 'Study orchestration, delivery and architecture. Draw the path from a container to a Service.' },
      { title: 'Drill recall', copy: 'Filter the 60-question bank by domain until you can explain every wrong answer.' },
      { title: 'Simulate', copy: 'Take the 90-minute, 60-question exam in one sitting. Review the domain breakdown.' },
      { title: 'Close gaps', copy: 'Revisit only the weak domains, then retake the simulator. Aim for stable scores, not one lucky run.' },
    ]
  }
  return [
    { title: 'Build a lab', copy: 'Use kind, minikube or a cloud cluster. You need a real API server to practise CKA tasks.' },
    { title: 'Learn the cluster', copy: 'Work through architecture, kubeadm, RBAC and extension points. Break things in the lab.' },
    { title: 'Operate workloads', copy: 'Practise rollouts, config, scheduling, probes and autoscaling until the commands are automatic.' },
    { title: 'Trace traffic', copy: 'Follow Service, DNS, Ingress and NetworkPolicy paths. Test both allowed and denied flows.' },
    { title: 'Troubleshoot', copy: 'Use the layered diagnostic sequence on deliberately broken workloads and nodes.' },
    { title: 'Simulate under time', copy: 'Run the two-hour scenario simulator, then repeat the weak domains on a live cluster.' },
  ]
})
</script>

<template>
  <div v-if="track" class="track-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <RouterLink to="/">Overview</RouterLink>
      <BaseIcon name="chevronRight" :size="13" />
      <span>{{ track.code }}</span>
    </nav>

    <section
      class="track-hero"
      :style="{ '--track-accent': track.accent, '--track-ink': track.accentInk }"
    >
      <div class="track-hero-copy">
        <div class="track-hero-badges">
          <span class="code-badge">{{ track.code }}</span>
          <span class="level-pill">{{ track.level }}</span>
          <span class="hero-version">{{ track.version }}</span>
        </div>
        <h1>{{ track.title }}</h1>
        <p class="track-hero-lede">{{ track.description }}</p>
        <div class="track-hero-actions">
          <RouterLink
            v-if="nextLesson"
            :to="`/track/${track.id}/lesson/${nextLesson.id}`"
            class="button button-dark"
          >
            {{ completed.completed ? 'Continue learning' : 'Start the first lesson' }}
            <BaseIcon name="arrowRight" :size="17" />
          </RouterLink>
          <RouterLink
            :to="{ path: '/exam', hash: `#${track.id}` }"
            class="button button-quiet"
          >
            Exam format <BaseIcon name="timer" :size="16" />
          </RouterLink>
        </div>
      </div>

      <div class="track-hero-progress">
        <ProgressRing :value="completed.percent" :size="122" :stroke="9" color="#f2efe6" track="rgba(255,255,255,.16)" />
        <div class="track-hero-progress-copy">
          <strong>{{ completed.completed }} of {{ completed.total }}</strong>
          <span>lessons complete</span>
          <span class="muted">~{{ Math.round(totalMinutes / 60) }} hours of core reading</span>
        </div>
      </div>

      <div class="track-hero-strip">
        <div><span>Format</span><strong>{{ track.format }}</strong></div>
        <div><span>Exam time</span><strong>{{ track.minutes }} minutes</strong></div>
        <div><span>Practice target</span><strong>{{ track.practiceTarget }}%</strong></div>
        <div><span>Official scope</span><strong>{{ track.version }}</strong></div>
      </div>
    </section>

    <div class="track-layout">
      <div class="track-content">
        <section class="section-block">
          <div class="section-block-heading">
            <div>
              <p class="eyebrow">Exam blueprint</p>
              <h2>Where the marks live.</h2>
            </div>
            <span class="section-note">Published domain weights</span>
          </div>
          <div class="blueprint-grid" :class="{ 'is-five': domains.length === 5 }">
            <article v-for="domain in domains" :key="domain.id" class="blueprint-card">
              <div class="blueprint-top">
                <span class="domain-dot" :style="{ background: domain.color }"></span>
                <span class="blueprint-weight">{{ domain.weight }}%</span>
              </div>
              <h3>{{ domain.title }}</h3>
              <p>{{ domain.summary }}</p>
              <div class="blueprint-footer">
                <span>{{ domain.progress.completed }}/{{ domain.progress.total }} lessons</span>
                <div class="mini-bar"><span :style="{ width: `${domain.progress.percent}%`, background: domain.color }"></span></div>
              </div>
            </article>
          </div>
        </section>

        <section class="section-block">
          <div class="section-block-heading">
            <div>
              <p class="eyebrow">Curriculum</p>
              <h2>{{ modules.length }} modules. One operating model.</h2>
            </div>
            <span class="section-note">{{ lessons.length }} lessons · {{ totalMinutes }} min</span>
          </div>

          <div class="module-list">
            <section v-for="(module, index) in modules" :key="module.id" class="module-card">
              <header class="module-header">
                <div class="module-index">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="module-title">
                  <div class="module-kicker">
                    <span class="domain-dot" :style="{ background: module.domain?.color }"></span>
                    <span>{{ module.domain?.title }} · {{ module.domain?.weight }}%</span>
                  </div>
                  <h3>{{ module.title }}</h3>
                  <p>{{ module.summary }}</p>
                </div>
                <span class="module-count">{{ module.done }}/{{ module.lessons.length }}</span>
              </header>

              <div class="lesson-list">
                <RouterLink
                  v-for="lesson in module.lessons"
                  :key="lesson.id"
                  :to="`/track/${track.id}/lesson/${lesson.id}`"
                  class="lesson-row"
                  :class="{ complete: progress.isLessonComplete(lesson.id) }"
                >
                  <span class="lesson-state">
                    <BaseIcon
                      :name="progress.isLessonComplete(lesson.id) ? 'check' : 'play'"
                      :size="15"
                    />
                  </span>
                  <span class="lesson-copy">
                    <span class="lesson-title">{{ lesson.title }}</span>
                    <span class="lesson-summary">{{ lesson.summary }}</span>
                  </span>
                  <span class="lesson-time"><BaseIcon name="clock" :size="14" /> {{ lesson.minutes }} min</span>
                  <BaseIcon name="arrowRight" :size="16" class="lesson-arrow" />
                </RouterLink>
              </div>
            </section>
          </div>
        </section>

        <section class="section-block">
          <div class="section-block-heading">
            <div>
              <p class="eyebrow">Study sequence</p>
              <h2>A realistic way through.</h2>
            </div>
            <span class="section-note">Adapt the pace, keep the order</span>
          </div>
          <ol class="plan-list">
            <li v-for="(step, index) in plan" :key="step.title">
              <span class="plan-number">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.copy }}</p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <aside class="track-aside">
        <div class="aside-card sticky-card">
          <p class="aside-kicker">Exam snapshot</p>
          <dl class="fact-list">
            <div><dt>Credential</dt><dd>{{ track.code }}</dd></div>
            <div><dt>Level</dt><dd>{{ track.level }}</dd></div>
            <div><dt>Format</dt><dd>{{ track.format }}</dd></div>
            <div><dt>Duration</dt><dd>{{ track.minutes }} minutes</dd></div>
            <div><dt>Scope</dt><dd>{{ track.version }}</dd></div>
            <div><dt>Validity</dt><dd>2 years</dd></div>
          </dl>
          <a
            :href="track.officialUrl"
            target="_blank"
            rel="noreferrer"
            class="aside-link"
          >
            Official exam page <BaseIcon name="external" :size="14" />
          </a>
          <a
            :href="track.curriculumUrl"
            target="_blank"
            rel="noreferrer"
            class="aside-link"
          >
            CNCF curriculum PDF <BaseIcon name="external" :size="14" />
          </a>
          <p class="aside-disclaimer">
            Practice target is a study benchmark, not an official passing score. Confirm every detail
            on the official pages.
          </p>
        </div>

        <div class="aside-card">
          <p class="aside-kicker">Recommended next</p>
          <RouterLink v-if="nextLesson" :to="`/track/${track.id}/lesson/${nextLesson.id}`" class="next-card">
            <span class="next-card-icon"><BaseIcon name="bookOpen" :size="18" /></span>
            <span>
              <strong>{{ nextLesson.title }}</strong>
              <small>{{ nextLesson.minutes }} min · {{ nextLesson.domain }}</small>
            </span>
          </RouterLink>
          <RouterLink
            :to="{ path: '/practice', query: { tab: track.id === 'cka' ? 'drills' : 'questions' } }"
            class="aside-link"
          >
            {{ track.id === 'cka' ? 'Open command drills' : 'Open the question bank' }}
            <BaseIcon name="arrowRight" :size="14" />
          </RouterLink>
          <RouterLink :to="`/exam/${track.id}`" class="aside-link">
            Start a mock exam <BaseIcon name="timer" :size="14" />
          </RouterLink>
        </div>

        <div class="aside-card lab-note">
          <BaseIcon name="terminal" :size="19" />
          <div>
            <strong>{{ track.id === 'cka' ? 'A real cluster is required' : 'Labs are encouraged' }}</strong>
            <p v-if="track.id === 'cka'">
              This platform trains command shape and decision-making. CKA readiness also requires
              repeated practice on a live cluster.
            </p>
            <p v-else>
              Use kind or minikube for the lab steps. Reading commands without running them leaves a
              dangerous confidence gap.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="empty-page">
    <h1>Track not found</h1>
    <p>That certification track does not exist in this study system.</p>
    <RouterLink to="/" class="button button-dark">Back to overview</RouterLink>
  </div>
</template>
