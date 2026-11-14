import { computed, onBeforeUnmount, reactive } from 'vue'
import { isExpandedSize, loadPrefs, savePrefs, WIDE_BREAKPOINT, WIDE_SIZE } from '../services/prefs'
import { EHostKind, ELayout, EView, type IFloatHost, type ISize } from '../types/float'

const SAVE_DELAY_MS = 300
/** Sizes seen while the window is still opening are the browser's, not the user's. */
const SETTLE_MS = 1000

/**
 * Derives the layout from the saved view and the host's real content size,
 * so the UI stays correct when the browser clamps or ignores a resize.
 */
export function useLayout(host: IFloatHost) {
  const prefs = reactive(loadPrefs())
  const rect = host.root.getBoundingClientRect()
  const size = reactive<ISize>({ width: rect.width, height: rect.height })

  const layout = computed<ELayout>(() => {
    if (prefs.view === EView.Compact || !isExpandedSize(size)) return ELayout.Compact
    return size.width >= WIDE_BREAKPOINT ? ELayout.Wide : ELayout.Narrow
  })

  let saveTimer = 0
  let pendingSize: ISize | null = null
  let settled = false

  function flushExpandedSize(): void {
    host.window.clearTimeout(saveTimer)
    if (!pendingSize) return
    prefs.expanded = pendingSize
    pendingSize = null
    savePrefs(prefs)
  }

  function rememberExpandedSize(): void {
    // Only a window the user can resize carries a size preference.
    if (host.kind !== EHostKind.Pip || prefs.view !== EView.Expanded || !isExpandedSize(size)) return
    if (!settled) return
    host.window.clearTimeout(saveTimer)
    pendingSize = { width: Math.round(size.width), height: Math.round(size.height) }
    saveTimer = host.window.setTimeout(flushExpandedSize, SAVE_DELAY_MS)
  }

  // Observe with the host window's own constructor: the root lives there.
  const HostResizeObserver = (host.window as Window & typeof globalThis).ResizeObserver
  const observer = new HostResizeObserver((entries) => {
    const box = entries[0]?.contentRect
    if (!box) return
    size.width = box.width
    size.height = box.height
    rememberExpandedSize()
  })
  observer.observe(host.root)

  // Opening resize events are deliberately ignored, so sample once settled
  // even if the browser never sends another event.
  const settleTimer = host.window.setTimeout(() => {
    settled = true
    const box = host.root.getBoundingClientRect()
    size.width = box.width
    size.height = box.height
    rememberExpandedSize()
  }, SETTLE_MS)

  onBeforeUnmount(() => {
    observer.disconnect()
    host.window.clearTimeout(settleTimer)
    flushExpandedSize()
  })

  function expand(): void {
    prefs.view = EView.Expanded
    savePrefs(prefs)
    // If the window was shrunk below the minimum, go back to the default.
    host.resize(isExpandedSize(prefs.expanded) ? prefs.expanded : WIDE_SIZE)
  }

  function collapse(): void {
    flushExpandedSize()
    prefs.view = EView.Compact
    savePrefs(prefs)
    host.resize(host.compactSize)
  }

  return { layout, expand, collapse }
}
