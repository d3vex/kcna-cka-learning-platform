<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: Number, default: 88 },
  stroke: { type: Number, default: 7 },
  color: { type: String, default: 'var(--ink)' },
  track: { type: String, default: 'var(--line)' },
  label: { type: String, default: '' },
})

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(
  () => circumference.value - (Math.min(100, Math.max(0, props.value)) / 100) * circumference.value,
)
</script>

<template>
  <div class="progress-ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="track"
        :stroke-width="stroke"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        class="ring-value"
      />
    </svg>
    <span class="progress-ring-label" :aria-label="`${value}% ${label}`.trim()">{{ value }}%</span>
  </div>
</template>
