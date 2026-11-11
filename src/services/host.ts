import { EHostKind, type IFloatHost, type ISize } from '../types/float'

const ROOT_CLASS = 'float-root'
/** How long a new PiP window needs before it honours a resize. */
const OPEN_SETTLE_MS = 150

export function isPipSupported(): boolean {
  return typeof window.documentPictureInPicture?.requestWindow === 'function'
}

/**
 * Opens the always-on-top window. Must be called from a user gesture;
 * rejects when the browser refuses (no gesture, unsupported, blocked).
 */
export async function openPipHost(size: ISize, css: string): Promise<IFloatHost> {
  const pip = window.documentPictureInPicture
  if (!pip) throw new Error('Document Picture-in-Picture is not supported')

  const win = await pip.requestWindow({ width: size.width, height: size.height })
  const doc = win.document
  doc.title = 'Float'
  doc.documentElement.lang = document.documentElement.lang || 'en'

  const style = doc.createElement('style')
  style.textContent = css
  doc.head.append(style)

  const root = doc.createElement('div')
  root.className = `${ROOT_CLASS} ${ROOT_CLASS}--pip`
  doc.body.append(root)

  const host: IFloatHost = {
    kind: EHostKind.Pip,
    window: win,
    root,
    compactSize: { width: 272, height: 84 },
    resize({ width, height }) {
      // resizeTo takes the outer size; keep the browser-owned chrome in place.
      const chromeX = Math.max(0, win.outerWidth - win.innerWidth)
      const chromeY = Math.max(0, win.outerHeight - win.innerHeight)
      try {
        win.resizeTo(width + chromeX, height + chromeY)
      } catch {
        // Needs a user gesture; the layout simply adapts to the actual size.
      }
    },
    close() {
      win.close()
    },
    onClose(callback) {
      // Fires for the native close button, "back to tab" and win.close().
      win.addEventListener('pagehide', callback, { once: true })
    },
  }

  // Chromium may open the window at its previous bounds instead of the
  // requested size, and ignores a resize until the window has settled.
  win.setTimeout(() => host.resize(size), OPEN_SETTLE_MS)
  return host
}

/** Fallback when PiP is unavailable: the controller docks inside Spotify. */
export function openInlineHost(css: string): IFloatHost {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)

  const root = document.createElement('div')
  root.className = `${ROOT_CLASS} ${ROOT_CLASS}--inline`
  root.setAttribute('role', 'region')
  root.setAttribute('aria-label', 'Float player')
  document.body.append(root)

  const closeCallbacks: Array<() => void> = []
  let closed = false

  return {
    kind: EHostKind.Inline,
    window,
    root,
    compactSize: { width: 216, height: 48 },
    resize({ width, height }) {
      root.style.width = `${width}px`
      root.style.height = `${height}px`
    },
    close() {
      if (closed) return
      closed = true
      closeCallbacks.forEach((callback) => callback())
      root.remove()
      style.remove()
    },
    onClose(callback) {
      closeCallbacks.push(callback)
    },
  }
}
