<!-- toolkit:sha256=9f22ab452a6950b55a5cd0708cb9b85c5b158fd0d2c4253cb4ecca3582bfec28 -->
# .ai/ - Project Context for AI Agents

At workspace-router step 3, select one route below; defer its documents until
step 7, then follow the route exactly in order.

## Files

| File | Read when you're... |
| --- | --- |
| `ongoing/README.md` | continuing an in-progress task; read only the matching task document |
| `technical-debt/README.md` | locating unresolved technical debt relevant to the current work; read only the matching record |
| `window-ui.md` | changing window lifecycle, layout, preferences, styles, controls, or manual dimming |
| `playback.md` | changing player state, metadata, or transport behavior |
| `lyrics.md` | changing lyric providers, LRCLIB badge, parsing, synchronization, or scrolling |
| `delivery.md` | changing build output, installation, or Marketplace publication |

## Rules

- This folder is the local source of truth for AI task context in `float`.
- Keep file descriptions and task routes updated when project-specific decisions or boundaries change.
- Read only the files selected by the applicable task route or an exact user-named file.

## Task routes

- Continuing in-progress work: `ongoing/README.md` → only the matching task document → source.
- Window, layout, or UI: `window-ui.md` → `src/types/float.ts` (host/layout contract) → relevant source.
- Playback or transport: `playback.md` → `src/types/float.ts` and `src/types/spicetify.d.ts` → relevant source.
- Lyrics: `lyrics.md` → `src/types/float.ts` (track/lyrics contract) → relevant source.
- Build, installation, or release: `delivery.md` → relevant configuration/script.
- Context maintenance: `policies/context-maintenance.md` → only the focused context and source being updated.
- If a change crosses boundaries, follow each applicable focused route; do not
  read unrelated routes.
- Route format: `local-context.md` → optional shared/domain context → source.
- When no route applies, inspect the requested source file directly.
