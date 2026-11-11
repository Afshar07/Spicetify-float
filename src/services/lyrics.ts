import type { ILyricLine, ILyrics, ITrack } from '../types/float'

const SPOTIFY_LYRICS_HOST = 'https://spclient.wg.spotify.com/color-lyrics/v2'
const LRCLIB_ENDPOINT = 'https://lrclib.net/api/get'

interface ISpotifyLyricsBody {
  lyrics?: {
    syncType?: string
    lines?: Array<{ startTimeMs?: string; words?: string }>
  }
}

interface ILrclibBody {
  syncedLyrics?: string | null
  plainLyrics?: string | null
}

/** Drops leading/trailing blank lines; blank lines in between are pauses. */
function trimBlankEdges(lines: ILyricLine[]): ILyricLine[] {
  let start = 0
  let end = lines.length
  while (start < end && !lines[start]?.text) start++
  while (end > start && !lines[end - 1]?.text) end--
  return lines.slice(start, end)
}

function toLyrics(lines: ILyricLine[], synced: boolean): ILyrics | null {
  const trimmed = trimBlankEdges(lines)
  return trimmed.length ? { synced, lines: trimmed } : null
}

function parseSpotify(body: unknown): ILyrics | null {
  const lyrics = (body as ISpotifyLyricsBody | null)?.lyrics
  if (!lyrics?.lines?.length) return null
  // LINE_SYNCED and SYLLABLE_SYNCED both carry per-line start times.
  const synced = !!lyrics.syncType && lyrics.syncType !== 'UNSYNCED'
  const lines = lyrics.lines.map((line) => ({
    startMs: Number.parseInt(line.startTimeMs ?? '0', 10) || 0,
    text: (line.words ?? '').trim().replace(/^♪$/, ''),
  }))
  return toLyrics(lines, synced)
}

/** Parses LRC text: `[mm:ss.xx] words`, possibly several stamps per line. */
function parseLrc(lrc: string): ILyrics | null {
  const lines: ILyricLine[] = []
  for (const raw of lrc.split('\n')) {
    const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)]
    if (!stamps.length) continue
    const text = raw.replace(/\[[^\]]*\]/g, '').trim()
    for (const stamp of stamps) {
      lines.push({ startMs: Math.round((Number(stamp[1]) * 60 + Number(stamp[2])) * 1000), text })
    }
  }
  lines.sort((a, b) => a.startMs - b.startMs)
  return toLyrics(lines, true)
}

function parsePlain(text: string): ILyrics | null {
  return toLyrics(
    text.split('\n').map((line) => ({ startMs: 0, text: line.trim() })),
    false,
  )
}

async function fetchFromSpotify(trackId: string): Promise<ILyrics | null> {
  const platform = Spicetify.Platform

  // Spotify's own request builder handles auth and token refresh.
  try {
    const response = await platform?.RequestBuilder?.build()
      .withHost(SPOTIFY_LYRICS_HOST)
      .withPath(`/track/${encodeURIComponent(trackId)}`)
      .withQueryParameters({ format: 'json', vocalRemoval: false })
      .withEndpointIdentifier('/track/{trackId}')
      .send()
    const lyrics = parseSpotify(response?.body)
    if (lyrics) return lyrics
  } catch {
    // 404 means Spotify has no lyrics; anything else falls through.
  }

  // Older or changed clients: plain fetch with the session token.
  try {
    const token = platform?.AuthorizationAPI?.getState().token?.accessToken
    if (!token) return null
    const response = await fetch(
      `${SPOTIFY_LYRICS_HOST}/track/${encodeURIComponent(trackId)}?format=json&vocalRemoval=false&market=from_token`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'App-Platform': platform?.PlatformData?.app_platform ?? 'Win32_x86_64',
          'Spotify-App-Version': platform?.version ?? '',
        },
      },
    )
    return response.ok ? parseSpotify(await response.json()) : null
  } catch {
    return null
  }
}

async function fetchFromLrclib(track: ITrack): Promise<ILyrics | null> {
  if (!track.title || !track.primaryArtist) return null
  try {
    const query = new URLSearchParams({
      track_name: track.title,
      artist_name: track.primaryArtist,
      album_name: track.album,
      duration: String(Math.round(track.durationMs / 1000)),
    })
    const response = await fetch(`${LRCLIB_ENDPOINT}?${query}`)
    if (!response.ok) return null
    const body = (await response.json()) as ILrclibBody
    if (body.syncedLyrics) return parseLrc(body.syncedLyrics)
    return body.plainLyrics ? parsePlain(body.plainLyrics) : null
  } catch {
    return null
  }
}

/**
 * Spotify's lyrics first; LRCLIB (public, no key) fills in when Spotify has
 * nothing or only unsynced text. Resolves to null when no source has lyrics.
 */
export async function fetchLyrics(track: ITrack): Promise<ILyrics | null> {
  if (!track.uri.startsWith('spotify:track:')) return null
  const trackId = track.uri.slice('spotify:track:'.length)

  const fromSpotify = await fetchFromSpotify(trackId)
  if (fromSpotify?.synced) return fromSpotify

  const fromLrclib = await fetchFromLrclib(track)
  if (fromLrclib?.synced) return fromLrclib
  return fromSpotify ?? fromLrclib
}
