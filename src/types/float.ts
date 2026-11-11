export enum ELayout {
  Compact = 'compact',
  Narrow = 'narrow',
  Wide = 'wide',
}

export enum EView {
  Compact = 'compact',
  Expanded = 'expanded',
}

export enum EHostKind {
  /** Always-on-top Document Picture-in-Picture window. */
  Pip = 'pip',
  /** Fallback: the controller stays inside the Spotify window. */
  Inline = 'inline',
}

export enum ERepeatMode {
  Off = 0,
  Context = 1,
  Track = 2,
}

export enum ELyricsStatus {
  Idle = 'idle',
  Loading = 'loading',
  Synced = 'synced',
  Unsynced = 'unsynced',
  Unavailable = 'unavailable',
}

export interface ISize {
  width: number
  height: number
}

export interface IPrefs {
  view: EView
  /** Last content size of the expanded player; decides wide vs narrow. */
  expanded: ISize
}

export interface ITrack {
  uri: string
  title: string
  /** All artists, comma separated, for display. */
  artist: string
  /** First artist only, for lyric lookups. */
  primaryArtist: string
  album: string
  artworkUrl: string
  durationMs: number
}

export interface ILyricLine {
  startMs: number
  text: string
}

export interface ILyrics {
  synced: boolean
  lines: ILyricLine[]
}

export interface IFloatHost {
  kind: EHostKind
  /** Window that owns the UI; timers and listeners must be bound to it. */
  window: Window
  root: HTMLElement
  /** Content size the compact dock asks for in this host. */
  compactSize: ISize
  /** Requests a content size. The browser may clamp or ignore it. */
  resize(size: ISize): void
  close(): void
  onClose(callback: () => void): void
}
