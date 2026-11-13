<script setup>
import { computed, ref } from 'vue'
import BaseIcon from '../components/BaseIcon.vue'
import CopyButton from '../components/CopyButton.vue'
import { officialResources } from '../data/reference'

const filter = ref('All')
const types = computed(() => ['All', ...new Set(officialResources.map((resource) => resource.type))])
const filteredResources = computed(() =>
  filter.value === 'All'
    ? officialResources
    : officialResources.filter((resource) => resource.type === filter.value),
)

const checklist = [
  'Read the current CNCF curriculum PDF, not a summary of it.',
  'Confirm the exam Kubernetes version and exam duration on the official page.',
  'Create a quiet, wired network environment for the proctored exam.',
  'Test your webcam, microphone and ID before exam day.',
  'Know the allowed documentation policy for the exam you are taking.',
  'For CKA, practise switching contexts and namespaces under time pressure.',
  'Prepare a one-page command sheet from memory; then verify it against the docs.',
  'Schedule the exam only when your practice scores are stable, not after one good run.',
]

const weeks = [
  { week: 'Week 1', title: 'Map the territory', copy: 'Read the curriculum, take a baseline simulator, and list the domains you cannot explain.' },
  { week: 'Week 2', title: 'Build the core model', copy: 'KCNA fundamentals or CKA cluster architecture. Run every lab; write a one-sentence summary per lesson.' },
  { week: 'Week 3', title: 'Connect the moving parts', copy: 'Networking, storage, configuration and scheduling. Draw the request path from Pod to Service to Ingress.' },
  { week: 'Week 4', title: 'Operate and break', copy: 'CKA: rollouts, RBAC, kubeadm, network policy. KCNA: delivery, observability and the CNCF landscape.' },
  { week: 'Week 5', title: 'Drill the weak signals', copy: 'Filter practice by your lowest domain. Re-run labs without notes. Explain every wrong answer aloud.' },
  { week: 'Week 6', title: 'Simulate, review, repeat', copy: 'Two full timed simulations with a review day between them. Stop adding new material; close gaps.' },
]
</script>

<template>
  <div class="resources-page">
    <header class="page-header resources-header">
      <div>
        <p class="eyebrow">Source discipline</p>
        <h1>Official sources, not folklore.</h1>
        <p class="page-lede">
          Exam scope changes. The CNCF curriculum and Linux Foundation certification pages are the
          source of truth. Use this page to check the primary material before you trust a study
          guide, including this one.
        </p>
      </div>
      <div class="verified-badge">
        <BaseIcon name="shield" :size="20" />
        <div><strong>Checked November 2026</strong><span>against public Linux Foundation and CNCF pages</span></div>
      </div>
    </header>

    <section class="resources-section">
      <div class="section-block-heading">
        <div>
          <p class="eyebrow">Primary sources</p>
          <h2>Bookmark these first.</h2>
        </div>
        <span class="section-note">{{ filteredResources.length }} resources</span>
      </div>

      <div class="resource-filter" role="group" aria-label="Filter resources">
        <button
          v-for="type in types"
          :key="type"
          type="button"
          class="filter-chip"
          :class="{ active: filter === type }"
          @click="filter = type"
        >
          {{ type }}
        </button>
      </div>

      <div class="resource-grid">
        <a
          v-for="resource in filteredResources"
          :key="resource.title"
          :href="resource.url"
          target="_blank"
          rel="noreferrer"
          class="resource-card"
        >
          <div class="resource-top">
            <span class="resource-type">{{ resource.type }}</span>
            <BaseIcon name="external" :size="16" />
          </div>
          <h2>{{ resource.title }}</h2>
          <p class="resource-publisher">{{ resource.publisher }}</p>
          <p>{{ resource.description }}</p>
          <span class="resource-link">Open source <BaseIcon name="arrowRight" :size="14" /></span>
        </a>
      </div>
    </section>

    <section class="lab-setup-panel">
      <div class="lab-setup-copy">
        <p class="eyebrow">Practice environment</p>
        <h2>Start a disposable cluster.</h2>
        <p>
          Every CKA lab needs a real API server. Use kind locally, minikube if you prefer a VM-backed
          driver, or a browser playground. Create it, use it, delete it.
        </p>
        <div class="lab-setup-links">
          <a class="text-link" href="https://kind.sigs.k8s.io/" target="_blank" rel="noreferrer">
            kind documentation <BaseIcon name="external" :size="14" />
          </a>
          <a class="text-link" href="https://minikube.sigs.k8s.io/docs/start/" target="_blank" rel="noreferrer">
            minikube start guide <BaseIcon name="external" :size="14" />
          </a>
        </div>
      </div>
      <div class="lab-setup-code">
        <div class="lab-setup-code-heading">
          <span>kind — local cluster</span>
          <CopyButton
            text="kind create cluster --name d3vex-lab\nkubectl cluster-info\nkubectl get nodes\n# when finished\nkind delete cluster --name d3vex-lab"
            label="Copy commands"
          />
        </div>
        <pre><code>kind create cluster --name d3vex-lab
kubectl cluster-info
kubectl get nodes
# when finished
kind delete cluster --name d3vex-lab</code></pre>
      </div>
    </section>

    <section class="resources-section">
      <div class="section-block-heading">
        <div>
          <p class="eyebrow">Six-week rhythm</p>
          <h2>A plan you can actually keep.</h2>
        </div>
        <span class="section-note">Adjust hours, keep the loop</span>
      </div>
      <div class="week-grid">
        <article v-for="week in weeks" :key="week.week" class="week-card">
          <span class="week-label">{{ week.week }}</span>
          <h3>{{ week.title }}</h3>
          <p>{{ week.copy }}</p>
        </article>
      </div>
    </section>

    <div class="resources-split">
      <section class="checklist-panel">
        <p class="eyebrow">Exam-day checklist</p>
        <h2>Control what you can control.</h2>
        <ul class="check-list">
          <li v-for="item in checklist" :key="item">
            <span class="check-box"><BaseIcon name="check" :size="13" /></span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>

      <section class="integrity-panel">
        <BaseIcon name="alert" :size="24" />
        <p class="eyebrow">A deliberate boundary</p>
        <h2>What this platform does not do.</h2>
        <ul class="plain-list">
          <li>It does not provide exam dumps, leaked questions or a guaranteed pass.</li>
          <li>It does not replace a live Kubernetes cluster for CKA practice.</li>
          <li>It does not speak for the Linux Foundation or CNCF.</li>
          <li>It does not store your progress on a server; everything is in this browser.</li>
        </ul>
        <p class="integrity-note">
          If an exam detail here disagrees with the official page, the official page wins. Tell your
          future self by correcting your notes, not by memorizing the conflict.
        </p>
      </section>
    </div>

    <section class="disclaimer-panel">
      <strong>Trademark and affiliation note</strong>
      <p>
        Kubernetes and Cloud Native Computing Foundation are trademarks of The Linux Foundation.
        D3vex Academy is an independent educational project and is not affiliated with or endorsed
        by the Linux Foundation, CNCF or any cloud provider.
      </p>
    </section>
  </div>
</template>
