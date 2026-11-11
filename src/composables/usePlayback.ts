import { computed, ref, shallowRef } from 'vue'
import { ERepeatMode, type ITrack } from '../types/float'

const SYNC_INTERVAL_MS = 250
/** "Previous" restarts the track once it is this far in. */
const RESTART_THRESHOLD_MS = 3000

// Shared, module-level state: one Spotify player, one source of truth.
const track = shallowRef<ITrack | null>(null)
const isPlaying = ref(false)
const progressMs = ref(0)
const durationMs = ref(0)
const shuffle = ref(false)
const repeat = ref<ERepeatMode>(ERepeatMode.Off)
const hasTrack = computed(() => track.value !== null)

function toImageUrl(source: string | undefined): string {
  if (!source) return ''
  if (source.startsWith('spotify:image:')) {
    return `https://i.scdn.co/image/${source.slice('spotify:image:'.length)}`
  }
  return /^https?:/.test(source) ? source : ''
}

function readTrack(): ITrack | null {
  const item = Spicetify.Player.data?.item
  if (!item?.uri) return null
  const meta = item.metadata ?? {}
  const artists = (item.artists ?? []).map((artist) => artist.name).filter(Boolean) as string[]
  return {
    uri: item.uri,
    title: item.name ?? meta.title ?? '',
    artist: artists.join(', ') || meta.artist_name || meta.album_title || '',
    primaryArtist: artists[0] ?? meta.artist_name ?? '',
    album: item.album?.name ?? meta.album_title ?? '',
    artworkUrl: toImageUrl(
      meta.image_xlarge_url ?? meta.image_large_url ?? meta.image_url ?? item.images?.[0]?.url,
    ),
    durationMs: item.duration?.milliseconds ?? 0,
  }
}

/** Copies the player's current state into the reactive refs. */
function sync(): void {
  const player = Spicetify.Player
  try {
    const next = readTrack()
    const current = track.value
    if (next?.uri !== current?.uri || next?.artworkUrl !== current?.artworkUrl) track.value = next
    isPlaying.value = !!next && player.isPlaying()
    durationMs.value = next ? player.getDuration() || next.durationMs : 0
    // Always read the player clock; never advance progress on our own timer.
    progressMs.value = next ? Math.min(player.getProgress() || 0, durationMs.value || Infinity) : 0
    shuffle.value = !!player.getShuffle()
    repeat.value = (player.getRepeat() as ERepeatMode) ?? ERepeatMode.Off
  } catch {
    // The player API can be briefly unavailable while Spotify reconnects.
  }
}

let listening = false
let timerWindow: Window | null = null
let timerId = 0

/** Subscribes to player events once, for the lifetime of the extension. */
export function initPlayback(): void {
  if (listening) return
  listening = true
  Spicetify.Player.addEventListener('songchange', sync)
  Spicetify.Player.addEventListener('onplaypause', sync)
  sync()
}

/**
 * Polls the player clock while a FLOAT window is open. The timer belongs to
 * the visible host window, so it is not throttled when Spotify is minimized.
 */
export function startPlaybackSync(hostWindow: Window): void {
  stopPlaybackSync()
  sync()
  timerWindow = hostWindow
  timerId = hostWindow.setInterval(sync, SYNC_INTERVAL_MS)
}

export function stopPlaybackSync(): void {
  timerWindow?.clearInterval(timerId)
  timerWindow = null
}

function seekTo(positionMs: number): void {
  if (!track.value) return
  const clamped = Math.max(0, Math.min(positionMs, durationMs.value))
  Spicetify.Player.seek(clamped)
  progressMs.value = clamped
}

function togglePlay(): void {
  if (!track.value) return
  Spicetify.Player.togglePlay()
}

function next(): void {
  if (track.value) Spicetify.Player.next()
}

function previous(): void {
  if (!track.value) return
  if (Spicetify.Player.getProgress() > RESTART_THRESHOLD_MS) seekTo(0)
  else Spicetify.Player.back()
}

function toggleShuffle(): void {
  Spicetify.Player.toggleShuffle()
  shuffle.value = !shuffle.value
}

function cycleRepeat(): void {
  const nextMode = ((repeat.value + 1) % 3) as ERepeatMode
  Spicetify.Player.setRepeat(nextMode)
  repeat.value = nextMode
}

export function usePlayback() {
  return {
    track,
    hasTrack,
    isPlaying,
    progressMs,
    durationMs,
    shuffle,
    repeat,
    togglePlay,
    next,
    previous,
    seekTo,
    seekBy: (deltaMs: number) => seekTo(Spicetify.Player.getProgress() + deltaMs),
    toggleShuffle,
    cycleRepeat,
  }
}
