import { createApp, type App } from 'vue'
import interFontUrl from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
import FloatApp from './components/FloatApp.vue'
import { initPlayback, startPlaybackSync, stopPlaybackSync } from './composables/usePlayback'
import { isPipSupported, openInlineHost, openPipHost } from './services/host'
import { isExpandedSize, loadPrefs } from './services/prefs'
import floatCss from './styles/float.css?inline'
import { EView, type IFloatHost } from './types/float'

const LAUNCHER_LABEL = 'Float player (Ctrl+M)'

// 16 × 16 launcher glyph for Spotify's top bar: a window with a floating pane.
// Spicetify inserts this markup as-is, so it must be a complete <svg>.
const LAUNCHER_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">' +
  '<path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v7.5C0 12.216.784 13 1.75 13H6v-1.5H1.75a.25.25 0 0 1-.25-.25v-7.5a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25V6.5H16V3.75A1.75 1.75 0 0 0 14.25 2H1.75Z"/>' +
  '<path d="M8.75 8h6.5c.414 0 .75.336.75.75v4.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75v-4.5A.75.75 0 0 1 8.75 8Z"/>' +
  '</svg>'

// Inter is embedded so the PiP document, which shares no styles with
// Spotify, renders the designed typeface without a network request.
const STYLES =
  `@font-face{font-family:'Float Inter';font-style:normal;font-weight:100 900;` +
  `font-display:swap;src:url(${interFontUrl}) format('woff2');}` +
  floatCss

let host: IFloatHost | null = null
let app: App | null = null
let opening = false

function mount(nextHost: IFloatHost): void {
  host = nextHost
  app = createApp(FloatApp, { host: nextHost })
  app.mount(nextHost.root)
  startPlaybackSync(nextHost.window)
  // The PiP window has its own key events; the shortcut should close it too.
  if (nextHost.window !== window) nextHost.window.addEventListener('keydown', onShortcut)

  // One cleanup path for every way the window can go away.
  nextHost.onClose(() => {
    stopPlaybackSync()
    app?.unmount()
    app = null
    host = null
  })
}

/** Opens FLOAT, or closes it when it is already open. Needs a user gesture. */
async function toggleFloat(): Promise<void> {
  if (opening) return
  if (host) {
    host.close()
    return
  }

  const prefs = loadPrefs()
  const expanded = prefs.view === EView.Expanded && isExpandedSize(prefs.expanded)

  if (isPipSupported()) {
    opening = true
    try {
      const pipHost = await openPipHost(expanded ? prefs.expanded : { width: 272, height: 84 }, STYLES)
      mount(pipHost)
      return
    } catch (error) {
      console.warn('[Float] Picture-in-Picture is unavailable; docking inside Spotify.', error)
    } finally {
      opening = false
    }
  }

  // No PiP support: keep the controller in Spotify.
  const inlineHost = openInlineHost(STYLES)
  inlineHost.resize(expanded ? prefs.expanded : inlineHost.compactSize)
  mount(inlineHost)
}

/** Ctrl+M opens or closes FLOAT; a key press counts as the required gesture. */
function onShortcut(event: KeyboardEvent): void {
  if (event.code !== 'KeyM' || !event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return
  event.preventDefault()
  if (!event.repeat) void toggleFloat()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function registerLauncher(): Promise<void> {
  // The Topbar API can register a little after Player.
  for (let attempt = 0; attempt < 100 && !Spicetify.Topbar?.Button; attempt++) await sleep(100)
  if (!Spicetify.Topbar?.Button) {
    console.warn('[Float] Spicetify.Topbar is unavailable; no launcher button was added.')
    return
  }
  new Spicetify.Topbar.Button(LAUNCHER_LABEL, LAUNCHER_ICON, () => void toggleFloat(), false)
}

async function start(): Promise<void> {
  while (!window.Spicetify?.Player?.addEventListener || !window.Spicetify.Platform) await sleep(100)

  initPlayback()
  // A PiP window never outlives its opener; close ours first so Vue unmounts.
  window.addEventListener('pagehide', () => host?.close())
  window.addEventListener('keydown', onShortcut, true)
  await registerLauncher()
}

void start()
