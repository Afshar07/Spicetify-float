<script setup lang="ts">
import expandIcon from '../assets/icons/expand.svg'
import nextIcon from '../assets/icons/next.svg'
import pauseIcon from '../assets/icons/pause.svg'
import playIcon from '../assets/icons/play.svg'
import previousIcon from '../assets/icons/previous.svg'
import { usePlayback } from '../composables/usePlayback'
import IconButton from './IconButton.vue'

defineEmits<{ expand: [] }>()

const { track, hasTrack, isPlaying, togglePlay, next, previous } = usePlayback()
</script>

<template>
  <div
    class="fl-dock"
    role="group"
    aria-label="Playback controls"
    :title="track ? `${track.title} · ${track.artist}` : 'Open Spotify to start'"
  >
    <IconButton :icon="previousIcon" label="Previous" native-tip :disabled="!hasTrack" @click="previous" />
    <IconButton
      :icon="isPlaying ? pauseIcon : playIcon"
      :label="isPlaying ? 'Pause' : 'Play'"
      shortcut="Space"
      native-tip
      :disabled="!hasTrack"
      @click="togglePlay"
    />
    <IconButton :icon="nextIcon" label="Next" native-tip :disabled="!hasTrack" @click="next" />
    <IconButton :icon="expandIcon" label="Expand player" native-tip @click="$emit('expand')" />
  </div>
</template>
