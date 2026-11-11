// Minimal declarations for the parts of the Spicetify API that FLOAT uses.

interface ISpicetifyArtist {
  name?: string
  uri?: string
}

interface ISpicetifyImage {
  url?: string
  label?: string
}

interface ISpicetifyTrackItem {
  uri?: string
  name?: string
  artists?: ISpicetifyArtist[]
  album?: { name?: string }
  images?: ISpicetifyImage[]
  duration?: { milliseconds?: number }
  metadata?: Record<string, string | undefined>
}

interface ISpicetifyPlayerData {
  item?: ISpicetifyTrackItem | null
}

type TSpicetifyPlayerEvent = 'songchange' | 'onplaypause' | 'onprogress'

interface ISpicetifyPlayer {
  data?: ISpicetifyPlayerData | null
  addEventListener(type: TSpicetifyPlayerEvent, listener: () => void): void
  removeEventListener(type: TSpicetifyPlayerEvent, listener: () => void): void
  isPlaying(): boolean
  togglePlay(): void
  next(): void
  back(): void
  seek(positionMs: number): void
  getProgress(): number
  getDuration(): number
  getShuffle(): boolean
  toggleShuffle(): void
  getRepeat(): number
  setRepeat(mode: number): void
}

interface ISpicetifyRequestBuilder {
  withHost(host: string): ISpicetifyRequestBuilder
  withPath(path: string): ISpicetifyRequestBuilder
  withQueryParameters(params: Record<string, unknown>): ISpicetifyRequestBuilder
  withEndpointIdentifier(identifier: string): ISpicetifyRequestBuilder
  send(): Promise<{ body?: unknown }>
}

interface ISpicetifyPlatform {
  version?: string
  PlatformData?: { app_platform?: string }
  RequestBuilder?: { build(): ISpicetifyRequestBuilder }
  AuthorizationAPI?: { getState(): { token?: { accessToken?: string } } }
}

interface ISpicetifyTopbarButton {
  element?: HTMLElement
  label: string
  disabled: boolean
}

interface ISpicetify {
  Player: ISpicetifyPlayer
  Platform?: ISpicetifyPlatform
  Topbar?: {
    Button: new (
      label: string,
      icon: string,
      onClick: () => void,
      disabled?: boolean,
    ) => ISpicetifyTopbarButton
  }
  showNotification?(message: string, isError?: boolean): void
}

declare const Spicetify: ISpicetify
