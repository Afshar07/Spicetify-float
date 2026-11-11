<script setup lang="ts">
import expandIcon from '../assets/icons/expand.svg'
import nextIcon from '../assets/icons/next.svg'
import pauseIcon from '../assets/icons/pause.svg'
import playIcon from '../assets/icons/play.svg'
import previousIcon from '../assets/icons/previous.svg'
import { usePlayback } from '../composables/usePlayback'
import AlbumArtwork from './AlbumArtwork.vue'
import IconButton from './IconButton.vue'

defineEmits<{ expand: [] }>()

const { track, hasTrack, isPlaying, togglePlay, next, previous } = usePlayback()
</script>

<template>
  <div
    class="fl-dock"
    :class="{ 'is-idle': !hasTrack }"
    role="group"
    aria-label="Playback controls"
    :title="track ? `${track.title} · ${track.artist}` : 'Open Spotify to start'"
  >
    <AlbumArtwork />
    <IconButton :icon="previousIcon" label="Previous" native-tip :disabled="!hasTrack" @click="previous" />
    <IconButton
      :icon="isPlaying ? pauseIcon : playIcon"
      :label="isPlaying ? 'Pause' : 'Play'"
      shortcut="Space"
      raised
      native-tip
      :accent="isPlaying"
      :disabled="!hasTrack"
      @click="togglePlay"
    />
    <IconButton :icon="nextIcon" label="Next" native-tip :disabled="!hasTrack" @click="next" />
    <span class="fl-dock__divider" aria-hidden="true" />
    <IconButton :icon="expandIcon" label="Expand player" native-tip @click="$emit('expand')" />
    <span v-if="isPlaying" class="fl-dock__indicator" aria-hidden="true" />
  </div>
</template>
