<!-- toolkit:sha256=2f7e8ef7eb62624488c480624be2198f5701f753e6be01a15c700af065dbf49f -->
# Engineering Conventions

- Preserve public behavior and contracts unless the task explicitly changes them.
- Prefer the simplest implementation that satisfies the acceptance criteria.
- Run targeted checks for the changed boundary and report what was not verified.

## Existing implementation style

- Use TypeScript and Vue single-file components with `<script setup lang="ts">`.
  Match the existing two-space indentation and extensionless local imports.
- Shared interfaces use `I…` names and enums use `E…` names; reuse
  `src/types/float.ts` rather than duplicating shared models.
- TypeScript is strict, including unused-symbol checks and unchecked indexed
  access. Keep type-only imports explicit.
- Keep side effects at their owning boundary: playback commands in
  `usePlayback`, window operations in the host service, network work in the
  lyrics service, and persisted dimensions in preferences/layout.
- Use the owning host window for UI timers and observers. PiP has a different
  document/window from Spotify; avoid assuming global DOM constructors own it.
- Keep extension styling under `.float-root` with the existing `fl-` class
  convention. The PiP document receives its own injected stylesheet and font.
- Treat Spotify metadata and lyric text as untrusted text; do not turn it into
  HTML or expose Spotify credentials to third-party lyric providers.

## Verification

- Documentation-only changes: check routes, source references, and claims
  against the implementation. A build is not required for Markdown edits.
- Runtime/type changes: run `pnpm typecheck`; build/distribution changes: run
  `pnpm build` (includes typechecking). See `.ai/delivery.md` for side effects.
- No automated test runner or test script is currently configured in
  `package.json`. Do not report typechecking as behavioral test coverage.
- Host integration requires manual verification in Spotify/Spicetify:
  open/close/reopen, compact/expanded, wide/narrow resize, transport, shortcuts,
  and lyrics states as applicable. Explicitly report when this was not run.
- Do not run install/uninstall or publish commands as routine verification:
  they modify the user's Spotify installation or the remote release branch.
