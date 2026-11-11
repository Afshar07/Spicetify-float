import { computed, ref, shallowRef, watch } from 'vue'
import { fetchLyrics } from '../services/lyrics'
import { ELyricsStatus, type ILyrics } from '../types/float'
import { usePlayback } from './usePlayback'

// Remembers the last result so collapsing and expanding does not refetch.
let cache: { uri: string; lyrics: ILyrics | null } | null = null

/** Loads lyrics for the current track and tracks the active line. */
export function useLyrics() {
  const { track, progressMs } = usePlayback()
  const lyrics = shallowRef<ILyrics | null>(null)
  const status = ref<ELyricsStatus>(ELyricsStatus.Idle)

  function apply(result: ILyrics | null): void {
    lyrics.value = result
    if (!result) status.value = ELyricsStatus.Unavailable
    else status.value = result.synced ? ELyricsStatus.Synced : ELyricsStatus.Unsynced
  }

  watch(
    track,
    async (current) => {
      if (!current) {
        lyrics.value = null
        status.value = ELyricsStatus.Idle
        return
      }
      if (cache?.uri === current.uri) {
        apply(cache.lyrics)
        return
      }
      lyrics.value = null
      status.value = ELyricsStatus.Loading
      const result = await fetchLyrics(current)
      cache = { uri: current.uri, lyrics: result }
      // Ignore the answer if the track changed while we were waiting.
      if (track.value?.uri === current.uri) apply(result)
    },
    { immediate: true },
  )

  /** Index of the line being sung, or -1 before the first line / unsynced. */
  const activeIndex = computed(() => {
    const current = lyrics.value
    if (!current?.synced) return -1
    const position = progressMs.value
    for (let index = current.lines.length - 1; index >= 0; index--) {
      if (position >= (current.lines[index]?.startMs ?? Infinity)) return index
    }
    return -1
  })

  return { lyrics, status, activeIndex }
}
