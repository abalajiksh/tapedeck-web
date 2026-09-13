/* Demo content for the home page, transcribed from the design file.
   All of it is invented sample data — no real listen, and the lyrics are
   made-up words rather than any real song. */

export const TRACKS = [
  { title: "Teardrop", artist: "Massive Attack", album: "Mezzanine", dur: 330, codec: "FLAC 24/96", quality: 85, context: "Active" },
  { title: "Xtal", artist: "Aphex Twin", album: "Selected Ambient Works 85\u201392", dur: 291, codec: "FLAC 16/44.1", quality: 80, context: "Active" },
  { title: "The Sound of Silence", artist: "Simon & Garfunkel", album: "Wednesday Morning, 3 A.M.", dur: 210, codec: "DSD64", quality: 92, context: "Active" }
];

export const SIDE = [
  { no: "A1", title: "Xtal", len: 291 },
  { no: "A2", title: "Tha", len: 541 },
  { no: "A3", title: "Pulsewidth", len: 227 },
  { no: "A4", title: "Ageispolis", len: 321 }
];

export const LADDER = [
  { n: 1, title: "Explicit chain name", body: "The client names it in tapedeck_chain.chain_id and the server looks it up.",
    payload: '"tapedeck_chain": {\n  "chain_id": "desktop-reference"\n}', result: "Desktop Reference", label: "explicit" },
  { n: 2, title: "Output-device binding", body: "The OS output device, auto-learned and mapped to a chain once. Every future listen through it attributes by itself.",
    payload: '"tapedeck_device": {\n  "output_device": "Schiit Mimir"\n}', result: "Desktop Reference (learned output)", label: "binding" },
  { n: 3, title: "The submitting token's default", body: "One token per app is how people actually organise these \u2014 repointable later without re-issuing the credential.",
    payload: 'Authorization: Token td_\u2026 \n  (name: "Pano on Android")', result: "Walkman \u2192 IEMs", label: "token" },
  { n: 4, title: "Source-device default", body: "The submitting machine's own default chain, the coarsest fallback there is.",
    payload: '"tapedeck_device": {\n  "machine_id": "living-room-pi"\n}', result: "Living Room \u2192 Speakers", label: "device" }
];

export const GENRES = [
  { name: "ambient techno", x: 62, y: 38, s: 16, o: 0.95, detail: "1,410 listens \u00b7 your densest region \u00b7 borders IDM and dub techno" },
  { name: "IDM", x: 68, y: 30, s: 20, o: 0.95, detail: "2,208 listens \u00b7 Aphex Twin, Autechre, Boards of Canada" },
  { name: "trip hop", x: 41, y: 55, s: 18, o: 0.9, detail: "1,860 listens \u00b7 Massive Attack, Portishead, Tricky" },
  { name: "folk rock", x: 22, y: 68, s: 14, o: 0.85, detail: "740 listens \u00b7 the oldest region in your history" },
  { name: "dub techno", x: 71, y: 44, s: 11, o: 0.8, detail: "402 listens \u00b7 growing since 2024" },
  { name: "shoegaze", x: 34, y: 34, s: 12, o: 0.8, detail: "512 listens \u00b7 mostly 2019\u20132021" },
  { name: "post-rock", x: 30, y: 46, s: 10, o: 0.75, detail: "364 listens" },
  { name: "modern classical", x: 17, y: 40, s: 9, o: 0.7, detail: "281 listens \u00b7 late evenings" },
  { name: "jazz fusion", x: 26, y: 24, s: 8, o: 0.65, detail: "190 listens" },
  { name: "drum and bass", x: 80, y: 22, s: 8, o: 0.6, detail: "154 listens \u00b7 a 2023 burst that did not last" },
  { name: "minimal wave", x: 57, y: 18, s: 7, o: 0.6, detail: "121 listens" },
  { name: "krautrock", x: 45, y: 27, s: 7, o: 0.55, detail: "98 listens" },
  { name: "vaporwave", x: 76, y: 60, s: 6, o: 0.45, detail: "61 listens \u00b7 a bordering region you barely play" },
  { name: "sludge metal", x: 88, y: 76, s: 5, o: 0.3, detail: "12 listens \u00b7 the edge of what you play" }
];

export const LAB = {
  "Similar songs": { x: "x: organic \u2194 mechanical", y: "y: familiarity",
    pts: [[120,180],[150,150],[170,166],[190,132],[210,150],[228,118],[250,140],[262,104],[286,126],[300,96],[320,118],[338,86]] },
  "Dimensional crawl": { x: "x: era", y: "y: dense \u2194 spiky",
    pts: [[54,240],[92,214],[128,196],[160,162],[196,150],[224,124],[258,116],[286,92],[310,80],[334,64],[352,52],[370,44]] },
  "Rollercoaster": { x: "x: recency", y: "y: hour of day",
    pts: [[46,220],[78,120],[110,64],[142,132],[174,232],[206,150],[238,72],[270,44],[300,140],[326,232],[350,168],[372,96]] }
};

export const GRANTS = [
  { name: "listening:read", what: "history, stats, reports", on: true },
  { name: "library:read", what: "gear, shelf, loves, notes", on: true },
  { name: "playlists:write", what: "save into Tapedeck", on: true },
  { name: "playlists:push", what: "send to your server", on: false },
  { name: "loves:write", what: "love and unlove", on: false },
  { name: "notes:write", what: "write liner notes", on: false },
  { name: "crate:write", what: "suggest what you don't own", on: false }
];

export const MORE = [
  { kicker: "Reports", title: "Your listening in chapters", body: "Week, month and year, each a genuinely different shape rather than one card resized. A month exports as a story, square or wide image \u2014 drawn on the server, so every client gets the same picture." },
  { kicker: "Rediscovery", title: "Smart collections from your own history", body: "Forgotten favourites, loved but barely played, one-listen records, the 3 AM club, dusty vinyl, and never heard on a particular pair of headphones. Send any of them to your media server." },
  { kicker: "Audio quality", title: "A 0\u2013100 score per listen", body: "Codec, sample rate, bit depth, DSD rate and delivery format. Source versus delivered, so you know when your FLAC was degraded to AAC over Bluetooth. DSD is first-class." },
  { kicker: "Loved", title: "Every heart in one place", body: "Tracks, records and artists \u2014 a love attaches to an entity rather than only a song. Recording loves mirror out to Last.fm and ListenBrainz; the rest stay local because neither service has the concept." },
  { kicker: "Import", title: "Bring your history with you", body: "The ListenBrainz export zip, a Spotify extended-history zip (re-anchored to when tracks started, not stopped), Last.fm by username, .json, .csv, or a Rockbox .scrobbler.log straight off a DAP." },
  { kicker: "Export", title: "And take it away again", body: "Full JSON or CSV, a consistent VACUUM INTO backup of the whole database, and liner notes as Markdown with working [[wikilinks]] for Obsidian or Logseq." },
  { kicker: "Sessions", title: "Grouped, and editable", body: "Contiguous listening under a 30-minute gap becomes a session with duration, track count, quality stats and context. Merge, split and rebuild them; the UUIDs stay stable." },
  { kicker: "Lyrics", title: "For the language a title cannot give", body: "Fetched from LRCLIB and cached outside your backup. A romanised Korean title falls through to English/Other; the lyric is where that title's script went. Instrumental is a real answer." },
  { kicker: "Skips", title: "Kept, and never counted", body: "Out of every listen count, chart and forward \u2014 a skip on your Last.fm is a wrong scrobble on a permanent record. They have their own readout showing what played either side." },
  { kicker: "Multi-user", title: "A household on one instance", body: "Own token, own history, own chains, own sources, isolated per user. Admins manage everyone from the Users screen, with guards against deleting yourself or the last admin." },
  { kicker: "Reliability", title: "Built to be a system of record", body: "WAL SQLite, retryable 503s, per-sink delivery tracking, circuit breakers per service, graceful SIGTERM drain, and an Operations screen that tails the log." },
  { kicker: "Your own site", title: "One opt-in public endpoint", body: "GET /public/np/<user> returns what's on your deck right now. Four separate field switches, all off by default. A Hugo shortcode ships in the repo and degrades to nothing." }
];

export const CAVEATS = [
  { title: "Emby is untested", body: "One protocol with Jellyfin, driven from one client \u2014 but never run against a real Emby server. The fields at risk fail silently: no codec, no device, no MusicBrainz IDs, and nothing in the log to say so." },
  { title: "Roon is untested too", body: "Built against the roon-api crate's declared types and Roon's vendored docs. Note that its extension API carries no signal path and no MusicBrainz IDs \u2014 a Roon listen holds less detail than a Plex one." },
  { title: "Nothing federates outward yet", body: "Actor endpoints, WebFinger and signature verification all serve. Delivery is the remaining work, and that order is deliberate: identity other servers cache has to be right before anyone holds a copy." },
  { title: "Audio quality is mostly unknown", body: "Only listens a live source reported carry a format. On a real 21,000-listen history that is 97% unknown, which is why the fidelity cards report coverage rather than a share." },
  { title: "A side may be split by track count", body: "When a lookup returns no running times, sides are split by number of tracks instead of playing time \u2014 which can put the break in the wrong place. Re-filing through the medium picker moves it." },
  { title: "The genre space is per-artist, for now", body: "Every Noise at Once places artists, so every track by one artist shares its six sound coordinates \u2014 the Genre Map and Playlist Lab are a placeholder until per-recording features are computed from your real files." },
  { title: "Nothing reads the audio vectors yet", body: "AudioMuse-AI can be connected, tested and measured, and that is the whole of it \u2014 the per-recording sound space it exists to supply is not wired into the Genre Map, Playlist Lab or anywhere else. The coverage measurement was built first on purpose: how much of a history can be joined at all is what decides whether the rest is worth building." },
  { title: "TIDAL's write half is unverified", body: "Sign-in, search and token refresh are confirmed against the live API. Creating a playlist still uses the two POST shapes TIDAL's spec declares rather than ones observed working." }
];

export const NOTE_DEFAULT = "Bought on a whim in 2011 and it rearranged the year. [[track:3]] is the one that got me \u2014 nothing else by [[artist:Aphex Twin]] sounds quite like it, and [[track:Windowlicker]] came much later. Heard properly for the first time through [[gear:HD 650]]. [[track:Grasshopper Rain]] was never real.";

export const RESOLVED = {
  "track:3": "Pulsewidth",
  "artist:Aphex Twin": "Aphex Twin",
  "track:Windowlicker": "Windowlicker",
  "gear:HD 650": "Sennheiser HD 650"
};

// Invented words — never a real lyric. Tapedeck caches fetched words but
// nothing here reproduces them, and the demo says so on the page.
export const LYRICS = [
  { t: 8, text: "The tape hiss holds the room a moment longer" },
  { t: 19, text: "Still can't find what keeps me here" },
  { t: 31, text: "When all this time I've been so hollow inside" },
  { t: 42, text: "I know you're still there" },
  { t: 51, text: "Watching the reel go round" },
  { t: 63, text: "I can feel you pull me down" }
];

export const LYRIC_SIDE = [
  { no: "1", title: "Long Way Down", len: "3:35" },
  { no: "2", title: "Hollow Tide", len: "3:57" },
  { no: "3", title: "Everybody's Fool Again", len: "3:16" },
  { no: "4", title: "Farther Away", len: "4:33" },
  { no: "5", title: "Haunted Room", len: "3:07" }
];
