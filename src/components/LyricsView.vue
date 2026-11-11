<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useLyrics } from '../composables/useLyrics'
import { usePlayback } from '../composables/usePlayback'
import { ELayout, ELyricsStatus } from '../types/float'

const props = defineProps<{ layout: ELayout }>()

const { track, seekTo } = usePlayback()
const { lyrics, status, activeIndex } = useLyrics()

const scroller = ref<HTMLElement | null>(null)
/** False while the user scrolls by hand; the view stops following the song. */
const following = ref(true)

const isSynced = computed(() => status.value === ELyricsStatus.Synced)

const message = computed(() => {
  switch (status.value) {
    case ELyricsStatus.Idle:
      return 'Play something to see its lyrics.'
    case ELyricsStatus.Loading:
      return 'Finding lyrics…'
    case ELyricsStatus.Unavailable:
      return 'Lyrics aren’t available for this track.'
    default:
      return ''
  }
})

const footnote = computed(() => {
  if (isSynced.value) return 'Synced to playback'
  return status.value === ELyricsStatus.Unsynced ? 'These lyrics aren’t time-synced' : ''
})

function lineClass(index: number): string {
  if (!isSynced.value) return 'is-near'
  const distance = Math.abs(index - Math.max(activeIndex.value, 0))
  if (index === activeIndex.value) return 'is-current'
  return distance <= 1 ? 'is-near' : ''
}

function prefersReducedMotion(): boolean {
  const view = scroller.value?.ownerDocument.defaultView
  return !!view?.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Keeps the current line vertically centered in the lyric viewport. */
function centerActiveLine(smooth: boolean): void {
  const container = scroller.value
  if (!container) return
  const line = container.querySelector<HTMLElement>('[data-current]')
  const top = line ? line.offsetTop - (container.clientHeight - line.offsetHeight) / 2 : 0
  container.scrollTo({ top, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' })
}

function pauseFollowing(): void {
  if (isSynced.value) following.value = false
}

function resumeFollowing(): void {
  following.value = true
  centerActiveLine(true)
}

function onScrollKey(event: KeyboardEvent): void {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) pauseFollowing()
}

function selectLine(startMs: number): void {
  if (!isSynced.value) return
  seekTo(startMs)
  following.value = true
}

watch(activeIndex, () => {
  if (following.value) centerActiveLine(true)
}, { flush: 'post' })

// New lyrics or a different layout: jump straight to the right place.
watch([lyrics, () => props.layout], async () => {
  following.value = true
  await nextTick()
  centerActiveLine(false)
}, { flush: 'post' })

onMounted(() => centerActiveLine(false))
</script>

<template>
  <section class="fl-lyrics" aria-label="Lyrics">
    <header class="fl-lyrics__head">
      <span class="fl-caption">Lyrics</span>
      <template v-if="isSynced">
        <span v-if="following" class="fl-lyrics__live">Live</span>
        <button v-else type="button" class="fl-lyrics__resume" @click="resumeFollowing">
          Resume live
        </button>
      </template>
    </header>

    <div
      v-if="lyrics"
      ref="scroller"
      class="fl-lyrics__scroll"
      tabindex="0"
      :aria-label="track ? `Lyrics for ${track.title}` : 'Lyrics'"
      @wheel.passive="pauseFollowing"
      @touchmove.passive="pauseFollowing"
      @keydown="onScrollKey"
    >
      <ol class="fl-lyrics__lines">
        <li
          v-for="(line, index) in lyrics.lines"
          :key="index"
          :data-current="index === activeIndex ? '' : undefined"
        >
          <button
            type="button"
            class="fl-line"
            :class="lineClass(index)"
            tabindex="-1"
            :disabled="!isSynced"
            :aria-current="index === activeIndex ? 'true' : undefined"
            @click="selectLine(line.startMs)"
          >
            {{ line.text || '♪' }}
          </button>
        </li>
      </ol>
    </div>
    <p v-else class="fl-lyrics__message" role="status">{{ message }}</p>

    <p class="fl-lyrics__foot">{{ footnote }}</p>
  </section>
</template>
