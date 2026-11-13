<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from './BaseIcon.vue'
import { tracks } from '../data/tracks'
import { getTrackLessonCount } from '../data/lessons'
import { useProgress } from '../lib/progress'

const props = defineProps({
  open: { type: Boolean, default: false },
})
defineEmits(['close'])

const route = useRoute()
const progress = useProgress()
const isMobile = ref(false)
const hidden = computed(() => isMobile.value && !props.open)
let mediaQuery = null

function syncViewport(event) {
  isMobile.value = event.matches
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 960px)')
  isMobile.value = mediaQuery.matches
  mediaQuery.addEventListener('change', syncViewport)
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', syncViewport)
})

const groups = [
  {
    label: 'Learn',
    items: [
      { label: 'Overview', icon: 'home', path: '/' },
      {
        label: 'KCNA foundations',
        icon: 'book',
        path: '/track/kcna',
        meta: `${getTrackLessonCount('kcna')} lessons`,
      },
      {
        label: 'CKA operator',
        icon: 'layers',
        path: '/track/cka',
        meta: `${getTrackLessonCount('cka')} lessons`,
      },
      { label: 'My progress', icon: 'chart', path: '/progress' },
    ],
  },
  {
    label: 'Practice',
    items: [
      {
        label: 'Question bank',
        icon: 'target',
        path: '/practice',
        tab: 'questions',
        meta: '60 questions',
      },
      {
        label: 'Command drills',
        icon: 'terminal',
        path: '/practice',
        tab: 'drills',
        meta: '17 tasks',
      },
      { label: 'Mock exams', icon: 'timer', path: '/exam' },
    ],
  },
  {
    label: 'Library',
    items: [
      {
        label: 'Cheat sheet',
        icon: 'zap',
        path: '/reference',
        tab: 'cheatsheet',
      },
      {
        label: 'Glossary',
        icon: 'bookOpen',
        path: '/reference',
        tab: 'glossary',
      },
      { label: 'Official resources', icon: 'external', path: '/resources' },
    ],
  },
]

function itemActive(item) {
  if (item.path === '/') return route.path === '/'
  if (item.tab) {
    return route.path === item.path && (route.query.tab || 'questions') === item.tab
  }
  return route.path === item.path || route.path.startsWith(`${item.path}/`)
}

const trackProgress = computed(() =>
  tracks.map((track) => ({
    ...track,
    progress: progress.trackProgress(track.id),
  })),
)
</script>

<template>
  <aside
    id="primary-navigation"
    class="sidebar"
    :class="{ 'is-open': open }"
    :inert="hidden || undefined"
    :aria-hidden="hidden ? 'true' : undefined"
    aria-label="Primary navigation"
  >
    <RouterLink to="/" class="brand" @click="$emit('close')">
      <span class="brand-mark">
        <BaseIcon name="route" :size="22" :stroke-width="2" />
      </span>
      <span class="brand-copy">
        <strong>D3vex</strong>
        <small>academy</small>
      </span>
    </RouterLink>

    <button class="sidebar-close" type="button" aria-label="Close navigation" @click="$emit('close')">
      <BaseIcon name="close" :size="20" />
    </button>

    <nav class="sidebar-nav">
      <div v-for="group in groups" :key="group.label" class="nav-group">
        <p class="nav-label">{{ group.label }}</p>
        <RouterLink
          v-for="item in group.items"
          :key="`${item.label}-${item.tab || ''}`"
          :to="item.tab ? { path: item.path, query: { tab: item.tab } } : item.path"
          class="nav-item"
          :class="{ active: itemActive(item) }"
          @click="$emit('close')"
        >
          <BaseIcon :name="item.icon" :size="18" />
          <span class="nav-copy">
            <span>{{ item.label }}</span>
            <small v-if="item.meta">{{ item.meta }}</small>
          </span>
          <span v-if="itemActive(item)" class="nav-active-dot" aria-hidden="true"></span>
        </RouterLink>
      </div>
    </nav>

    <div class="sidebar-targets">
      <div class="targets-heading">
        <span>Exam targets</span>
        <span class="status-live"><span class="status-dot"></span> 2026</span>
      </div>
      <RouterLink
        v-for="track in trackProgress"
        :key="track.id"
        :to="`/track/${track.id}`"
        class="target-row"
        @click="$emit('close')"
      >
        <span class="target-code" :style="{ background: track.accent, color: track.accentInk }">
          {{ track.code }}
        </span>
        <span class="target-track">
          <span class="target-line">
            <span>{{ track.progress.percent }}%</span>
            <span>{{ track.progress.completed }}/{{ track.progress.total }}</span>
          </span>
          <span class="target-bar"><span :style="{ width: `${track.progress.percent}%` }"></span></span>
        </span>
      </RouterLink>
      <p class="targets-note">Mapped to the public CNCF curricula.</p>
    </div>
  </aside>
</template>
