<script setup lang="ts">
import { usePlayback } from '../composables/usePlayback'

const { track } = usePlayback()
</script>

<template>
  <img
    v-if="track?.artworkUrl"
    class="fl-art"
    :src="track.artworkUrl"
    :alt="track.album ? `Album artwork: ${track.album}` : 'Album artwork'"
    draggable="false"
  />
  <div v-else class="fl-art fl-art--empty" aria-hidden="true" />
</template>
