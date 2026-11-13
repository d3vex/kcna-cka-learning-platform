<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from './BaseIcon.vue'
import { allLessons } from '../data/lessons'
import { cheatGroups, glossary } from '../data/reference'
import { buildSearchIndex, searchEntries } from '../lib/search'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const router = useRouter()
const input = ref(null)
const query = ref('')
const activeIndex = ref(0)
const index = buildSearchIndex(allLessons, cheatGroups, glossary)
const results = computed(() => searchEntries(index, query.value, 10))

watch(
  () => props.open,
  async (open) => {
    if (open) {
      query.value = ''
      activeIndex.value = 0
      document.body.style.overflow = 'hidden'
      await nextTick()
      input.value?.focus()
    } else {
      document.body.style.overflow = ''
    }
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
})

watch(results, () => {
  activeIndex.value = 0
})

function close() {
  emit('close')
  document.querySelector('.search-trigger')?.focus()
}

function choose(entry) {
  if (!entry) return
  router.push(entry.route)
  close()
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (results.value.length) {
      activeIndex.value = (activeIndex.value + 1) % results.value.length
    }
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (results.value.length) {
      activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
    }
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    choose(results.value[activeIndex.value])
  }
}

const suggestions = [
  { label: 'NetworkPolicy', q: 'network policy' },
  { label: 'Rollback', q: 'rollout undo' },
  { label: 'CoreDNS', q: 'CoreDNS' },
  { label: 'PersistentVolumes', q: 'PersistentVolume' },
]

const iconFor = { lesson: 'book', command: 'terminal', term: 'bookOpen' }
const labelFor = { lesson: 'Lesson', command: 'Command', term: 'Glossary' }
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="search-overlay" @click.self="close">
      <section
        class="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        @keydown="onKeydown"
      >
        <h2 id="search-dialog-title" class="sr-only">Search D3vex Academy</h2>
        <div class="search-input-row">
          <BaseIcon name="search" :size="21" />
          <input
            ref="input"
            v-model="query"
            type="search"
            placeholder="Search lessons, glossary terms and kubectl commands…"
            aria-label="Search lessons, glossary terms and kubectl commands"
          />
          <button class="search-escape" type="button" @click="close">ESC</button>
        </div>

        <div v-if="!query" class="search-empty">
          <p class="search-hint-label">Jump back in</p>
          <div class="suggestion-row">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion.q"
              class="suggestion-chip"
              type="button"
              @click="query = suggestion.q"
            >
              {{ suggestion.label }}
            </button>
          </div>
          <div class="search-note">
            <BaseIcon name="spark" :size="17" />
            <span>Try “taint”, “endpointslice”, “HPA” or “kubeadm upgrade”.</span>
          </div>
        </div>

        <div v-else-if="results.length" class="search-results" role="listbox" aria-label="Search results">
          <button
            v-for="(entry, index) in results"
            :key="`${entry.type}-${entry.id}-${index}`"
            class="search-result"
            :class="{ active: index === activeIndex }"
            type="button"
            role="option"
            :aria-selected="index === activeIndex"
            @mouseenter="activeIndex = index"
            @click="choose(entry)"
          >
            <span class="result-icon"><BaseIcon :name="iconFor[entry.type]" :size="17" /></span>
            <span class="result-copy">
              <span class="result-title">{{ entry.title }}</span>
              <span class="result-subtitle">{{ entry.subtitle }}</span>
            </span>
            <span class="result-type">{{ labelFor[entry.type] }}</span>
            <BaseIcon name="arrowRight" :size="16" class="result-arrow" />
          </button>
        </div>

        <div v-else class="search-empty">
          <p class="search-no-results">No matches for “{{ query }}”.</p>
          <p class="search-hint-copy">Try a shorter term, a resource name or a kubectl verb.</p>
        </div>

        <footer class="search-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
