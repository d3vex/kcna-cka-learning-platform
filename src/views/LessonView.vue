<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from '../components/BaseIcon.vue'
import CopyButton from '../components/CopyButton.vue'
import MarkdownContent from '../components/MarkdownContent.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { getTrack } from '../data/tracks'
import { getLesson, getLessonNeighbors, getLessonsForTrack } from '../data/lessons'
import { useProgress } from '../lib/progress'

const route = useRoute()
const progress = useProgress()

const lesson = computed(() => getLesson(route.params.lessonId))
const track = computed(() => (lesson.value ? getTrack(lesson.value.trackId) : null))
const domain = computed(() =>
  track.value?.domains.find((item) => item.id === lesson.value?.domain),
)
const neighbors = computed(() => getLessonNeighbors(lesson.value?.id))
const trackLessons = computed(() =>
  lesson.value ? getLessonsForTrack(lesson.value.trackId) : [],
)
const lessonIndex = computed(() => {
  const index = trackLessons.value.findIndex((item) => item.id === lesson.value?.id)
  return index >= 0 ? index + 1 : 0
})
const trackProgress = computed(() => progress.trackProgress(lesson.value?.trackId))

const selected = ref(null)
const submitted = ref(false)
const previousAnswer = computed(() =>
  lesson.value ? progress.state.quizAnswers[`checkpoint:${lesson.value.id}`] : null,
)

watch(
  () => lesson.value?.id,
  (id) => {
    selected.value = null
    submitted.value = false
    if (id && lesson.value) {
      progress.setLastLesson(lesson.value.trackId, id)
      document.title = `${lesson.value.title} · D3vex Academy`
    }
  },
  { immediate: true },
)

function submitCheckpoint() {
  if (selected.value === null || !lesson.value) return
  const correct = selected.value === lesson.value.checkpoint.answer
  progress.recordQuizAnswer(`checkpoint:${lesson.value.id}`, selected.value, correct)
  submitted.value = true
}

function resetCheckpoint() {
  if (!lesson.value) return
  selected.value = null
  submitted.value = false
  progress.resetQuizAnswer(`checkpoint:${lesson.value.id}`)
}

function toggleComplete() {
  if (!lesson.value) return
  progress.markLessonComplete(
    lesson.value.id,
    !progress.isLessonComplete(lesson.value.id),
  )
}
</script>

<template>
  <div v-if="lesson && track" class="lesson-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <RouterLink to="/">Overview</RouterLink>
      <BaseIcon name="chevronRight" :size="13" />
      <RouterLink :to="`/track/${track.id}`">{{ track.code }}</RouterLink>
      <BaseIcon name="chevronRight" :size="13" />
      <span>Lesson {{ lessonIndex }}</span>
    </nav>

    <div class="lesson-layout">
      <article class="lesson-main">
        <header class="lesson-header">
          <div class="lesson-kicker">
            <span class="domain-dot" :style="{ background: domain?.color }"></span>
            <span>{{ domain?.title }} · {{ domain?.weight }}% of the exam</span>
          </div>
          <h1>{{ lesson.title }}</h1>
          <p class="lesson-summary">{{ lesson.summary }}</p>
          <div class="lesson-meta">
            <span><BaseIcon name="clock" :size="15" /> {{ lesson.minutes }} min read</span>
            <span><BaseIcon name="bookOpen" :size="15" /> Lesson {{ lessonIndex }} of {{ trackLessons.length }}</span>
            <span v-if="progress.isLessonComplete(lesson.id)" class="complete-meta">
              <BaseIcon name="check" :size="15" /> Complete
            </span>
          </div>
        </header>

        <section class="objectives-card">
          <div class="objectives-heading">
            <BaseIcon name="target" :size="18" />
            <h2>After this lesson, you can</h2>
          </div>
          <ul>
            <li v-for="objective in lesson.objectives" :key="objective">{{ objective }}</li>
          </ul>
        </section>

        <MarkdownContent id="lesson-start" :source="lesson.body" />

        <section v-if="lesson.lab" id="lab" class="lab-card">
          <div class="lab-header">
            <span class="lab-icon"><BaseIcon name="terminal" :size="20" /></span>
            <div>
              <p class="eyebrow">Applied lab</p>
              <h2>{{ lesson.lab.title }}</h2>
            </div>
          </div>
          <p class="lab-goal">{{ lesson.lab.goal }}</p>
          <ol class="lab-steps">
            <li v-for="step in lesson.lab.steps" :key="step">{{ step }}</li>
          </ol>
          <p class="lab-verify"><strong>Verify:</strong> {{ lesson.lab.verify }}</p>
          <div class="lab-solution">
            <div class="lab-solution-heading">
              <span>One working solution</span>
              <CopyButton :text="lesson.lab.solution" label="Copy solution" />
            </div>
            <pre><code>{{ lesson.lab.solution }}</code></pre>
          </div>
        </section>

        <section v-if="lesson.checkpoint" id="checkpoint" class="checkpoint-card">
          <div class="checkpoint-heading">
            <div>
              <p class="eyebrow">Checkpoint</p>
              <h2>Prove the model.</h2>
            </div>
            <span v-if="previousAnswer" class="checkpoint-prior" :class="previousAnswer.correct ? 'good' : 'bad'">
              {{ previousAnswer.correct ? 'Previously correct' : 'Revisit this' }}
            </span>
          </div>
          <p class="checkpoint-question">{{ lesson.checkpoint.question }}</p>
          <div class="checkpoint-options">
            <button
              v-for="(option, index) in lesson.checkpoint.options"
              :key="option"
              type="button"
              class="checkpoint-option"
              :class="{
                selected: selected === index,
                correct: submitted && index === lesson.checkpoint.answer,
                wrong: submitted && selected === index && index !== lesson.checkpoint.answer,
              }"
              :disabled="submitted"
              @click="selected = index"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span>{{ option }}</span>
            </button>
          </div>

          <div v-if="submitted" class="checkpoint-feedback" :class="selected === lesson.checkpoint.answer ? 'good' : 'bad'" role="status">
            <strong>{{ selected === lesson.checkpoint.answer ? 'Correct.' : 'Not quite.' }}</strong>
            <p>{{ lesson.checkpoint.explanation }}</p>
            <button class="text-link" type="button" @click="resetCheckpoint">Try again</button>
          </div>
          <button
            v-else
            class="button button-dark checkpoint-submit"
            type="button"
            :disabled="selected === null"
            @click="submitCheckpoint"
          >
            Check answer <BaseIcon name="check" :size="16" />
          </button>
        </section>

        <div class="lesson-complete-band">
          <div>
            <p class="eyebrow">Lesson checkpoint complete?</p>
            <h2>{{ progress.isLessonComplete(lesson.id) ? 'This lesson is marked complete.' : 'Mark it and keep the loop moving.' }}</h2>
            <p class="muted">Progress is stored in this browser. You can change it at any time.</p>
          </div>
          <button
            class="button"
            :class="progress.isLessonComplete(lesson.id) ? 'button-quiet' : 'button-dark'"
            type="button"
            @click="toggleComplete"
          >
            <BaseIcon :name="progress.isLessonComplete(lesson.id) ? 'rotate' : 'check'" :size="17" />
            {{ progress.isLessonComplete(lesson.id) ? 'Mark incomplete' : 'Mark complete' }}
          </button>
        </div>

        <nav class="lesson-nav" aria-label="Lesson navigation">
          <RouterLink
            v-if="neighbors.previous"
            :to="`/track/${track.id}/lesson/${neighbors.previous.id}`"
            class="lesson-nav-card"
          >
            <BaseIcon name="arrowLeft" :size="17" />
            <span><small>Previous</small><strong>{{ neighbors.previous.title }}</strong></span>
          </RouterLink>
          <span v-else></span>
          <RouterLink
            v-if="neighbors.next"
            :to="`/track/${track.id}/lesson/${neighbors.next.id}`"
            class="lesson-nav-card next"
            @click="progress.markLessonComplete(lesson.id, true)"
          >
            <span><small>Next lesson</small><strong>{{ neighbors.next.title }}</strong></span>
            <BaseIcon name="arrowRight" :size="17" />
          </RouterLink>
        </nav>
      </article>

      <aside class="lesson-aside">
        <div class="aside-card lesson-progress-card">
          <div class="lesson-progress-top">
            <ProgressRing :value="trackProgress.percent" :size="72" :stroke="7" color="var(--ink)" />
            <div>
              <strong>{{ trackProgress.completed }}/{{ trackProgress.total }}</strong>
              <span>{{ track.code }} complete</span>
            </div>
          </div>
          <div class="lesson-side-actions">
            <button class="side-action" type="button" @click="toggleComplete">
              <BaseIcon :name="progress.isLessonComplete(lesson.id) ? 'rotate' : 'check'" :size="16" />
              {{ progress.isLessonComplete(lesson.id) ? 'Mark incomplete' : 'Mark complete' }}
            </button>
            <button class="side-action" type="button" @click="progress.toggleBookmark(lesson.id)">
              <BaseIcon name="bookmark" :size="16" />
              {{ progress.isBookmarked(lesson.id) ? 'Bookmarked' : 'Bookmark lesson' }}
            </button>
          </div>
        </div>

        <div class="aside-card">
          <p class="aside-kicker">On this page</p>
          <ul class="on-this-page">
            <li><a href="#lesson-start">The model</a></li>
            <li v-if="lesson.lab"><a href="#lab">Applied lab</a></li>
            <li v-if="lesson.checkpoint"><a href="#checkpoint">Checkpoint</a></li>
          </ul>
          <div class="aside-divider"></div>
          <p class="aside-kicker">Official mapping</p>
          <p class="aside-copy">{{ domain?.title }} · {{ domain?.weight }}%</p>
          <a :href="track.curriculumUrl" target="_blank" rel="noreferrer" class="aside-link">
            Open CNCF curriculum <BaseIcon name="external" :size="14" />
          </a>
        </div>

        <div class="aside-card lab-note">
          <BaseIcon name="info" :size="18" />
          <div>
            <strong>Use a real cluster</strong>
            <p>Run the lab commands in kind, minikube or a disposable cloud cluster. The simulator checks commands; only a cluster checks reality.</p>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="empty-page">
    <h1>Lesson not found</h1>
    <p>That lesson is not part of the current curriculum.</p>
    <RouterLink to="/" class="button button-dark">Back to overview</RouterLink>
  </div>
</template>
