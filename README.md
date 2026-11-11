# FLOAT

A quiet desktop companion for Spotify, built as a [Spicetify](https://spicetify.app) extension.
One small always-on-top dock, and a little more room for the words when you want them.

- **Floating dock** — artwork, Previous, Play/Pause, Next, Expand (216 × 48).
- **Always on top** — runs in a Document Picture-in-Picture window, so it stays above other apps.
- **Expanded player** — album art, track details, seek bar, shuffle/repeat and synchronized lyrics.
- **Two layouts** — wide (≥ 640 px, default 760 × 436) and narrow, lyrics-first (< 640 px, e.g. 320 × 520).
- **Remembers** whether you left it compact or expanded, and the size you gave the expanded window.

## Requirements

- Spotify desktop with [Spicetify CLI](https://spicetify.app/docs/getting-started) installed and applied
  (developed against Spotify 1.3.8 / Spicetify 2.46).
- Node.js 20+ and pnpm, to build.

## Install

```sh
pnpm install
pnpm spicetify:install
```

`spicetify:install` builds `dist/float.js`, copies it to Spicetify's `Extensions` folder, registers it
(`spicetify config extensions float.js`) and runs `spicetify apply`, which restarts Spotify.

To do it by hand: `pnpm build`, copy `dist/float.js` into the folder shown by
`spicetify path userdata` + `/Extensions`, then run `spicetify config extensions float.js` and `spicetify apply`.

Remove it with `pnpm spicetify:uninstall`.

## Use

Click the **Float player** button in Spotify's top bar, or press **Ctrl+M** while Spotify or the FLOAT
window has focus. Do the same again (or close the window) to dismiss.

- **Move** — drag the window by any empty part of its surface (the artwork, the header, the space
  around the dock), or by its title bar.

- **Expand / Collapse** — the arrows button in the dock and in the player's top-right corner.
- **Wide vs narrow** — drag the window's edge. Under 640 px wide it becomes the narrow, lyrics-first
  layout; the size is remembered for next time.
- **Lyrics** — the current line stays centered. Scroll to browse; a **Resume live** button brings you
  back. Click any line to jump there.

| Key | Action |
| --- | --- |
| Space | Play / pause |
| ← / → | Seek −5 / +5 seconds |
| Tab · Enter | Focus · activate |
| Escape | Return to the compact dock |
| Ctrl+M | Open / close FLOAT (also works from Spotify) |

Shortcuts apply only while the FLOAT window has focus; Ctrl+M also works while Spotify has focus. It is
not a system-wide hotkey.

## Development

```sh
pnpm dev        # rebuild dist/float.js on change
pnpm typecheck  # vue-tsc, strict
pnpm build      # typecheck + production bundle
```

Spicetify copies extensions into Spotify when you run `spicetify apply`, so after a rebuild run
`pnpm spicetify:install` (or copy the file and `spicetify apply`) to see the change.

```
src/
  main.ts                 entry: waits for Spicetify, adds the launcher, owns the window lifecycle
  types/                  interfaces (I…), enums (E…), Spicetify and Document PiP declarations
  services/host.ts        PiP window host and the inline (in-Spotify) fallback host
  services/lyrics.ts      lyric sources and parsing
  services/prefs.ts       persisted preferences and layout thresholds
  composables/            usePlayback (shared player state), useLyrics, useLayout
  components/             FloatApp, CompactDock, ExpandedPlayer, LyricsView, SeekBar, …
  styles/float.css        all styles, scoped under .float-root
  assets/icons/           SVG icons exported from the Figma file
```

The bundle is a single IIFE (`dist/float.js`, ~157 kB, ~83 kB gzipped) with Vue, the CSS, the icons
and a Latin subset of Inter inlined, because Spicetify loads an extension as one script and the PiP
document shares no styles or fonts with Spotify.

## How it works

- **Playback** uses `Spicetify.Player` only (`togglePlay`, `next`, `back`, `seek`, `toggleShuffle`,
  `setRepeat`). State is read from the player on `songchange` / `onplaypause` and on a 250 ms tick
  while a FLOAT window is open; progress is always the player's own clock, never a local counter.
  "Previous" restarts the track after 3 s, otherwise goes back.
- **PiP** — `documentPictureInPicture.requestWindow()` is called from the launcher click. The Vue app
  is mounted into the PiP document and the stylesheet injected there. Timers and observers are bound
  to the PiP window so they keep running when Spotify is minimized. Every way of closing (native
  close button, the launcher, Spotify reloading) goes through one `pagehide` handler that stops the
  timer and unmounts the app. Closing never affects playback.
- **Layout** is derived from the window's real content size, not from what was requested, so it stays
  correct when the browser clamps a size.
- **Lyrics** come from Spotify's own lyrics service through the client's authenticated request
  builder — the approach used by the Lyric Miniplayer extension. If Spotify has no time-synced lyrics,
  FLOAT asks [LRCLIB](https://lrclib.net) and parses its LRC. Lyrics load only while the expanded
  player is open.

## Limitations

- **The window frame belongs to the browser.** Document PiP windows always have a native title bar
  and close button; they cannot be frameless or transparent, and the page cannot position them.
  Dragging by the surface relies on `-webkit-app-region`, which Spotify's Chromium honours in PiP
  windows; buttons, the seek bar and the lyric list are excluded so they stay clickable. The 216 × 48 dock is therefore drawn centered inside a small window, not as a bare pill on
  the desktop.
- **Minimum size is browser-defined.** FLOAT requests a 272 × 84 viewport for the dock and accepts
  whatever Chromium allows. Below 300 × 280 the expanded player falls back to the dock rather than
  crop controls.
- **Opening needs a click.** PiP can only be opened from a user gesture, so FLOAT cannot reopen itself
  when Spotify starts; the last layout is restored when you click the launcher.
- **One window, tied to Spotify.** Only one PiP window can exist at a time, and it closes when Spotify
  closes or reloads.
- **Initial size.** Chromium may open the window at its previous bounds; FLOAT corrects the size a
  moment after opening, so a brief resize can be visible.
- **No PiP support.** If `documentPictureInPicture` is missing or the request is refused, the same
  player docks inside the Spotify window (bottom-right) instead. It is not always-on-top there.
- **Lyrics availability.** Spotify's lyrics endpoint is internal and can change or be restricted by
  account or region. The LRCLIB fallback sends the track title, artist, album and duration to
  lrclib.net; its matches can occasionally be for a different version of a song. Podcasts and local
  files have no lyrics. Unsynced lyrics are shown without highlighting or click-to-seek.
- **Typeface.** Inter is embedded for Latin text only; other scripts use the system font.
- **Launcher.** The button uses `Spicetify.Topbar`. If a Spotify update outruns Spicetify's top-bar
  support, the button will not appear until Spicetify is updated.
- **Tooltips.** In the compact dock they are native browser tooltips, since the small window has no
  room for the designed ones; the expanded player uses the designed tooltip.
- **Spicetify API.** Spotify updates can break Spicetify APIs; re-run `spicetify apply` after Spotify
  updates.
