<script setup lang="ts">
import collapseIcon from '../assets/icons/collapse.svg'
import { usePlayback } from '../composables/usePlayback'
import type { ELayout } from '../types/float'
import AlbumArtwork from './AlbumArtwork.vue'
import IconButton from './IconButton.vue'
import LyricsView from './LyricsView.vue'
import SeekBar from './SeekBar.vue'
import TransportControls from './TransportControls.vue'

defineProps<{ layout: ELayout }>()
defineEmits<{ collapse: [] }>()

const { track } = usePlayback()
</script>

<template>
  <!-- One DOM order for both layouts; CSS grid places the regions. -->
  <main class="fl-player" :class="`fl-player--${layout}`">
    <p class="fl-player__eyebrow fl-caption">{{ 'Float  /  Now playing' }}</p>

    <div class="fl-player__now">
      <AlbumArtwork />
      <div class="fl-player__meta">
        <h1 class="fl-player__title" :title="track?.title">{{ track?.title || 'Nothing playing' }}</h1>
        <p class="fl-player__artist" :title="track?.artist">
          {{ track ? track.artist : 'Open Spotify to start' }}
        </p>
      </div>
    </div>

    <IconButton
      class="fl-player__collapse"
      :icon="collapseIcon"
      label="Collapse"
      shortcut="Esc"
      tip-side="below"
      tip-align="end"
      @click="$emit('collapse')"
    />

    <LyricsView :layout="layout" />

    <div class="fl-player__transport">
      <SeekBar />
      <TransportControls />
    </div>
  </main>
</template>
