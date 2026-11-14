<!-- toolkit:sha256=9f22ab452a6950b55a5cd0708cb9b85c5b158fd0d2c4253cb4ecca3582bfec28 -->
# .ai/ - Project Context for AI Agents

At workspace-router step 3, select one route below; defer its documents until
step 7, then follow the route exactly in order.

## Files

| File | Read when you're... |
| --- | --- |
| `ongoing/README.md` | continuing an in-progress task; read only the matching task document |
| `technical-debt/README.md` | locating unresolved technical debt relevant to the current work; read only the matching record |
| <!-- example.md --> | <!-- working on a focused project concern --> |

## Rules

- This folder is the local source of truth for AI task context in `float`.
- Keep file descriptions and task routes updated when project-specific decisions or boundaries change.
- Read only the files selected by the applicable task route or an exact user-named file.

## Task routes

- Continuing in-progress work: `ongoing/README.md` → only the matching task document → source.
- Add focused task routes here when a real project boundary appears.
- Route format: `local-context.md` → optional shared/domain context → source.
- When no route applies, inspect the requested source file directly.
