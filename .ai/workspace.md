<!-- toolkit:sha256=c82346f22b12aa6d0ae7c9bc257a93024af854c42a237e8547fc1bb395c7f3ea -->
# Float Workspace

## Purpose

FLOAT is a Spotify desktop companion implemented as a Spicetify extension. It
provides a compact floating transport dock and an expanded player with lyrics,
using Document Picture-in-Picture with an inline Spotify fallback.

## Workspace boundary

- The only active project is `float`, at the workspace root.
- Stack: Vue 3, TypeScript, Vite, and pnpm. This is an injected extension,
  not a standalone website, Nuxt app, backend, or native desktop application.
- `src/` owns runtime code; `scripts/` owns local installation;
  `.github/workflows/` owns Marketplace publication.
- `dist/` and `node_modules/` are generated and ignored. Do not edit them.
- Root `README.md` is user-facing installation, usage, and limitations guidance.
  `.ai/README.md` routes agents to focused implementation context.

## External boundaries

- Spotify and Spicetify provide playback, metadata, authentication, and the launcher.
- Chromium owns the PiP window frame, minimum dimensions, and opening restrictions.
- Lyrics use Spotify's internal service and optionally LRCLIB. Preserve the
  privacy boundary documented in `lyrics.md` before changing network behavior.

Shared context belongs in this root. Project-specific implementation detail belongs in the owning project's local index.
