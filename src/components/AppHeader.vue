<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from './BaseIcon.vue'
import { allLessons } from '../data/lessons'
import { useProgress } from '../lib/progress'

defineProps({
  menuOpen: { type: Boolean, default: false },
})
defineEmits(['open-menu', 'open-search'])

const route = useRoute()
const progress = useProgress()
const totalLessons = allLessons.length

const title = computed(() => route.meta.title || 'Study workspace')
const completed = computed(() => progress.totalCompleted.value)
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <button
        class="icon-button menu-button"
        type="button"
        aria-label="Open navigation"
        aria-controls="primary-navigation"
        :aria-expanded="menuOpen"
        @click="$emit('open-menu')"
      >
        <BaseIcon name="menu" :size="21" />
      </button>
      <div class="topbar-context">
        <span class="topbar-kicker">Study workspace</span>
        <span class="topbar-title">{{ title }}</span>
      </div>
    </div>

    <div class="topbar-actions">
      <button class="search-trigger" type="button" @click="$emit('open-search')">
        <BaseIcon name="search" :size="17" />
        <span>Search lessons, terms, commands</span>
        <kbd>⌘ K</kbd>
      </button>
      <RouterLink to="/progress" class="topbar-progress" aria-label="View study progress">
        <span class="progress-pulse"></span>
        <span>{{ completed }}<span class="muted">/{{ totalLessons }}</span></span>
        <span class="topbar-progress-label">complete</span>
      </RouterLink>
    </div>
  </header>
</template>
