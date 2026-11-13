<script setup>
import { ref } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  text: { type: String, required: true },
  label: { type: String, default: 'Copy' },
})

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <button class="copy-button" type="button" @click="copy">
    <BaseIcon :name="copied ? 'check' : 'copy'" :size="15" />
    <span>{{ copied ? 'Copied' : label }}</span>
  </button>
</template>
