<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useLayout } from '../composables/useLayout'
import { usePlayback } from '../composables/usePlayback'
import { EHostKind, ELayout, type IFloatHost } from '../types/float'
import CompactDock from './CompactDock.vue'
import ExpandedPlayer from './ExpandedPlayer.vue'

const SEEK_STEP_MS = 5000

const props = defineProps<{ host: IFloatHost }>()

const { layout, expand, collapse } = useLayout(props.host)
const { togglePlay, seekBy } = usePlayback()

// In PiP the whole window is ours; inline, only keys pressed inside the dock.
const keyTarget: Window | HTMLElement =
  props.host.kind === EHostKind.Pip ? props.host.window : props.host.root

function onKeydown(event: Event): void {
  const key = event as KeyboardEvent
  if (key.defaultPrevented || key.ctrlKey || key.metaKey || key.altKey) return

  // Never take keys away from text entry or the browser.
  const target = key.target as HTMLElement | null
  const tag = target?.tagName ?? ''
  const isRange = tag === 'INPUT' && (target as HTMLInputElement).type === 'range'
  if (target?.isContentEditable || tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !isRange)) {
    return
  }

  switch (key.key) {
    case ' ':
      // Space on a focused button keeps its native meaning: activate it.
      if (tag === 'BUTTON') return
      togglePlay()
      break
    case 'ArrowLeft':
      seekBy(-SEEK_STEP_MS)
      break
    case 'ArrowRight':
      seekBy(SEEK_STEP_MS)
      break
    case 'Escape':
      if (layout.value === ELayout.Compact) return
      collapse()
      break
    default:
      return
  }
  key.preventDefault()
}

onMounted(() => keyTarget.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => keyTarget.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="fl-app" :class="`fl-app--${layout}`">
    <CompactDock v-if="layout === ELayout.Compact" @expand="expand" />
    <ExpandedPlayer v-else :layout="layout" @collapse="collapse" />
  </div>
</template>
