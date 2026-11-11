<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayback } from '../composables/usePlayback'

const { hasTrack, progressMs, durationMs, seekTo } = usePlayback()

/** Position while the user drags; null when following the player clock. */
const dragMs = ref<number | null>(null)
/** Pointer position over the bar (0..1); null when not hovering. */
const hoverRatio = ref<number | null>(null)

const positionMs = computed(() => dragMs.value ?? progressMs.value)
const fillPercent = computed(() =>
  durationMs.value > 0 ? `${(positionMs.value / durationMs.value) * 100}%` : '0%',
)

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}

function onInput(event: Event): void {
  dragMs.value = Number((event.target as HTMLInputElement).value)
}

function onChange(event: Event): void {
  seekTo(Number((event.target as HTMLInputElement).value))
  dragMs.value = null
}

function onPointerMove(event: PointerEvent): void {
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  hoverRatio.value = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
}
</script>

<template>
  <div class="fl-seek">
    <div
      class="fl-seek__target"
      @pointermove="onPointerMove"
      @pointerleave="hoverRatio = null"
    >
      <input
        class="fl-seek__input"
        type="range"
        min="0"
        step="1000"
        :max="durationMs || 1"
        :value="positionMs"
        :disabled="!hasTrack"
        :style="{ '--fl-fill': fillPercent }"
        aria-label="Seek"
        :aria-valuetext="`${formatTime(positionMs)} of ${formatTime(durationMs)}`"
        @input="onInput"
        @change="onChange"
      />
      <span
        v-if="hoverRatio !== null && hasTrack"
        class="fl-seek__bubble"
        :style="{ left: `${hoverRatio * 100}%` }"
        aria-hidden="true"
      >
        {{ formatTime(hoverRatio * durationMs) }}
      </span>
    </div>
    <div class="fl-seek__times" aria-hidden="true">
      <span>{{ formatTime(positionMs) }}</span>
      <span>{{ formatTime(durationMs) }}</span>
    </div>
  </div>
</template>
