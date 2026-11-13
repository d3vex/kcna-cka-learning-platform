<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseIcon from '../components/BaseIcon.vue'
import CopyButton from '../components/CopyButton.vue'
import { cheatGroups, glossary } from '../data/reference'
import { tracks } from '../data/tracks'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => (route.query.tab === 'glossary' ? 'glossary' : 'cheatsheet'))
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const domainFilter = ref('all')

watch(
  () => route.query.q,
  (query) => {
    if (typeof query === 'string') search.value = query
  },
)

watch(activeTab, () => {
  domainFilter.value = 'all'
})

const domainLabels = computed(() => {
  const labels = {}
  for (const track of tracks) {
    for (const domain of track.domains) {
      labels[domain.id] = domain.title
    }
  }
  return labels
})

function setTab(tab) {
  router.replace({ path: '/reference', query: { tab } })
}

const query = computed(() => search.value.trim().toLowerCase())

const filteredGroups = computed(() =>
  cheatGroups
    .filter((group) => domainFilter.value === 'all' || group.domain === domainFilter.value)
    .map((group) => ({
      ...group,
      commands: group.commands.filter(
        (item) =>
          !query.value ||
          item.cmd.toLowerCase().includes(query.value) ||
          item.note.toLowerCase().includes(query.value) ||
          group.title.toLowerCase().includes(query.value),
      ),
    }))
    .filter((group) => group.commands.length),
)

const commandCount = computed(() => cheatGroups.reduce((sum, group) => sum + group.commands.length, 0))
const visibleCommandCount = computed(() =>
  filteredGroups.value.reduce((sum, group) => sum + group.commands.length, 0),
)

const filteredTerms = computed(() =>
  glossary
    .filter((item) => domainFilter.value === 'all' || item.domain === domainFilter.value)
    .filter(
      (item) =>
        !query.value ||
        item.term.toLowerCase().includes(query.value) ||
        item.definition.toLowerCase().includes(query.value),
    )
    .sort((a, b) => a.term.localeCompare(b.term)),
)

const glossaryDomainOptions = computed(() => {
  const ids = [...new Set(glossary.map((item) => item.domain))]
  return ids.map((id) => ({ id, label: domainLabels.value[id] || id }))
})

const cheatDomainOptions = computed(() => {
  const ids = [...new Set(cheatGroups.map((group) => group.domain))]
  return ids.map((id) => ({ id, label: domainLabels.value[id] || id }))
})
</script>

<template>
  <div class="reference-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Field reference</p>
        <h1>The command surface, close at hand.</h1>
        <p class="page-lede">
          A curated kubectl sheet and a plain-language glossary. Search the whole library, or browse
          by domain. Every command is copyable.
        </p>
      </div>
      <div class="reference-stats">
        <div><strong>{{ commandCount }}</strong><span>commands</span></div>
        <div><strong>{{ glossary.length }}</strong><span>terms</span></div>
      </div>
    </header>

    <div class="segmented-control" role="tablist" aria-label="Reference type">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'cheatsheet'"
        :class="{ active: activeTab === 'cheatsheet' }"
        @click="setTab('cheatsheet')"
      >
        <BaseIcon name="zap" :size="17" /> kubectl cheat sheet
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'glossary'"
        :class="{ active: activeTab === 'glossary' }"
        @click="setTab('glossary')"
      >
        <BaseIcon name="bookOpen" :size="17" /> Glossary
      </button>
    </div>

    <div class="reference-toolbar">
      <div class="search-field">
        <BaseIcon name="search" :size="18" />
        <label class="sr-only" for="reference-search">Search reference</label>
        <input
          id="reference-search"
          v-model="search"
          type="search"
          :placeholder="activeTab === 'cheatsheet' ? 'Search commands or notes…' : 'Search terms or definitions…'"
        />
        <button v-if="search" class="clear-search" type="button" aria-label="Clear search" @click="search = ''">
          <BaseIcon name="close" :size="15" />
        </button>
      </div>
      <label class="sr-only" for="reference-domain">Filter by domain</label>
      <select id="reference-domain" v-model="domainFilter" class="select-input reference-domain">
        <option value="all">All domains</option>
        <option
          v-for="domain in activeTab === 'cheatsheet' ? cheatDomainOptions : glossaryDomainOptions"
          :key="domain.id"
          :value="domain.id"
        >
          {{ domain.label }}
        </option>
      </select>
      <span class="reference-count">
        {{ activeTab === 'cheatsheet' ? `${visibleCommandCount} commands` : `${filteredTerms.length} terms` }}
      </span>
    </div>

    <section v-if="activeTab === 'cheatsheet'" class="cheat-sheet">
      <div v-if="filteredGroups.length" class="cheat-groups">
        <section v-for="group in filteredGroups" :key="group.id" class="cheat-group">
          <header class="cheat-group-header">
            <div>
              <span class="domain-dot" :style="{ background: tracks.flatMap((t) => t.domains).find((d) => d.id === group.domain)?.color }"></span>
              <h2>{{ group.title }}</h2>
            </div>
            <span>{{ group.commands.length }} commands</span>
          </header>
          <div class="command-list">
            <div v-for="item in group.commands" :key="item.cmd" class="command-row">
              <div class="command-code">
                <code>{{ item.cmd }}</code>
              </div>
              <p class="command-note">{{ item.note }}</p>
              <CopyButton :text="item.cmd" />
            </div>
          </div>
        </section>
      </div>
      <div v-else class="empty-card">
        <BaseIcon name="search" :size="25" />
        <h2>No commands match.</h2>
        <p>Try a shorter keyword or clear the domain filter.</p>
      </div>
    </section>

    <section v-else class="glossary-section">
      <div v-if="filteredTerms.length" class="glossary-grid">
        <article v-for="item in filteredTerms" :key="item.term" class="glossary-card">
          <div class="glossary-top">
            <span class="domain-dot" :style="{ background: tracks.flatMap((t) => t.domains).find((d) => d.id === item.domain)?.color }"></span>
            <span>{{ domainLabels[item.domain] || item.domain }}</span>
          </div>
          <h2>{{ item.term }}</h2>
          <p>{{ item.definition }}</p>
        </article>
      </div>
      <div v-else class="empty-card">
        <BaseIcon name="search" :size="25" />
        <h2>No terms match.</h2>
        <p>Try a shorter keyword or clear the domain filter.</p>
      </div>
    </section>
  </div>
</template>
