# Lyrics pipeline

## Source map

- `src/services/lyrics.ts`: Spotify/LRCLIB requests and Spotify, LRC, plain parsing.
- `src/composables/useLyrics.ts`: loading states, last-result cache, active line.
- `src/components/LyricsView.vue`: following, scrolling, line selection, messages.
- Contracts: `ITrack`, `ILyrics`, `ILyricLine`, `ELyricsStatus` in `src/types/float.ts`.

## Provider and privacy contracts

- Only `spotify:track:` URIs are eligible; podcasts and local files return no lyrics.
- Query Spotify first through `Spicetify.Platform.RequestBuilder`, then fall back
  to direct Spotify fetch with the session access token when necessary.
- Spotify endpoint: `https://spclient.wg.spotify.com/color-lyrics/v2`.
  This is an internal integration, not a stable public API.
- If Spotify lacks synced lyrics, query `https://lrclib.net/api/get` with title,
  primary artist, album, and rounded duration in seconds.
- Never send Spotify tokens to LRCLIB, persist them, or log them. Changes to
  third-party data sharing require explicit review and updated user-facing docs.
- Prefer synced Spotify, then synced LRCLIB, then available unsynced Spotify
  or LRCLIB text. Provider failures resolve to missing lyrics, not playback failure.

## Parsing and state

- Trim blank edges while retaining internal blank pause lines.
- Spotify lines use millisecond timestamps; `UNSYNCED` has no active highlighting.
- LRC supports multiple timestamps per line and sorts parsed lines by start time.
  Plain lyrics remain unsynced.
- `useLyrics` caches only the last track result (including null), keyed by URI.
  It ignores a response for display if the current track URI has changed.
  Requests are not currently aborted; do not document this as cancellation.
- States: idle, loading, synced, unsynced, unavailable. Active index is -1 before
  the first line and for unsynced lyrics.
- Lyrics load when the expanded lyrics component mounts, not in the compact dock.

## View behavior and verification

- Center the active synced line while following. Manual wheel/touch/scroll keys
  suspend following; Resume live restores it. Selecting a synced line seeks.
- New lyrics or layout changes reset following. Reduced-motion preference
  disables smooth centering. Unsynced lines do not seek.
- Check synced, unsynced, unavailable, no-track, and loading states; rapid track
  changes; collapse/re-expand cache reuse; manual scrolling/resume; and reduced
  motion. External provider availability needs real runtime verification.
