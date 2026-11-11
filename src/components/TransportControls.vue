<script setup lang="ts">
import { computed } from 'vue'
import nextIcon from '../assets/icons/next.svg'
import pauseIcon from '../assets/icons/pause.svg'
import playIcon from '../assets/icons/play.svg'
import previousIcon from '../assets/icons/previous.svg'
import repeatIcon from '../assets/icons/repeat.svg'
import shuffleIcon from '../assets/icons/shuffle.svg'
import { usePlayback } from '../composables/usePlayback'
import { ERepeatMode } from '../types/float'
import IconButton from './IconButton.vue'

const {
  hasTrack,
  isPlaying,
  shuffle,
  repeat,
  togglePlay,
  next,
  previous,
  toggleShuffle,
  cycleRepeat,
} = usePlayback()

const repeatLabel = computed(() => {
  if (repeat.value === ERepeatMode.Track) return 'Repeat: this track'
  return repeat.value === ERepeatMode.Context ? 'Repeat: on' : 'Repeat'
})
</script>

<template>
  <div class="fl-controls" role="group" aria-label="Playback controls">
    <IconButton
      :icon="shuffleIcon"
      :label="shuffle ? 'Shuffle: on' : 'Shuffle'"
      tip-align="start"
      :raised="shuffle"
      :accent="shuffle"
      :pressed="shuffle"
      :disabled="!hasTrack"
      @click="toggleShuffle"
    />
    <IconButton :icon="previousIcon" label="Previous" :disabled="!hasTrack" @click="previous" />
    <IconButton
      :icon="isPlaying ? pauseIcon : playIcon"
      :label="isPlaying ? 'Pause' : 'Play'"
      shortcut="Space"
      raised
      :accent="isPlaying"
      :disabled="!hasTrack"
      @click="togglePlay"
    />
    <IconButton :icon="nextIcon" label="Next" :disabled="!hasTrack" @click="next" />
    <IconButton
      :icon="repeatIcon"
      :label="repeatLabel"
      tip-align="end"
      :raised="repeat !== ERepeatMode.Off"
      :accent="repeat !== ERepeatMode.Off"
      :pressed="repeat !== ERepeatMode.Off"
      :disabled="!hasTrack"
      @click="cycleRepeat"
    >
      <span v-if="repeat === ERepeatMode.Track" class="fl-btn__badge" aria-hidden="true">1</span>
    </IconButton>
  </div>
</template>
