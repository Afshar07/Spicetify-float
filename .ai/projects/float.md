<!-- toolkit:sha256=3b84abc9b6e53899cbef54291d27889d135457d650540721f24461d1b9925375 -->
# float

## Scope

Owns the complete FLOAT extension, its local installer, and its Marketplace
distribution workflow. Start implementation discovery at `.ai/README.md`.

## Ownership boundaries

- This project owns its implementation details and local conventions.
- Cross-project contracts belong in shared workspace context.
- `src/main.ts` owns extension startup, the top-bar launcher, Ctrl+M, and the
  single active host/app lifecycle.
- Components render the player; composables own reactive playback, lyrics,
  and layout state; services own host integration, fetching, and storage.
- `src/types/float.ts` defines shared model and host contracts.
  `src/types/spicetify.d.ts` and `src/types/pip.d.ts` describe external surfaces;
  declarations do not prove an API is available at runtime.
- Deliver one self-contained `float.js`. Do not introduce a server, separate
  runtime assets, or new installation requirements without explicit scope.

## Product contracts

- Closing FLOAT never stops Spotify playback.
- PiP is preferred; an unavailable or refused PiP request falls back inline.
- Layout follows actual content dimensions, not just requested window size.
- Spotify is the playback clock and source of truth.
- Lyrics are optional: missing data or network failures must not break playback.
- Persist only view and expanded dimensions under the existing preference schema
  unless a task explicitly changes storage behavior.
