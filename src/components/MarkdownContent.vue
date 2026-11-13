<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  source: { type: String, required: true },
})

const copied = ref(false)

const rendered = computed(() => {
  const html = marked.parse(props.source, { gfm: true, breaks: false })
  return html
    .replace(/<pre>/g, '<div class="code-block"><button type="button" class="copy-code" data-copy>Copy code</button><pre>')
    .replace(/<\/pre>/g, '</pre></div>')
})

async function onClick(event) {
  const button = event.target.closest('[data-copy]')
  if (!button) return
  const code = button.closest('.code-block')?.querySelector('code')
  if (!code) return
  try {
    await navigator.clipboard.writeText(code.textContent)
    copied.value = true
    button.textContent = 'Copied'
    window.setTimeout(() => {
      copied.value = false
      button.textContent = 'Copy code'
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="markdown-body" @click="onClick" v-html="rendered"></div>
</template>
