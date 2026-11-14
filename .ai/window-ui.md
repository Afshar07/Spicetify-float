# Window lifecycle and UI

## Source map

- `src/main.ts`: waits for Spicetify, initializes playback, registers the
  top-bar button and Ctrl+M, opens one host, mounts Vue, and cleans up on close.
- `src/services/host.ts`: `IFloatHost` implementations for PiP and inline mode.
- `src/services/prefs.ts`: storage validation, sizes, and layout thresholds.
- `src/composables/useLayout.ts`: observes real root size and persists view/size.
- `src/components/FloatApp.vue`: compact/expanded switch and playback shortcuts.
- `src/components/CompactDock.vue`, `ExpandedPlayer.vue`: top-level layouts.
- `src/components/IconButton.vue`, `TransportControls.vue`, `SeekBar.vue`,
  `AlbumArtwork.vue`: reusable controls and artwork.
- `src/styles/float.css`: shared styles; `src/assets/icons/`: SVG assets.

## Contracts

- Read `src/types/float.ts` before changing the host or layout interface.
- PiP opening requires a user gesture. An opening guard prevents duplicate
  concurrent requests. Failures fall back to an inline bottom-right host.
- The host exposes its owning `window`, `root`, compact size, resize request,
  close operation, and close subscription.
- Mounting starts the host-owned playback polling timer. Closing stops it and
  unmounts Vue. PiP cleanup uses `pagehide`; inline close removes its DOM/style.
- A PiP window has browser-owned chrome and may clamp or ignore resize requests.
  `resize` accepts content dimensions and adjusts for native chrome. The service
  retries the initial requested size after 150 ms.
- Compact requested viewport: PiP 272 × 84; inline 136 × 36.
  Expanded default: 760 × 436. Expanded minimum: 300 × 280.
  Wide starts at 640 px; smaller eligible widths use narrow layout.
- `float:prefs` stores `{ view, expanded: { width, height } }` in localStorage.
  Invalid/unavailable storage falls back to compact with default expanded size.
- Only valid expanded PiP dimensions are remembered, with a 300 ms debounce
  after a 1 s opening settlement period. Collapsing cancels pending size saves.
- Expanded UI uses one DOM order for both wide and narrow CSS layouts.
  Lyrics mount only in the expanded player.
- Styles and the Latin Inter font are injected into each host. Do not rely on
  Spotify styles being available in PiP or leak global selectors into Spotify.

## Interaction and verification

- Ctrl+M toggles FLOAT from Spotify or the PiP window; it is not system-wide.
- Within FLOAT: Space toggles playback, left/right seek ±5 s, Escape collapses.
  Preserve text-entry exclusions and native Space activation on buttons.
- Expanded player has a manual Dim player / Restore brightness toggle beside
  Collapse. It fades content to 40% opacity without changing playback, lyric
  following, or native window opacity. Header actions remain fully visible.
  Dimming is component-local and resets on collapse or close; no idle timer or
  persisted preference is used.
- Implementation: `ExpandedPlayer.vue` owns the `dimmed` ref and
  `.fl-player__actions`; `src/assets/icons/dim.svg` supplies the toggle icon.
  CSS dims direct player children except the actions via `.fl-player--dimmed`.
  Both wide/narrow layouts and PiP/inline hosts share this behavior.
- The dim toggle exposes `aria-pressed`, an active accent, and a state-dependent
  label. It remains keyboard accessible and does not restore brightness merely
  on hover/focus. Reduced-motion styling removes the opacity transition.
- Preserve labels, focus behavior, seek range semantics, reduced-motion support,
  and non-draggable interactive regions when changing UI.
- Check close/reopen via launcher, shortcut, and native PiP close; resize across
  thresholds; verify persistence and inline fallback. Real PiP behavior needs
  Spotify/Chromium verification, not just a successful bundle.
- For dimming, verify toggle/restore with mouse and keyboard, both expanded
  layouts, readable header actions, and reset after collapse/close.

## Latest change verification

- Manual dim toggle and LRCLIB badge: `pnpm build` (including typechecking)
  passed during implementation. Visual/runtime checks in Spotify were not run.
