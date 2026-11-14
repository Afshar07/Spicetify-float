# Playback and transport

## Source map

- `src/composables/usePlayback.ts`: shared module-level refs, metadata mapping,
  player event subscriptions, polling, and transport actions.
- `src/main.ts`: initializes subscriptions once and starts/stops host polling.
- `src/components/TransportControls.vue`, `CompactDock.vue`, `SeekBar.vue`,
  `FloatApp.vue`: transport consumers and shortcuts.
- Contracts: `src/types/float.ts` and `src/types/spicetify.d.ts`.

## Behavior to preserve

- There is one Spotify player and one shared reactive state, not independent
  state for each component.
- Initialization listens to `songchange` and `onplaypause` for extension lifetime.
  A 250 ms interval runs only while FLOAT is open, on the host window.
- Progress comes from `Spicetify.Player.getProgress()`, not a synthetic counter.
  Synchronization tolerates transient player API failures.
- Metadata comes from `Player.data.item` with metadata fallbacks. Artwork accepts
  HTTP(S) URLs or converts `spotify:image:` to `https://i.scdn.co/image/…`.
- Playback actions use `Spicetify.Player`. Seeking clamps to track duration.
- Previous restarts the track when progress is greater than 3 s; otherwise it
  calls `back()`. Repeat cycles Off (0), Context (1), Track (2).
- The seek bar previews drag position locally and commits via `seekTo` on change;
  range steps are 1 s. Keyboard shortcuts seek by 5 s.
- Closing the UI must never pause playback or clear the Spotify queue.

## Verification

Run typechecking for changed code, then check no-track state, play/pause,
next/previous around the restart threshold, seek bounds, shuffle/repeat, track
changes, and progress while Spotify is minimized. Confirm closing FLOAT stops
its polling without interrupting audio. Runtime declarations alone cannot
verify compatibility with a particular Spotify/Spicetify version.
