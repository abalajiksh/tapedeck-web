<script>
	import { SOURCES, FORMATS, LINKS, RELIABILITY } from '$lib/featuresData.js';

	let srcIdx = $state(0);
	let fmtIdx = $state(3);
	let linkIdx = $state(0);

	const src = $derived(SOURCES[srcIdx]);
	const fmt = $derived(FORMATS[fmtIdx]);
	const link = $derived(LINKS[linkIdx]);
	const score = $derived(Math.max(0, fmt.base + link.pen));

	const jump = [
		['#ingest', 'Ingest'],
		['#sources', 'Sources'],
		['#quality', 'Audio quality'],
		['#analytics', 'Analytics'],
		['#writing', 'Writing & lyrics'],
		['#moving', 'Import & export'],
		['#reliability', 'Reliability']
	];
</script>

<svelte:head>
	<title>Features — Tapedeck</title>
	<meta
		name="description"
		content="Everything Tapedeck records — ingest, sources, audio quality scoring, analytics, writing, import and export, and what makes it trustworthy as a system of record."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<span class="tag tag-accent-2">Features</span>
		<h1>Everything Tapedeck records, and why it records it that way.</h1>
		<p class="lede">
			Each of these exists because a listening history that quietly guesses is worse than one that
			admits it doesn't know. Where a number is drawn from a narrower population than "everything you
			played", it says so.
		</p>
		<nav class="btn-row jump" aria-label="On this page">
			{#each jump as [href, label] (href)}
				<a class="btn btn-secondary" {href}>{label}</a>
			{/each}
		</nav>
	</div>
</header>

<section id="ingest" class="band surface">
	<div class="wrap">
		<h2 class="h2">Universal ingest, and a proxy in front of both</h2>
		<div class="grid-320 mt">
			<div>
				<p class="para">
					Tapedeck implements the ListenBrainz Core API endpoints a scrobble client actually
					exercises, so Pano Scrobbler, Web Scrobbler, multi-scrobbler and mpdscribble work out of
					the box. Point one at your URL, paste a token, done.
				</p>
				<p class="para">
					Beyond the spec it accepts extended fields for audio quality, device identification, chain
					tagging and session metadata — and reads them back in <code>additional_info</code>, so a
					listen round-trips intact.
				</p>
				<p class="para">
					<strong>It reads forgivingly.</strong> A track number may be <code>7</code> or
					<code>"7/12"</code>; anything unusable costs the track number and never the listen, because
					a whole batch failing over one cosmetic field is the worst possible trade.
				</p>
			</div>
			<div class="col">
				<div class="card elev-sm">
					<div class="card-kicker">Two deliberate differences</div>
					<div class="card-title">Reads need a token</div>
					<p class="card-body">
						On listenbrainz.org a user's listens are public. A self-hosted Tapedeck usually isn't, so
						these endpoints authenticate and return only your own data.
					</p>
				</div>
				<div class="card elev-sm">
					<div class="card-kicker">Two deliberate differences</div>
					<div class="card-title">No MSIDs</div>
					<p class="card-body">
						Listens are keyed by source rather than assigned recording MSIDs. Playlists, lb-radio and
						similar-users return a clean JSON 404 rather than a stub.
					</p>
				</div>
				<div class="card elev-sm">
					<div class="card-kicker">Forwarding</div>
					<div class="card-title">Strictly per user</div>
					<p class="card-body">
						Each account connects its own Last.fm and Libre.fm by OAuth and ListenBrainz by token.
						There are no server-wide credentials, so nothing leaks between users on a shared
						instance. Connect nothing and your listens simply stay local.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<section id="sources" class="band">
	<div class="wrap">
		<h2 class="h2">Where listens come from</h2>
		<p class="para wide mt-sm">
			Sources belong to a user, not to the server — each person connects their own token and Tapedeck
			records only that account's playback. As many as you like, of any kind, each with its own name,
			poll interval and filters. Polling is staggered so a household doesn't hit the same server on
			one tick.
		</p>
		<div class="pillrow mt" role="tablist" aria-label="Source">
			{#each SOURCES as s, i (s.name)}
				<button
					type="button"
					class="pill lg"
					role="tab"
					aria-selected={i === srcIdx}
					onclick={() => (srcIdx = i)}
					style:border-color={i === srcIdx ? 'var(--color-accent)' : 'var(--color-divider)'}
					style:background={i === srcIdx ? 'var(--color-accent)' : 'transparent'}
					style:color={i === srcIdx ? 'var(--color-bg)' : 'var(--color-text)'}>{s.name}</button
				>
			{/each}
		</div>
		<div class="src-split">
			<div class="src-panel">
				<div class="src-head">
					<h3 class="src-name">{src.name}</h3>
					<span
						class="tag"
						style:background={src.ok ? 'var(--color-accent-2-200)' : 'var(--color-accent-200)'}
						style:color={src.ok ? 'var(--color-accent-2-800)' : 'var(--color-accent-800)'}
						>{src.status}</span
					>
				</div>
				<p class="src-body">{src.body}</p>
				<p class="src-body">{src.body2}</p>
			</div>
			<div class="col tight">
				{#each src.facts as [k, v] (k)}
					<div class="fact">
						<span class="fact-k">{k}</span>
						<span class="fact-v">{v}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<section id="quality" class="band dark">
	<div class="wrap">
		<h2 class="h2 on-dark">Audio quality, scored 0–100</h2>
		<p class="para ink-2 wide mt-sm">
			Every scrobble can carry codec, sample rate, bit depth, DSD rate and delivery format. Tapedeck
			tracks source against delivered, so you know when your FLAC was degraded on the way out. Pick a
			format and a link to see what it scores.
		</p>
		<div class="q-grid">
			<div>
				<div class="eyebrow">Source file</div>
				<div class="pillrow">
					{#each FORMATS as f, i (f.label)}
						<button
							type="button"
							class="pill dark-pill"
							aria-pressed={i === fmtIdx}
							onclick={() => (fmtIdx = i)}
							style:border-color={i === fmtIdx ? 'var(--color-accent)' : '#4a4438'}
							style:background={i === fmtIdx ? 'var(--color-accent)' : 'transparent'}
							style:color={i === fmtIdx ? 'var(--color-neutral-900)' : 'var(--td-ink-2)'}
							>{f.label}</button
						>
					{/each}
				</div>
				<div class="eyebrow spaced">Delivered over</div>
				<div class="pillrow">
					{#each LINKS as l, i (l.label)}
						<button
							type="button"
							class="pill dark-pill"
							aria-pressed={i === linkIdx}
							onclick={() => (linkIdx = i)}
							style:border-color={i === linkIdx ? 'var(--color-accent-2-500)' : '#4a4438'}
							style:background={i === linkIdx ? 'var(--color-accent-2-500)' : 'transparent'}
							style:color={i === linkIdx ? 'var(--color-neutral-900)' : 'var(--td-ink-2)'}
							>{l.label}</button
						>
					{/each}
				</div>
			</div>
			<div class="scorecard">
				<div class="score-head">
					<div class="score-n">{score}</div>
					<div class="score-of">/ 100 delivered</div>
				</div>
				<div class="score-track"><div class="score-fill" style:width="{score}%"></div></div>
				<div class="score-lines">
					<div class="score-line"><span>Source — {fmt.label}</span><span class="push ink">+{fmt.base}</span></div>
					<div class="score-line">
						<span>Delivery — {link.label}</span>
						<span class="push" style:color={link.pen === 0 ? 'var(--td-ink)' : 'var(--color-accent-400)'}
							>{link.pen === 0 ? '±0' : link.pen}</span
						>
					</div>
					<div class="score-line">
						<span>{link.transcode ? 'Marked as degraded' : 'Source quality preserved'}</span>
						<span
							class="push"
							style:color={link.transcode ? 'var(--color-accent-400)' : 'var(--color-accent-2-400)'}
							>{link.transcode ? 'yes' : 'no'}</span
						>
					</div>
				</div>
				<p class="score-note">{link.note}</p>
			</div>
		</div>
		<p class="fine wide mt">
			Hours on each piece of gear are derived from listens rather than accumulated as they arrive, so
			assigning a chain to a device moves the wear for plays you already have. Skips count for nothing
			— crediting a pair of headphones with a full running time for three seconds of audio is not a
			measurement.
		</p>
	</div>
</section>

<section id="analytics" class="band">
	<div class="wrap">
		<h2 class="h2">Four ways of looking at the same history</h2>
		<div class="grid-260 mt">
			<div class="card elev-sm pad">
				<div class="card-kicker">Statistics</div>
				<div class="card-title">Ranged totals and a personality</div>
				<p class="card-body">
					Top artists, records and tracks side by side, a listening clock in your own timezone,
					language and decade breakdowns, and five explainable axes that name you. All local — no
					external call, and never a percentile against other people.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Top Charts</div>
				<div class="card-title">Timeframe-ranged, honestly bounded</div>
				<p class="card-body">
					"Various Artists" never appears as an artist anywhere: it is a filing convention meaning
					<em>look at the track</em>. The plays still count in every total, so 50 plays and 1 artist
					can both be true.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Reports</div>
				<div class="card-title">Chapters, not one card resized</div>
				<p class="card-body">
					A month gets the full treatment; a week the compact one, because seven days make a thin
					hour-of-day distribution; a year is a bento built around a twelve-month line with the prior
					year behind it. Folded from one pass over the history.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Genre Map</div>
				<div class="card-title">Placed on Every Noise at Once</div>
				<p class="card-body">
					Your listening on Glenn McDonald's map of the genre space, with a taste trajectory over
					time and the regions bordering what you already play. <strong>A placeholder</strong> until
					the <a href="/plugins/audio-analysis/">analysis plugin</a> computes per-recording features from
					your real files.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Rediscovery</div>
				<div class="card-title">Collections from your own history</div>
				<p class="card-body">
					Forgotten favourites, loved but barely played, one-listen records, seasonal, deep cuts, the
					3 AM club, dusty vinyl, and never heard on a particular pair of headphones. Nothing here
					recommends music you don't own.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Playlist Lab</div>
				<div class="card-title">Ten dimensions, three ways through</div>
				<p class="card-body">
					Similar songs, a dimensional crawl between seeds, or a rollercoaster along whichever axis
					you pick. A <em>Judge by</em> slider weights genre-space against your own listening, because
					otherwise "similar" drifts toward "played at the same hour".
				</p>
			</div>
		</div>
		<div class="callout">
			<div class="callout-t">A month can be shared as an image, and it is drawn on the server</div>
			<p class="callout-b">
				Story, square or wide. The fonts are embedded in the binary and nothing is fetched, so the
				same month produces the same picture from any client — and a phone app asks
				<code>GET /api/v1/reports/image</code> rather than reimplementing a layout that would drift from
				this one.
			</p>
		</div>
	</div>
</section>

<section id="writing" class="band surface">
	<div class="wrap">
		<h2 class="h2">Writing, loving, and the language a title cannot give</h2>
		<div class="grid-300 mt">
			<div>
				<h3 class="h3">Liner Notes</h3>
				<p class="para sm">
					Markdown kept next to the music, about a track, a release, an artist, or one particular
					playing. Edited in place with every earlier version archived. Rendered and sanitised
					server-side, so shortcode resolution happens in the same pass and notes are safe to display
					anywhere.
				</p>
				<p class="para sm">
					Searchable across both what you wrote and what you wrote it about, filterable by kind,
					sortable by edit, by date written or alphabetically.
				</p>
			</div>
			<div>
				<h3 class="h3">Loved</h3>
				<p class="para sm">
					Every heart in one place — tracks, records <em>and</em> artists, since a love attaches to an
					entity rather than only a song. A recording love mirrors out to Last.fm and ListenBrainz;
					albums and artists stay local because neither service has the concept.
				</p>
				<p class="para sm">
					Loves you already have on those services can be pulled back in from Settings →
					Connections.
				</p>
			</div>
			<div>
				<h3 class="h3">Lyrics</h3>
				<p class="para sm">
					Fetched from LRCLIB for one reason: script detection settles any non-Latin title and gives
					up on a romanised one. Three outcomes, all real answers — a language by script weight,
					<em>instrumental</em> when the track has no words, or nothing at all for a Latin lyric,
					because guessing French is the mistake the fidelity cards were fixed for.
				</p>
				<p class="para sm">
					Cached outside the backup, never redistributed. A note quotes a line by <em>index</em>,
					never by its words.
				</p>
				<p class="para sm">
					When words are present there is a <strong>lyrics theatre</strong> — current line large, the
					rest falling away, following the clock when they're timed. It exists for the listening you
					can't touch: a side is playing and your hands are on a record.
				</p>
			</div>
		</div>
	</div>
</section>

<section id="moving" class="band">
	<div class="wrap">
		<h2 class="h2">Bringing a history in, and taking it away</h2>
		<div class="scroll-x mt">
			<table class="table wide-table">
				<thead>
					<tr><th>Format</th><th>What comes across</th><th>What it costs</th></tr>
				</thead>
				<tbody>
					<tr>
						<td>ListenBrainz export <code>.zip</code></td>
						<td>Listens and loved tracks, with MusicBrainz IDs and cover-art references already in it</td>
						<td><span class="tag tag-accent-2">No lookups at all</span></td>
					</tr>
					<tr>
						<td>Spotify extended history <code>.zip</code></td>
						<td>
							Re-anchored to when tracks <em>started</em>, durations recovered for ~93% of rows, skips
							judged by your own threshold
						</td>
						<td><span class="tag tag-accent">Real enrichment work</span></td>
					</tr>
					<tr>
						<td>Last.fm / ListenBrainz by username</td>
						<td>Public listens, pulled and deduplicated</td>
						<td><span class="tag tag-neutral">Background job</span></td>
					</tr>
					<tr>
						<td>Rockbox <code>.scrobbler.log</code></td>
						<td>
							Track numbers, lengths, any MusicBrainz IDs the player recorded; skips kept but never
							counted
						</td>
						<td><span class="tag tag-neutral">Asks the device's timezone</span></td>
					</tr>
					<tr>
						<td><code>.json</code> / <code>.jsonl</code> / <code>.csv</code></td>
						<td>Whatever the file carries, validated on the same path a live client takes</td>
						<td><span class="tag tag-neutral">Background job</span></td>
					</tr>
					<tr>
						<td>One pasted listen</td>
						<td>A ListenBrainz-shaped body, on the Import screen</td>
						<td><span class="tag tag-neutral">Instant</span></td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="grid-280 mt">
			<div class="card elev-sm">
				<div class="card-title">Export</div>
				<p class="card-body">
					Your entire history as JSON or CSV, and a consistent <code>VACUUM INTO</code> backup of the
					whole database — safe to take while running.
				</p>
			</div>
			<div class="card elev-sm">
				<div class="card-title">Notes as Markdown</div>
				<p class="card-body">
					One file per note with YAML frontmatter, or a single document. Drop it in an Obsidian or
					Logseq vault and <code>[[track:…]]</code> arrives as working wikilinks.
				</p>
			</div>
			<div class="card elev-sm">
				<div class="card-title">Imports never re-forward</div>
				<p class="card-body">
					Stored as imports, so a backfill of old history is never pushed onward onto a permanent
					public record.
				</p>
			</div>
		</div>
	</div>
</section>

<section id="reliability" class="band surface">
	<div class="wrap">
		<h2 class="h2">Trusted as a system of record</h2>
		<div class="grid-280 mt">
			{#each RELIABILITY as r (r.title)}
				<div class="card elev-sm pad-sm">
					<div class="card-title">{r.title}</div>
					<p class="card-body">{r.body}</p>
				</div>
			{/each}
		</div>
		<div class="grid-300 mt-lg">
			<div>
				<h3 class="h3">Token scopes, none implying another</h3>
				<table class="table mt-sm">
					<thead>
						<tr><th>Scope</th><th>What it allows</th></tr>
					</thead>
					<tbody>
						<tr><td><code>submit</code></td><td>Submit listens and nothing else — what every scrobble client holds</td></tr>
						<tr><td><code>read</code></td><td>History, stats, loves, notes, now-playing, chains, gear</td></tr>
						<tr><td><code>write</code></td><td>Loves, notes, editing or deleting a listen</td></tr>
						<tr><td><code>all</code></td><td>read + write</td></tr>
					</tbody>
				</table>
				<p class="para sm mt-sm">
					<code>submit</code> deliberately does not imply <code>read</code>: a token on a phone that
					gets lost must not be able to read the history it is appending to. A valid token missing a
					scope gets <strong>403, not 401</strong> — a 401 would send a client into a refresh loop it
					cannot win.
				</p>
			</div>
			<div>
				<h3 class="h3">Permanently session-only</h3>
				<p class="para sm">
					Whatever scopes a token carries: everything under <code>/admin/</code>, plus sources,
					service connections, Discogs settings, export and backup, the metadata sanitiser, the
					enrichment jobs, and clearing every listen — the one operation a lost phone could make
					unrecoverable.
				</p>
				<h3 class="h3 mt-lg">One spec, served by the binary</h3>
				<p class="para sm">
					The whole API is in <code>openapi.yaml</code>, served unauthenticated at
					<code>/api/openapi.yaml</code> by every running instance — so it describes <em>that</em>
					instance at <em>that</em> version. A drift test walks every route in both directions, so the
					build fails rather than sending you to an endpoint that 404s.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band dark cta">
	<div class="wrap center">
		<h2 class="h2 on-dark">Read the deep dives</h2>
		<div class="btn-row center mt">
			<a class="btn accent-btn" href="/shelf/">The Shelf</a>
			<a class="btn outline-btn" href="/patch/">Patch</a>
			<a class="btn outline-btn" href="/docs/">Docs &amp; API</a>
		</div>
	</div>
</section>

<style>
	.jump {
		margin-top: 32px;
		gap: 10px;
	}
	.mt {
		margin-top: 26px;
	}
	.mt-sm {
		margin-top: 14px;
	}
	.mt-lg {
		margin-top: 34px;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.col.tight {
		gap: 10px;
	}
	.pad {
		padding: 26px;
	}
	.pad-sm {
		padding: 24px;
	}
	.center {
		text-align: center;
	}
	code {
		font-size: 0.9em;
		background: var(--color-neutral-200);
		padding: 2px 7px;
		border-radius: 6px;
	}
	.band.dark code {
		background: #332f27;
	}

	/* sources */
	.src-split {
		margin-top: 22px;
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		gap: 22px;
		align-items: start;
	}
	.src-panel {
		padding: 30px 34px;
		border-radius: 28px;
		background: var(--color-surface);
	}
	.src-head {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.src-name {
		font-size: 27px;
		margin: 0;
	}
	.src-body {
		margin-top: 12px;
		font-size: 16.5px;
		color: var(--color-neutral-700);
		text-wrap: pretty;
	}
	.fact {
		display: flex;
		gap: 14px;
		padding: 13px 18px;
		border-radius: 18px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
	}
	.fact-k {
		font-size: 12px;
		color: var(--color-neutral-600);
		min-width: 104px;
	}
	.fact-v {
		font-size: 13.5px;
	}

	/* quality */
	.q-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 26px;
		margin-top: 34px;
		align-items: start;
	}
	.eyebrow.spaced {
		margin-top: 24px;
	}
	.q-grid .eyebrow {
		margin-bottom: 10px;
	}
	.dark-pill {
		color: var(--td-ink-2);
	}
	.scorecard {
		padding: 30px;
		border-radius: 28px;
		background: #2a2721;
		border: 1px solid #3f3a31;
	}
	.score-head {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}
	.score-n {
		font-family: var(--font-heading);
		font-size: 62px;
		line-height: 1;
		color: var(--color-accent-300);
	}
	.score-of {
		font-size: 14px;
		color: var(--color-neutral-400);
	}
	.score-track {
		height: 8px;
		border-radius: 999px;
		background: #3a352c;
		margin-top: 16px;
		overflow: hidden;
	}
	.score-fill {
		height: 100%;
		background: var(--color-accent);
	}
	.score-lines {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.score-line {
		display: flex;
		font-size: 13.5px;
		color: var(--td-ink-2);
	}
	.score-note {
		margin: 20px 0 0;
		font-size: 12.5px;
		color: var(--color-neutral-500);
	}

	/* analytics callout */
	.callout {
		margin-top: 22px;
		padding: 26px 30px;
		border-radius: 26px;
		background: var(--td-band-2);
		border: 1px solid var(--td-band-2-edge);
	}
	.callout-t {
		font-family: var(--font-heading);
		font-size: 20px;
		color: var(--td-band-2-ink);
	}
	.callout-b {
		margin: 8px 0 0;
		font-size: 15px;
		color: var(--td-band-2-ink);
		opacity: 0.85;
		max-width: 78ch;
		text-wrap: pretty;
	}
	.callout code {
		background: color-mix(in srgb, var(--td-band-2-ink) 12%, transparent);
	}

	.wide-table {
		min-width: 640px;
	}

	@media (max-width: 860px) {
		.src-split {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
