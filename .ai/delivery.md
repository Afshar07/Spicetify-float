# Build, installation, and release

## Sources

- `package.json`, `pnpm-lock.yaml`: dependency and command definitions.
- `vite.config.ts`, `tsconfig.json`: bundle and strict typechecking configuration.
- `scripts/spicetify.mjs`: local install/uninstall.
- `.github/workflows/marketplace.yml`, `manifest.json`: Marketplace publication.
- Root `README.md`: public requirements, commands, usage, and limitations.

## Build contract

- Vue 3 + TypeScript, built with Vite and pnpm.
- `pnpm dev` is a watched build, not a browser dev server.
- `pnpm typecheck` runs `vue-tsc --noEmit`.
- `pnpm build` typechecks and creates `dist/float.js`.
- Vite builds an IIFE named `FloatExtension`, targeting Chrome 116, with
  `src/main.ts` as the library entry. Vue, CSS, SVGs, and the Latin Inter font
  are embedded for single-script loading in Spotify and a separate PiP document.
- Preserve the single-file artifact and filename. Do not edit `dist/` manually.
- The README states Node 20+; the release workflow uses Node 22 and pnpm 10.
  Check dependency engine requirements before changing or asserting compatibility.

## Side-effectful commands

- `pnpm spicetify:install` builds, copies `dist/float.js` into the user's
  Spicetify `Extensions` directory, registers it, and runs `spicetify apply`.
- `pnpm spicetify:uninstall` unregisters/removes the extension and applies changes.
- Both affect the user's Spotify setup; applying restarts Spotify. Do not use
  either as routine verification without the user's intent to install/remove.
- Rebuilding alone does not update the extension already copied into Spotify.

## Marketplace publication

- Selected path changes on `main`, or a manual workflow dispatch, run the release
  workflow. `.ai`-only changes are not in its push path filter.
- CI installs with the frozen lockfile and runs `pnpm build`.
- Publication creates an orphan `marketplace` branch and force-pushes only
  `float.js`, `manifest.json`, `preview.png`, and `README.md`.
- The manifest points to `float.js` on `marketplace`; keep artifact paths aligned.
- Treat workflow or branch changes as release-sensitive. Do not run its publishing
  shell block locally or push a release merely to validate documentation.

## Verification

For build changes run `pnpm build` and confirm the single expected output.
For installer or workflow edits inspect side effects and artifact paths without
executing installation or publication unless explicitly requested. A successful
build does not establish Spotify runtime compatibility or live lyric availability.
