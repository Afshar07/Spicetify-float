<script setup lang="ts">
import { computed } from 'vue'

interface IIconButtonProps {
  /** Icon asset URL; painted as a mask so it follows the text color. */
  icon: string
  label: string
  shortcut?: string
  /** Filled background, as on the primary transport control. */
  raised?: boolean
  /** Teal icon: the non-neutral state (pause, shuffle/repeat on). */
  accent?: boolean
  /** Toggle state for screen readers; omit for plain actions. */
  pressed?: boolean
  disabled?: boolean
  /** Use the native tooltip where a custom one would be clipped. */
  nativeTip?: boolean
  tipSide?: 'above' | 'below'
  tipAlign?: 'center' | 'start' | 'end'
}

const props = withDefaults(defineProps<IIconButtonProps>(), {
  shortcut: '',
  pressed: undefined,
  tipSide: 'above',
  tipAlign: 'center',
})

const iconStyle = computed(() => ({ '--fl-icon': `url("${props.icon}")` }))
const nativeTitle = computed(() =>
  props.nativeTip ? [props.label, props.shortcut].filter(Boolean).join(' · ') : undefined,
)
</script>

<template>
  <button
    type="button"
    class="fl-btn"
    :class="{ 'fl-btn--raised': raised, 'fl-btn--accent': accent }"
    :aria-label="label"
    :aria-pressed="pressed"
    :aria-keyshortcuts="shortcut || undefined"
    :title="nativeTitle"
    :disabled="disabled"
  >
    <span class="fl-icon" :style="iconStyle" aria-hidden="true" />
    <slot />
    <span
      v-if="!nativeTip"
      class="fl-tip"
      :class="[`fl-tip--${tipSide}`, `fl-tip--${tipAlign}`]"
      aria-hidden="true"
    >
      <span class="fl-tip__label">{{ label }}</span>
      <span v-if="shortcut" class="fl-tip__key">{{ shortcut }}</span>
    </span>
  </button>
</template>
