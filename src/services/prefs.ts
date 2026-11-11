import { EView, type IPrefs, type ISize } from '../types/float'

const STORAGE_KEY = 'float:prefs'

export const WIDE_SIZE: ISize = { width: 760, height: 436 }

/** Below this content size the expanded player falls back to the dock. */
export const MIN_EXPANDED: ISize = { width: 300, height: 280 }

/** Width at which the expanded player switches from narrow to wide. */
export const WIDE_BREAKPOINT = 640

export function isExpandedSize(size: ISize): boolean {
  return size.width >= MIN_EXPANDED.width && size.height >= MIN_EXPANDED.height
}

export function loadPrefs(): IPrefs {
  const prefs: IPrefs = { view: EView.Compact, expanded: { ...WIDE_SIZE } }
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<IPrefs> | null
    if (stored?.view === EView.Expanded) prefs.view = EView.Expanded
    const size = stored?.expanded
    if (size && Number.isFinite(size.width) && Number.isFinite(size.height) && isExpandedSize(size)) {
      prefs.expanded = { width: size.width, height: size.height }
    }
  } catch {
    // Corrupt or unavailable storage: fall back to defaults.
  }
  return prefs
}

export function savePrefs(prefs: IPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Storage can be unavailable; preferences are a convenience only.
  }
}
