<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import SearchDialog from './components/SearchDialog.vue'

const route = useRoute()
const mobileOpen = ref(false)
const searchOpen = ref(false)

function onKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = true
  }
  if (event.key === 'Escape') {
    mobileOpen.value = false
    searchOpen.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

watch(mobileOpen, async (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    document.querySelector('.sidebar-close')?.focus()
  } else {
    document.body.style.overflow = ''
    document.querySelector('.menu-button')?.focus()
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="app-shell">
    <AppSidebar :open="mobileOpen" @close="mobileOpen = false" />
    <div v-if="mobileOpen" class="sidebar-backdrop" @click="mobileOpen = false"></div>

    <div class="app-main">
      <AppHeader
        :menu-open="mobileOpen"
        @open-menu="mobileOpen = true"
        @open-search="searchOpen = true"
      />
      <main id="main-content" class="page-shell">
        <RouterView />
      </main>
      <footer class="site-footer">
        <div>
          <strong>D3vex Academy</strong>
          <span>Independent KCNA + CKA study system for IT students.</span>
        </div>
        <p>
          Kubernetes and Cloud Native Computing Foundation are trademarks of The Linux Foundation.
          This is an independent study resource. Always confirm current exam details on the official
          Linux Foundation and CNCF pages.
        </p>
      </footer>
    </div>
  </div>

  <SearchDialog :open="searchOpen" @close="searchOpen = false" />
</template>
