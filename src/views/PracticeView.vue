<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseIcon from '../components/BaseIcon.vue'
import CopyButton from '../components/CopyButton.vue'
import { kcnaQuestions } from '../data/questions'
import { ckaChallenges } from '../data/challenges'
import { getTrack } from '../data/tracks'
import { useProgress } from '../lib/progress'
import { evaluateChallenge } from '../lib/command'

const route = useRoute()
const router = useRouter()
const progress = useProgress()

const activeTab = computed(() => (route.query.tab === 'drills' ? 'drills' : 'questions'))
const kcna = getTrack('kcna')
const cka = getTrack('cka')

function setTab(tab) {
  router.replace({ path: '/practice', query: { ...route.query, tab } })
}

/* Question bank */
const questionDomain = ref('all')
const questionDifficulty = ref('all')
const currentIndex = ref(0)

const filteredQuestions = computed(() =>
  kcnaQuestions.filter(
    (question) =>
      (questionDomain.value === 'all' || question.domain === questionDomain.value) &&
      (questionDifficulty.value === 'all' || question.difficulty === questionDifficulty.value),
  ),
)

watch(
  () => [questionDomain.value, questionDifficulty.value],
  () => {
    currentIndex.value = 0
  },
)

watch(
  () => filteredQuestions.value.length,
  (length) => {
    if (currentIndex.value >= length) currentIndex.value = Math.max(0, length - 1)
  },
)

const currentQuestion = computed(() => filteredQuestions.value[currentIndex.value] || null)
const currentAnswer = computed(() =>
  currentQuestion.value ? progress.state.quizAnswers[currentQuestion.value.id] : null,
)
const allQuizStats = computed(() => progress.quizStats(kcnaQuestions.map((question) => question.id)))

const domainStats = computed(() =>
  kcna.domains.map((domain) => {
    const ids = kcnaQuestions.filter((question) => question.domain === domain.id).map((q) => q.id)
    return { ...domain, stats: progress.quizStats(ids) }
  }),
)

function answerQuestion(index) {
  if (!currentQuestion.value || currentAnswer.value) return
  progress.recordQuizAnswer(
    currentQuestion.value.id,
    index,
    index === currentQuestion.value.answer,
  )
}

function goToQuestion(index) {
  currentIndex.value = index
}

function resetCurrentAnswer() {
  if (!currentQuestion.value) return
  progress.resetQuizAnswer(currentQuestion.value.id)
}

function nextQuestion() {
  if (currentIndex.value < filteredQuestions.value.length - 1) currentIndex.value += 1
}

function previousQuestion() {
  if (currentIndex.value > 0) currentIndex.value -= 1
}

/* Command drills */
const drillDomain = ref('all')
const selectedChallengeId = ref(ckaChallenges[0]?.id || '')
const commandInput = ref('')
const evaluation = ref(null)
const hintOpen = ref(false)
const solutionOpen = ref(false)

const filteredChallenges = computed(() =>
  ckaChallenges.filter(
    (challenge) => drillDomain.value === 'all' || challenge.domain === drillDomain.value,
  ),
)

const selectedChallenge = computed(
  () =>
    filteredChallenges.value.find((challenge) => challenge.id === selectedChallengeId.value) ||
    filteredChallenges.value[0] ||
    null,
)

watch(
  () => filteredChallenges.value.map((challenge) => challenge.id).join(','),
  () => {
    if (!filteredChallenges.value.some((challenge) => challenge.id === selectedChallengeId.value)) {
      selectedChallengeId.value = filteredChallenges.value[0]?.id || ''
    }
  },
)

watch(
  () => selectedChallenge.value?.id,
  () => {
    commandInput.value = ''
    evaluation.value = null
    hintOpen.value = false
    solutionOpen.value = false
  },
)

const passedDrills = computed(
  () => Object.values(progress.state.drillPasses).filter((entry) => entry.passed).length,
)
const selectedPassed = computed(
  () => progress.state.drillPasses[selectedChallenge.value?.id]?.passed || false,
)

function checkDrill() {
  if (!selectedChallenge.value) return
  evaluation.value = evaluateChallenge(commandInput.value, selectedChallenge.value)
  progress.recordDrillPass(selectedChallenge.value.id, evaluation.value.passed)
}

function resetDrill() {
  commandInput.value = ''
  evaluation.value = null
  hintOpen.value = false
  solutionOpen.value = false
}
</script>

<template>
  <div class="practice-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Practice lab</p>
        <h1>Turn recall into usable skill.</h1>
        <p class="page-lede">
          Answer questions with explanations, or type real kubectl commands and check the shape of
          your answer. Every attempt stays on this device.
        </p>
      </div>
      <div class="page-header-stats">
        <div><strong>{{ allQuizStats.answered }}</strong><span>questions answered</span></div>
        <div><strong>{{ passedDrills }}</strong><span>drills passed</span></div>
      </div>
    </header>

    <div class="segmented-control" role="tablist" aria-label="Practice mode">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'questions'"
        :class="{ active: activeTab === 'questions' }"
        @click="setTab('questions')"
      >
        <BaseIcon name="target" :size="17" /> Question bank
        <span class="segment-count">{{ kcnaQuestions.length }}</span>
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'drills'"
        :class="{ active: activeTab === 'drills' }"
        @click="setTab('drills')"
      >
        <BaseIcon name="terminal" :size="17" /> Command drills
        <span class="segment-count">{{ ckaChallenges.length }}</span>
      </button>
    </div>

    <section v-if="activeTab === 'questions'" class="practice-layout">
      <div class="practice-main">
        <div v-if="currentQuestion" class="question-card">
          <div class="question-card-top">
            <div class="question-badges">
              <span class="domain-chip">
                <span
                  class="domain-dot"
                  :style="{ background: kcna.domains.find((d) => d.id === currentQuestion.domain)?.color }"
                ></span>
                {{ kcna.domains.find((d) => d.id === currentQuestion.domain)?.title }}
              </span>
              <span class="difficulty-chip" :class="`difficulty-${currentQuestion.difficulty}`">
                {{ currentQuestion.difficulty }}
              </span>
            </div>
            <span class="question-position">{{ currentIndex + 1 }} / {{ filteredQuestions.length }}</span>
          </div>

          <h2 class="question-text">{{ currentQuestion.question }}</h2>

          <div class="answer-list">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="option"
              type="button"
              class="answer-option"
              :class="{
                selected: currentAnswer?.selected === index,
                correct: currentAnswer && index === currentQuestion.answer,
                wrong:
                  currentAnswer &&
                  currentAnswer.selected === index &&
                  index !== currentQuestion.answer,
              }"
              :disabled="Boolean(currentAnswer)"
              @click="answerQuestion(index)"
            >
              <span class="answer-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span>{{ option }}</span>
              <BaseIcon
                v-if="currentAnswer && index === currentQuestion.answer"
                name="check"
                :size="17"
                class="answer-state-icon"
              />
              <BaseIcon
                v-else-if="currentAnswer && currentAnswer.selected === index"
                name="close"
                :size="17"
                class="answer-state-icon"
              />
            </button>
          </div>

          <div v-if="currentAnswer" class="answer-explanation" :class="currentAnswer.correct ? 'good' : 'bad'" role="status">
            <div class="explanation-heading">
              <strong>{{ currentAnswer.correct ? 'Correct.' : 'Review this one.' }}</strong>
              <span>Answer: {{ String.fromCharCode(65 + currentQuestion.answer) }}</span>
            </div>
            <p>{{ currentQuestion.explanation }}</p>
          </div>

          <div class="question-actions">
            <button class="button button-quiet" type="button" :disabled="currentIndex === 0" @click="previousQuestion">
              <BaseIcon name="arrowLeft" :size="16" /> Previous
            </button>
            <button v-if="currentAnswer" class="text-button" type="button" @click="resetCurrentAnswer">
              <BaseIcon name="rotate" :size="14" /> Reset answer
            </button>
            <button
              class="button button-dark"
              type="button"
              :disabled="currentIndex >= filteredQuestions.length - 1"
              @click="nextQuestion"
            >
              Next question <BaseIcon name="arrowRight" :size="16" />
            </button>
          </div>
        </div>

        <div v-else class="empty-card">
          <BaseIcon name="target" :size="26" />
          <h2>No questions in this filter.</h2>
          <p>Reset the domain or difficulty filter to keep practising.</p>
          <button class="button button-dark" type="button" @click="questionDomain = 'all'; questionDifficulty = 'all'">
            Clear filters
          </button>
        </div>

        <div class="exam-callout">
          <div class="exam-callout-copy">
            <span class="callout-icon"><BaseIcon name="timer" :size="20" /></span>
            <div>
              <strong>Ready for the full 90 minutes?</strong>
              <p>The simulator samples all 60 questions and scores each domain at the end.</p>
            </div>
          </div>
          <RouterLink :to="'/exam/kcna'" class="button button-dark">Start KCNA mock</RouterLink>
        </div>
      </div>

      <aside class="practice-aside">
        <div class="aside-card">
          <div class="aside-card-heading">
            <p class="aside-kicker">Filters</p>
            <button v-if="questionDomain !== 'all' || questionDifficulty !== 'all'" class="text-button" type="button" @click="questionDomain = 'all'; questionDifficulty = 'all'">Clear</button>
          </div>
          <label class="field-label" for="domain-filter">Domain</label>
          <select id="domain-filter" v-model="questionDomain" class="select-input">
            <option value="all">All four domains</option>
            <option v-for="domain in kcna.domains" :key="domain.id" :value="domain.id">
              {{ domain.title }} · {{ domain.weight }}%
            </option>
          </select>

          <label class="field-label" for="difficulty-filter">Difficulty</label>
          <select id="difficulty-filter" v-model="questionDifficulty" class="select-input">
            <option value="all">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <div class="filter-stats">
            <span>{{ filteredQuestions.length }} questions shown</span>
            <span>{{ progress.quizStats(filteredQuestions.map((q) => q.id)).percent }}% correct</span>
          </div>
        </div>

        <div class="aside-card">
          <p class="aside-kicker">Question palette</p>
          <div class="question-palette">
            <button
              v-for="(question, index) in filteredQuestions"
              :key="question.id"
              type="button"
              class="palette-button"
              :class="{
                active: index === currentIndex,
                correct: progress.state.quizAnswers[question.id]?.correct,
                wrong: progress.state.quizAnswers[question.id] && !progress.state.quizAnswers[question.id]?.correct,
              }"
              :aria-label="`Question ${index + 1}${progress.state.quizAnswers[question.id] ? ', answered' : ''}`"
              @click="goToQuestion(index)"
            >
              {{ index + 1 }}
            </button>
          </div>
          <div class="palette-legend">
            <span><i class="legend-dot correct"></i> Correct</span>
            <span><i class="legend-dot wrong"></i> Missed</span>
            <span><i class="legend-dot"></i> Open</span>
          </div>
        </div>

        <div class="aside-card">
          <div class="aside-card-heading">
            <p class="aside-kicker">Domain accuracy</p>
            <span class="muted">{{ allQuizStats.percent }}%</span>
          </div>
          <div class="domain-stat-list">
            <div v-for="domain in domainStats" :key="domain.id" class="domain-stat">
              <div class="domain-stat-label">
                <span><i class="legend-dot" :style="{ background: domain.color }"></i>{{ domain.title }}</span>
                <span>{{ domain.stats.correct }}/{{ domain.stats.answered }}</span>
              </div>
              <div class="mini-bar"><span :style="{ width: `${domain.stats.percent}%`, background: domain.color }"></span></div>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <section v-else class="practice-layout drills-layout">
      <aside class="drill-list-panel">
        <div class="aside-card drill-list-card">
          <p class="aside-kicker">CKA command drills</p>
          <label class="field-label" for="drill-domain">Domain</label>
          <select id="drill-domain" v-model="drillDomain" class="select-input">
            <option value="all">All CKA domains</option>
            <option v-for="domain in cka.domains" :key="domain.id" :value="domain.id">
              {{ domain.title }} · {{ domain.weight }}%
            </option>
          </select>
          <div class="drill-list">
            <button
              v-for="challenge in filteredChallenges"
              :key="challenge.id"
              type="button"
              class="drill-list-item"
              :class="{ active: selectedChallenge?.id === challenge.id }"
              @click="selectedChallengeId = challenge.id"
            >
              <span
                class="drill-status"
                :class="{ passed: progress.state.drillPasses[challenge.id]?.passed }"
              >
                <BaseIcon
                  :name="progress.state.drillPasses[challenge.id]?.passed ? 'check' : 'terminal'"
                  :size="14"
                />
              </span>
              <span class="drill-list-copy">
                <strong>{{ challenge.title }}</strong>
                <small>{{ challenge.minutes }} min · {{ challenge.domain }}</small>
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div v-if="selectedChallenge" class="drill-main">
        <div class="drill-heading">
          <div>
            <div class="question-badges">
              <span class="domain-chip">
                <span class="domain-dot" :style="{ background: cka.domains.find((d) => d.id === selectedChallenge.domain)?.color }"></span>
                {{ cka.domains.find((d) => d.id === selectedChallenge.domain)?.title }}
              </span>
              <span class="difficulty-chip">{{ selectedChallenge.minutes }} min</span>
              <span v-if="selectedPassed" class="passed-chip"><BaseIcon name="check" :size="13" /> Passed before</span>
            </div>
            <h2>{{ selectedChallenge.title }}</h2>
          </div>
          <span class="drill-count">{{ filteredChallenges.findIndex((c) => c.id === selectedChallenge.id) + 1 }} / {{ filteredChallenges.length }}</span>
        </div>

        <p class="drill-brief">{{ selectedChallenge.brief }}</p>

        <div class="terminal-input-card">
          <div class="terminal-chrome">
            <span class="terminal-dots"><i></i><i></i><i></i></span>
            <span class="terminal-title">command-simulator — bash</span>
            <span class="terminal-state">check locally</span>
          </div>
          <div class="terminal-input-body">
            <label class="sr-only" for="drill-command">Your kubectl command</label>
            <div class="command-prompt">
              <span class="prompt">$</span>
              <textarea
                id="drill-command"
                v-model="commandInput"
                rows="4"
                spellcheck="false"
                :placeholder="selectedChallenge.placeholder"
                @keydown.ctrl.enter.prevent="checkDrill"
                @keydown.meta.enter.prevent="checkDrill"
              ></textarea>
            </div>
            <div class="terminal-input-actions">
              <span class="terminal-hint">Ctrl/⌘ + Enter to check</span>
              <button class="button button-dark" type="button" :disabled="!commandInput.trim()" @click="checkDrill">
                Check command <BaseIcon name="terminal" :size="16" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="evaluation" class="check-results" :class="evaluation.passed ? 'good' : 'bad'" role="status">
          <div class="check-results-heading">
            <strong>{{ evaluation.passed ? 'All checks pass.' : 'Not there yet.' }}</strong>
            <span>{{ evaluation.checks.filter((c) => c.pass).length }}/{{ evaluation.checks.length }} checks</span>
          </div>
          <ul>
            <li v-for="check in evaluation.checks" :key="check.label" :class="{ pass: check.pass }">
              <BaseIcon :name="check.pass ? 'check' : 'close'" :size="14" />
              <span>{{ check.label }}</span>
            </li>
          </ul>
          <p v-if="!evaluation.passed" class="check-guidance">
            This trainer checks command shape, not live cluster state. Compare the missing pieces,
            then try again without revealing the solution.
          </p>
        </div>

        <div class="drill-tools">
          <button class="button button-quiet" type="button" @click="hintOpen = !hintOpen">
            <BaseIcon name="spark" :size="16" /> {{ hintOpen ? 'Hide hint' : 'Show hint' }}
          </button>
          <button class="button button-quiet" type="button" @click="solutionOpen = !solutionOpen">
            <BaseIcon name="bookOpen" :size="16" /> {{ solutionOpen ? 'Hide solution' : 'Reveal solution' }}
          </button>
          <button class="text-button" type="button" @click="resetDrill">
            <BaseIcon name="rotate" :size="14" /> Reset
          </button>
        </div>

        <div v-if="hintOpen" class="hint-card">
          <strong>Hint</strong>
          <p>{{ selectedChallenge.hint }}</p>
        </div>

        <div v-if="solutionOpen" class="solution-card">
          <div class="lab-solution-heading">
            <span>Solution and reason</span>
            <CopyButton :text="selectedChallenge.solution" label="Copy solution" />
          </div>
          <pre><code>{{ selectedChallenge.solution }}</code></pre>
          <p>{{ selectedChallenge.explanation }}</p>
        </div>

        <div class="drill-footer-note">
          <BaseIcon name="info" :size="17" />
          <p>
            These drills validate a command pattern. Real CKA success also depends on cluster state,
            context, namespaces, timing and verification. Practise every task in a live cluster.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
