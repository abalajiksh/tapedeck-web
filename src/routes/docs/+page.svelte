<script>
	import { CLIENTS, SUBMIT, SCOPES } from '$lib/docsData.js';

	let { data } = $props();

	let clientIdx = $state(0);
	const client = $derived(CLIENTS[clientIdx]);

	// The version comes from the latest Codeberg tag at build time; if that
	// lookup failed, show the placeholder rather than a stale number.
	const ENV = $derived(`PORT=8080
HOST=0.0.0.0
SQLITE_DB_PATH=./tapedeck.db
RUST_LOG=info
MUSICBRAINZ_USER_AGENT=Tapedeck/${data.version ?? '<version>'} ( you@example.com )`);

	const NP = `GET /public/np/<username>

{{< tapedeck-now-playing
     src="https://tapedeck.example.com/public/np/you" >}}`;
</script>

<svelte:head>
	<title>Docs — Tapedeck</title>
	<meta
		name="description"
		content="Build and run Tapedeck, connect a scrobble client, submit a listen with the extended fields, and understand its auth model."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<span class="tag tag-accent">Docs</span>
		<h1>From a clone to a deck with your history on it.</h1>
		<p class="lede">
			Almost nothing is configured in files. Scrobble connections and media sources are per user, set
			in the UI, and applied within a poll interval without a restart.
		</p>
	</div>
</header>

<section class="band top-flush">
	<div class="wrap grid-320 gap-22">
		<div>
			<h2 class="h2 sm">Build and run</h2>
			<p class="para sm">
				<code>cargo build</code> is the whole build: <code>build.rs</code> compiles the SvelteKit UI
				and <code>rust-embed</code> bakes it into the binary, so a fresh clone compiles.
			</p>
			<div class="term">
				<div><span class="prompt">$</span> git clone https://codeberg.org/abksh/tapedeck.git</div>
				<div><span class="prompt">$</span> cd tapedeck</div>
				<div><span class="prompt">$</span> cargo build --release</div>
				<div><span class="prompt">$</span> ./tapedeck</div>
				<div class="term-ok">📋 Visit the web UI to complete setup.</div>
			</div>
			<p class="para xs">
				Open <code>http://your-server:8080</code> and it redirects to <code>/setup</code> to name the
				admin account and set a password. Nothing to copy out of a console.
			</p>
			<p class="para xs">
				Bun is required for every cargo invocation, including <code>check</code> and
				<code>clippy</code>. For Rust-only work against an existing <code>static/</code>, set
				<code>TAPEDECK_SKIP_WEB_BUILD=1</code>. A Docker image is
				<a href="/plugins/">in development</a>.
			</p>
		</div>
		<div>
			<h2 class="h2 sm">Requirements</h2>
			<div class="reqs">
				<div class="req">Rust 1.85+ — the SVG renderer behind report images sets the floor</div>
				<div class="req">Bun, to build the embedded web UI</div>
				<div class="req">
					A Plex, Navidrome, Jellyfin, Emby or Roon server — optional; the ingest API works standalone
				</div>
				<div class="req">A ListenBrainz / Last.fm / Libre.fm account — optional, connected per user</div>
			</div>
			<div class="little">
				<div class="little-t">It runs on very little</div>
				<p class="little-b">
					<strong>512 MB of RAM and four ARM cores.</strong> The public demo at
					<a href="https://demo.tapedeck.cc" rel="noopener">demo.tapedeck.cc</a> is a Raspberry Pi
					Zero 2 W with a 64 GB SD card, passively cooled — one binary, one SQLite file, no fan. That
					is the running requirement; <em>building</em> on it is another matter, so compile
					elsewhere and copy the binary across.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band surface">
	<div class="wrap">
		<h2 class="h2 mid">Connect a client</h2>
		<p class="para sm wide-62 mt-xs">
			Mint a token in Settings → API Tokens, give it the chain that app plays through, and point the
			client at your URL. That is the whole setup — the app itself needs no Tapedeck-specific
			configuration.
		</p>
		<div class="pillrow mt" role="tablist" aria-label="Client">
			{#each CLIENTS as c, i (c.label)}
				<button
					type="button"
					class="pill lg"
					role="tab"
					aria-selected={i === clientIdx}
					onclick={() => (clientIdx = i)}
					style:border-color={i === clientIdx ? 'var(--color-accent)' : 'var(--color-divider)'}
					style:background={i === clientIdx ? 'var(--color-accent)' : 'transparent'}
					style:color={i === clientIdx ? 'var(--color-bg)' : 'var(--color-text)'}>{c.label}</button
				>
			{/each}
		</div>
		<div class="client-split">
			<div class="steps-card">
				<h3 class="client-name">{client.name}</h3>
				<div class="steps">
					{#each client.steps as step, i (step)}
						<div class="step">
							<span class="step-n">{i + 1}</span>
							<span class="step-t">{step}</span>
						</div>
					{/each}
				</div>
				<p class="client-note">{client.note}</p>
			</div>
			<div class="code-panel wrap-code">{client.code}</div>
		</div>
	</div>
</section>

<section class="band">
	<div class="wrap">
		<h2 class="h2 mid">Submitting a listen with everything attached</h2>
		<p class="para sm wide-64 mt-xs">
			Three extended objects live in <code>additional_info</code> beyond the ListenBrainz spec and
			round-trip intact — alongside the spec's own MusicBrainz ids, which are stored in full rather
			than the two or three most clients bother with. This is the shape a plugin writes.
		</p>
		<div class="code-panel pre mt">{SUBMIT}</div>
		<div class="grid-260 mt-sm">
			<div class="card elev-sm">
				<div class="card-title"><code>tapedeck_audio</code></div>
				<p class="card-body">
					Codec, sample rate, bit depth, channels, DSD rate, lossless flag and delivery format. Feeds
					the 0–100 quality score and the source-versus-delivered comparison.
				</p>
			</div>
			<div class="card elev-sm">
				<div class="card-title"><code>tapedeck_device</code></div>
				<p class="card-body">
					Player name, platform, machine id and — the useful one — <code>output_device</code>. Every
					distinct output is auto-learned and mapped to a chain once.
				</p>
			</div>
			<div class="card elev-sm">
				<div class="card-title">MusicBrainz ids</div>
				<p class="card-body">
					Plain ListenBrainz fields, but the tagged-file ones no media server exposes:
					<code>release_group_mbid</code> groups the reissues, <code>work_mbid</code> ties every
					performance of one composition together. Send them if your files carry them.
				</p>
			</div>
			<div class="card elev-sm">
				<div class="card-title"><code>tapedeck_chain</code></div>
				<p class="card-body">
					Names a chain outright when the client knows it. Rung one of the ladder, and the only one
					that is evidence about this particular listen.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band dark">
	<div class="wrap">
		<h2 class="h2 mid on-dark">Auth, in two credentials that are not interchangeable</h2>
		<div class="grid-300 mt">
			<div>
				<p class="para ink-2 sm-plus">
					A <strong>session</strong> — the <code>td_session</code> cookie from the web UI — can do
					everything. An <strong>API token</strong> carries explicit scopes, and none of them implies
					another. Matching is exact, so a scope of <code>rewrite</code> does not grant
					<code>write</code>.
				</p>
				<div class="scopes">
					{#each SCOPES as [k, v] (k)}
						<div class="scope">
							<code class="scope-k">{k}</code>
							<span class="scope-v">{v}</span>
						</div>
					{/each}
				</div>
				<p class="fine mt-sm">
					A valid token missing the needed scope gets <strong>403, not 401</strong> — it authenticated
					fine, and a 401 would send a client into a refresh loop it cannot win.
				</p>
			</div>
			<div>
				<h3 class="h3 ink">Permanently session-only</h3>
				<p class="para ink-2 sm-plus">
					Whatever scopes a token carries: everything under <code>/admin/</code>, plus sources,
					service connections, Discogs settings, export and backup, the metadata sanitiser, the
					enrichment jobs, and clearing every listen.
				</p>
				<h3 class="h3 ink spaced">The spec is served by the binary</h3>
				<p class="para ink-2 sm-plus">
					<code>GET /api/openapi.yaml</code>, deliberately unauthenticated — it documents shapes, not
					data, and a client has to read it before it has a credential. A drift test walks every route
					in both directions, so the build fails rather than sending you to an endpoint that 404s.
				</p>
				<h3 class="h3 ink spaced">Credentials at rest</h3>
				<p class="para ink-2 sm-plus">
					Anything Tapedeck has to replay is encrypted with a key held outside the database —
					<code>tapedeck.key</code> or <code>TAPEDECK_SECRET_KEY</code>. Back it up separately, never
					inside a database snapshot, which would defeat the point.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band">
	<div class="wrap">
		<h2 class="h2 mid">Connect an AI assistant</h2>
		<p class="para sm wide-64 mt-xs">
			Tapedeck speaks the Model Context Protocol. For a local client, mint a credential in Settings →
			AI Connections and point it at <code>https://your-tapedeck/mcp</code>. For a hosted one, give it
			the same address and approve the OAuth request when it appears.
		</p>
		<div class="scroll-x mt">
			<table class="table grants-table">
				<thead>
					<tr><th>Grant</th><th>What it allows</th></tr>
				</thead>
				<tbody>
					<tr><td><code>listening:read</code></td><td>History, statistics, reports, sessions, skips, the genre map</td></tr>
					<tr><td><code>library:read</code></td><td>Gear, signal chains, the shelf, loves, the Crate, liner notes</td></tr>
					<tr><td><code>playlists:write</code></td><td>Save playlists into Tapedeck for you to review</td></tr>
					<tr><td><code>playlists:push</code></td><td>Send them on to your media server</td></tr>
					<tr><td><code>loves:write</code></td><td>Love and unlove</td></tr>
					<tr><td><code>notes:write</code></td><td>Write liner notes, recorded as written by that connection</td></tr>
					<tr><td><code>crate:write</code></td><td>Suggest a record you don't own — into the Crate and nowhere else</td></tr>
				</tbody>
			</table>
		</div>
		<p class="para sm wide-70 mt-sm">
			All seven are off by default. Twenty-six tools, all of them the same queries the web UI uses.
			The one to know about is <code>listening_profile</code>: it reports how much of your history
			carries each kind of metadata and the assistant is told to call it first — which is what stops
			"4% lossless" being said about a history where the format is simply unknown for 97% of listens.
		</p>
		<p class="para sm wide-70">
			Tested against a hosted Claude subscription over OAuth and Mistral Chat on the free tier — one
			after the <code>initialize</code> handshake older revisions use, one on the stateless shape. Any
			other MCP client should work; none has been tried.
		</p>
	</div>
</section>

<section class="band surface">
	<div class="wrap grid-320">
		<div>
			<h2 class="h2 sm">What's left in files</h2>
			<p class="para sm">
				Only infrastructure that has to exist before the UI can be served. Copy
				<code>.env.example</code> to <code>.env</code>, or <code>tapedeck.toml.example</code> to
				<code>tapedeck.toml</code> — precedence is env &gt; <code>.env</code> &gt; TOML.
			</p>
			<div class="code-panel pre mt-xs">{ENV}</div>
			<p class="para xs">
				Optional service credentials — Discogs, Apple Music, a metrics token — are all optional and
				unconfigured is a normal state: the provider steps aside rather than erroring.
			</p>
		</div>
		<div>
			<h2 class="h2 sm">Your listening on your own site</h2>
			<p class="para sm">
				One endpoint answers without a credential, and it is off until you switch it on. Title,
				artist and record are the whole of it by default; cover, position, format and chain are four
				separate switches.
			</p>
			<div class="code-panel wrap-code accent mt-xs">{NP}</div>
			<p class="para xs">
				It never reads your history — the deck is one track held in memory. A username that doesn't
				exist and one that hasn't published return the <em>same</em> 404, so nobody can use it to find
				out who has an account on your instance.
			</p>
		</div>
	</div>
</section>

<section class="band dark">
	<div class="wrap center">
		<h2 class="h2 on-dark cta-h">Try it before you build it</h2>
		<p class="cta-p">
			The demo instance runs the real binary on a passively-cooled Pi Zero 2 W, with eight years of
			generated listening on it.
		</p>
		<div class="btn-row center mt">
			<a class="btn accent-btn" href="https://demo.tapedeck.cc" rel="noopener">Open the demo</a>
			<a class="btn outline-btn" href="https://codeberg.org/abksh/tapedeck" rel="noopener">Get the source</a>
		</div>
	</div>
</section>

<style>
	h1 {
		font-size: clamp(40px, 4.6vw, 62px);
		letter-spacing: -0.03em;
		line-height: 1.03;
		margin: 18px 0 0;
		max-width: 18ch;
	}
	.lede {
		max-width: 58ch;
		margin-top: 18px;
	}
	.band.top-flush {
		padding-top: 0;
		padding-bottom: 72px;
	}
	.gap-22 {
		gap: 22px;
	}
	.h2.sm {
		font-size: 30px;
	}
	.h2.mid {
		font-size: 34px;
	}
	.h3 {
		font-size: 22px;
	}
	.h3.spaced {
		margin-top: 26px;
	}
	.para.sm-plus {
		font-size: 15.5px;
	}
	.para.xs {
		font-size: 14px;
		color: var(--color-neutral-700);
		margin-top: 12px;
	}
	.wide-62 {
		max-width: 62ch;
	}
	.wide-64 {
		max-width: 64ch;
	}
	.wide-70 {
		max-width: 70ch;
	}
	.mt {
		margin-top: 24px;
	}
	.mt-xs {
		margin-top: 14px;
	}
	.mt-sm {
		margin-top: 18px;
	}
	.center {
		text-align: center;
	}
	.cta-h {
		font-size: clamp(30px, 3.6vw, 44px);
	}
	.cta-p {
		font-size: 17px;
		color: var(--color-neutral-400);
		max-width: 52ch;
		margin: 14px auto 0;
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

	/* ── code panels ──────────────────────────────────── */
	.term,
	.code-panel {
		border-radius: 26px;
		background: var(--color-neutral-900);
		color: var(--td-ink-2);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		overflow-x: auto;
	}
	.term {
		margin-top: 16px;
		padding: 22px 24px;
		font-size: 13.5px;
		line-height: 2;
	}
	.prompt {
		color: var(--color-neutral-600);
	}
	.term-ok {
		color: var(--color-accent-300);
		margin-top: 8px;
	}
	.code-panel {
		padding: 24px 26px;
		font-size: 13px;
		line-height: 1.85;
	}
	.code-panel.pre {
		white-space: pre;
		line-height: 1.8;
		padding: 26px 30px;
		border-radius: 28px;
	}
	.code-panel.wrap-code {
		white-space: pre-wrap;
	}
	.code-panel.accent {
		color: var(--color-accent-200);
		line-height: 1.9;
	}

	/* ── requirements ─────────────────────────────────── */
	.reqs {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 14px;
	}
	.req {
		padding: 14px 18px;
		border-radius: 20px;
		background: var(--color-surface);
		font-size: 14.5px;
	}
	.little {
		margin-top: 18px;
		padding: 22px 24px;
		border-radius: 26px;
		background: var(--td-band-2);
		border: 1px solid var(--td-band-2-edge);
	}
	.little-t {
		font-family: var(--font-heading);
		font-size: 19px;
		color: var(--td-band-2-ink);
	}
	.little-b {
		margin: 8px 0 0;
		font-size: 14.5px;
		color: var(--td-band-2-ink);
		opacity: 0.85;
		text-wrap: pretty;
	}
	.little-b a {
		color: var(--td-band-2-ink);
	}

	/* ── client setup ─────────────────────────────────── */
	.client-split {
		margin-top: 20px;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 22px;
		align-items: start;
	}
	.steps-card {
		padding: 26px 30px;
		border-radius: 28px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
	}
	.client-name {
		font-size: 23px;
		margin: 0;
	}
	.steps {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 16px;
	}
	.step {
		display: flex;
		gap: 14px;
		align-items: flex-start;
	}
	.step-n {
		display: grid;
		place-items: center;
		flex: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-accent-200);
		color: var(--color-accent-800);
		font-size: 12px;
		font-family: var(--font-heading);
	}
	.step-t {
		font-size: 15px;
	}
	.client-note {
		margin: 18px 0 0;
		font-size: 13.5px;
		color: var(--color-neutral-700);
	}

	/* ── scopes ───────────────────────────────────────── */
	.scopes {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 18px;
	}
	.scope {
		display: flex;
		gap: 16px;
		padding: 13px 18px;
		border-radius: 18px;
		background: #2a2721;
	}
	.scope-k {
		flex: none;
		min-width: 64px;
		color: var(--color-accent-300);
		background: none;
		padding: 0;
	}
	.scope-v {
		font-size: 13.5px;
		color: var(--td-ink-2);
	}
	.band.dark .fine {
		color: var(--color-neutral-400);
	}

	.grants-table {
		min-width: 620px;
	}

	@media (max-width: 860px) {
		.client-split {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
