<script setup lang="ts">
import { ref } from 'vue'
import collapseIcon from '../assets/icons/collapse.svg'
import dimIcon from '../assets/icons/dim.svg'
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
const dimmed = ref(false)
</script>

<template>
  <!-- One DOM order for both layouts; CSS grid places the regions. -->
  <main class="fl-player" :class="[`fl-player--${layout}`, { 'fl-player--dimmed': dimmed }]">
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

    <div class="fl-player__actions">
      <IconButton
        :icon="dimIcon"
        :label="dimmed ? 'Restore brightness' : 'Dim player'"
        :pressed="dimmed"
        :accent="dimmed"
        tip-side="below"
        tip-align="end"
        @click="dimmed = !dimmed"
      />
      <IconButton
        :icon="collapseIcon"
        label="Collapse"
        shortcut="Esc"
        tip-side="below"
        tip-align="end"
        @click="$emit('collapse')"
      />
    </div>

    <LyricsView :layout="layout" />

    <div class="fl-player__transport">
      <SeekBar />
      <TransportControls />
    </div>
  </main>
</template>
