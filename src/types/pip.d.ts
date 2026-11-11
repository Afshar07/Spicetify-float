// Document Picture-in-Picture (WICG) — not yet part of TypeScript's DOM lib.

interface IDocumentPictureInPictureOptions {
  width?: number
  height?: number
  disallowReturnToOpener?: boolean
  preferInitialWindowPlacement?: boolean
}

interface IDocumentPictureInPicture extends EventTarget {
  readonly window: Window | null
  requestWindow(options?: IDocumentPictureInPictureOptions): Promise<Window>
}

interface Window {
  documentPictureInPicture?: IDocumentPictureInPicture
  Spicetify?: Partial<ISpicetify>
}
