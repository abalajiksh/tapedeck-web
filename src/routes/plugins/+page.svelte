<script>
	let { data } = $props();

	let cat = $state('All');
	const shown = $derived(
		cat === 'All' ? data.plugins : data.plugins.filter((p) => p.category === cat)
	);

	const stat = (key) => data.status[key];
	const cardBg = (p) => (p.status === 'shipped' ? 'var(--color-surface)' : 'var(--color-neutral-100)');
	const cardBorder = (p) => (p.status === 'dev' ? 'var(--color-accent-300)' : 'var(--color-divider)');
</script>

<svelte:head>
	<title>Plugins & clients — Tapedeck</title>
	<meta
		name="description"
		content="Every plugin and client that talks to a Tapedeck deck, with an honest status on each."
	/>
</svelte:head>

<header class="hd">
	<div class="wrap">
		<span class="tag tag-accent-2">Plugins &amp; clients</span>
		<h1>The deck is the server. These are the things that talk to it.</h1>
		<p class="lede">
			Anything speaking the ListenBrainz Core API already works with a URL and a token. A plugin
			exists where that isn't enough — where a player knows something the wire format has no field
			for: the output device, the real signal path, the file that was actually decoded.
		</p>
		<p class="sub">
			Every status below is honest. Some of it works today, plenty of it does not yet, and the page
			says which is which.
		</p>
	</div>
</header>

<section class="listing">
	<div class="wrap">
		<div class="filters" role="group" aria-label="Filter plugins by category">
			{#each data.categories as c (c)}
				<button
					type="button"
					aria-pressed={cat === c}
					onclick={() => (cat = c)}
					style:border-color={cat === c ? 'var(--color-accent)' : 'var(--color-divider)'}
					style:background={cat === c ? 'var(--color-accent)' : 'transparent'}
					style:color={cat === c ? 'var(--color-bg)' : 'var(--color-text)'}>{c}</button
				>
			{/each}
		</div>

		<div class="grid">
			{#each shown as p (p.slug)}
				<article class="pcard" style:background={cardBg(p)} style:border-color={cardBorder(p)}>
					<div class="top">
						<span class="tag" style:background={stat(p.status).bg} style:color={stat(p.status).fg}
							>{stat(p.status).label}</span
						>
						<span class="kind">{p.kind}</span>
					</div>
					<h2 class="pname">
						{#if p.hasPage}
							<a href="/plugins/{p.slug}/">{p.name}</a>
						{:else}
							{p.name}
						{/if}
					</h2>
					{#if p.by}<div class="by">{p.by}</div>{/if}
					<p class="body">{p.summary}</p>
					{#if p.adds}
						<div class="adds"><strong>What it adds:</strong> {p.adds}</div>
					{/if}
					<div class="actions">
						{#if p.hasPage}
							<a class="btn btn-secondary" href="/plugins/{p.slug}/">Read more</a>
						{/if}
						{#if p.link}
							<a class="btn btn-ghost" href={p.link} rel="noopener">{p.linkLabel}</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>

		{#if shown.length === 0}
			<p class="empty">Nothing in {cat} yet.</p>
		{/if}

		<p class="note">
			Writing one? A plugin is any client that submits to <code>/1/submit-listens</code> with
			Tapedeck's extended fields — <code>tapedeck_audio</code>, <code>tapedeck_device</code>,
			<code>tapedeck_chain</code>. The whole shape is in <a href="/docs/">the API docs</a>, and every
			running instance serves its own spec at <code>/api/openapi.yaml</code>.
		</p>
	</div>
</section>

<section class="dark">
	<div class="wrap">
		<span class="tag" style="background:var(--color-accent-800); color:var(--color-accent-200)"
			>In development</span
		>
		<h2 class="dh">Analysis that reads the music, not just the metadata.</h2>
		<div class="two">
			<div>
				<p class="dp">
					The Genre Map and Playlist Lab today are built on <strong>Every Noise at Once</strong>,
					which places <em>artists</em>. That is a real map and a useful one, but it means every
					track by one artist shares the same six sound coordinates — the four listening axes are
					all that separate them. Tapedeck has always said so rather than dressing it up as
					per-recording audio analysis.
				</p>
				<p class="dp">
					<strong>They are a placeholder.</strong> The replacement is an analysis plugin that computes
					multidimensional features from the actual audio files, reaching them through the library you
					already run — Plex, Jellyfin and the OpenSubsonic API. The server keeps the coordinates; the
					plugin does the decoding, near the files, where the bandwidth already is.
				</p>
				<p class="dp">
					When it lands, a track gets its own position rather than inheriting its artist's, and
					"similar" stops meaning "by someone adjacent".
				</p>
			</div>
			<div class="panel">
				<div class="eyebrow">Where the coordinates come from</div>
				<div class="rows">
					<div class="row">
						<span class="tag" style="background:#3d372c; color:var(--td-ink-2); flex:none">Today</span>
						<span
							>Six axes from Every Noise, through the artist. Four from your own listening — era,
							familiarity, hour of day, recency.</span
						>
					</div>
					<div class="row">
						<span
							class="tag"
							style="background:var(--color-accent-800); color:var(--color-accent-200); flex:none"
							>Next</span
						>
						<span
							>Per-recording features computed from the file itself, via a plugin sitting beside your
							Plex, Jellyfin or OpenSubsonic library.</span
						>
					</div>
				</div>
				<p class="fine">
					Tracks with no place on the map are dropped and counted, never parked in the middle. That
					rule survives the change.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="apps">
	<div class="wrap">
		<h2 class="h2">One server of record, many ways in.</h2>
		<p class="lede2">
			Desktop and TV apps are planned as both a client for your deck and a standalone instance in
			their own right. Several instances can share users and secrets and merge — but the self-hosted
			server stays the <strong>ultimate source of truth</strong>. Anything else is a cache with a
			nice screen on it.
		</p>
		<div class="appgrid">
			{#each data.apps as a (a.name)}
				<div class="card elev-sm appcard">
					<span class="tag" style:background={stat(a.status).bg} style:color={stat(a.status).fg}
						>{stat(a.status).label}</span
					>
					<div class="card-title">{a.name}</div>
					<p class="card-body">{a.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="road">
	<div class="wrap">
		<h2 class="h2">On the roadmap</h2>
		<p class="lede2">In rough order of how close each one is.</p>
		<div class="roadlist">
			{#each data.roadmap as r (r.title)}
				<div class="ritem">
					<span class="tag" style:background={stat(r.status).bg} style:color={stat(r.status).fg}
						>{stat(r.status).label}</span
					>
					<span class="rtext">
						<span class="rtitle">{r.title}</span>
						<span class="rbody">{r.body}</span>
					</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="cta">
	<div class="wrap center">
		<h2 class="ch">Building something that should talk to a deck?</h2>
		<p class="cp">
			The API is documented by the binary that serves it, and the extended fields are stable. To get
			listed here, add a folder to this site's plugin registry and open a pull request — no site code
			to touch.
		</p>
		<div class="cbtns">
			<a class="btn primary" href="https://github.com/abalajiksh/tapedeck-web#adding-your-plugin-to-the-site" rel="noopener"
				>List your plugin</a
			>
			<a class="btn outline" href="https://codeberg.org/abksh/tapedeck" rel="noopener">Codeberg</a>
			<a class="btn outline" href="/docs/">API docs</a>
		</div>
	</div>
</section>

<style>
	.wrap {
		max-width: 1180px;
		margin: 0 auto;
	}
	.hd {
		padding: 80px 32px 48px;
	}
	h1 {
		font-size: clamp(40px, 4.8vw, 66px);
		letter-spacing: -0.03em;
		line-height: 1.03;
		margin: 18px 0 0;
		max-width: 17ch;
	}
	.lede {
		font-size: 19px;
		max-width: 60ch;
		margin-top: 20px;
		color: var(--color-neutral-700);
		text-wrap: pretty;
	}
	.sub {
		font-size: 16px;
		max-width: 60ch;
		margin-top: 12px;
		color: var(--color-neutral-700);
	}

	.listing {
		padding: 0 32px 80px;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 22px;
	}
	.filters button {
		cursor: pointer;
		font: inherit;
		font-size: 13.5px;
		padding: 8px 16px;
		border-radius: 999px;
		border: 1px solid var(--color-divider);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
		gap: 16px;
	}
	.pcard {
		display: flex;
		flex-direction: column;
		padding: 26px 28px;
		border-radius: 28px;
		border: 1px solid var(--color-divider);
	}
	.top {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.kind {
		margin-left: auto;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-neutral-600);
	}
	.pname {
		font-family: var(--font-heading);
		font-size: 22px;
		font-weight: var(--font-heading-weight);
		line-height: 1.15;
		margin: 14px 0 0;
	}
	.pname a {
		color: inherit;
		text-decoration: none;
	}
	.pname a:hover {
		color: var(--color-accent-700);
	}
	.by {
		font-size: 12.5px;
		color: var(--color-neutral-600);
		margin-top: 2px;
	}
	.body {
		margin: 12px 0 0;
		font-size: 14.5px;
		color: var(--color-neutral-700);
		flex: 1;
		text-wrap: pretty;
	}
	.adds {
		font-size: 13px;
		color: var(--color-neutral-700);
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--color-divider);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 14px;
	}
	.actions .btn {
		text-decoration: none;
	}
	.empty {
		color: var(--color-neutral-600);
		font-size: 15px;
	}
	.note {
		font-size: 14px;
		color: var(--color-neutral-600);
		margin-top: 22px;
		max-width: 70ch;
	}

	.dark {
		padding: 80px 32px;
		background: var(--color-neutral-900);
		color: var(--td-ink);
	}
	.dh {
		font-size: 38px;
		letter-spacing: -0.02em;
		color: var(--td-ink);
		margin-top: 18px;
		max-width: 22ch;
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 40px;
		margin-top: 24px;
	}
	.dp {
		font-size: 17px;
		color: var(--td-ink-2);
		text-wrap: pretty;
	}
	.panel {
		padding: 28px 30px;
		border-radius: 28px;
		background: #2a2721;
		border: 1px solid #3f3a31;
		align-self: start;
	}
	.eyebrow {
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 16px;
	}
	.row {
		display: flex;
		gap: 14px;
		align-items: baseline;
		font-size: 14px;
		color: var(--td-ink-2);
	}
	.fine {
		margin: 18px 0 0;
		font-size: 12.5px;
		color: var(--color-neutral-500);
	}

	.apps {
		padding: 80px 32px;
	}
	.h2 {
		font-size: 38px;
		letter-spacing: -0.02em;
		max-width: 22ch;
	}
	.lede2 {
		font-size: 17px;
		color: var(--color-neutral-700);
		max-width: 64ch;
		margin-top: 14px;
		text-wrap: pretty;
	}
	.appgrid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 16px;
		margin-top: 34px;
	}
	.appcard {
		padding: 24px;
	}
	.appcard .card-title {
		margin-top: 10px;
	}

	.road {
		padding: 80px 32px;
		background: var(--color-surface);
	}
	.roadlist {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 30px;
	}
	.ritem {
		display: flex;
		gap: 20px;
		align-items: flex-start;
		padding: 20px 24px;
		border-radius: 24px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
	}
	.ritem .tag {
		flex: none;
		margin-top: 2px;
	}
	.rtext {
		min-width: 0;
	}
	.rtitle {
		display: block;
		font-family: var(--font-heading);
		font-size: 18px;
	}
	.rbody {
		display: block;
		font-size: 14.5px;
		color: var(--color-neutral-700);
		margin-top: 4px;
	}

	.cta {
		padding: 84px 32px;
		background: var(--color-neutral-900);
		color: var(--td-ink);
	}
	.center {
		text-align: center;
	}
	.ch {
		font-size: clamp(30px, 3.6vw, 44px);
		letter-spacing: -0.02em;
		color: var(--td-ink);
		max-width: 24ch;
		margin: 0 auto;
	}
	.cp {
		font-size: 17px;
		color: var(--color-neutral-400);
		max-width: 56ch;
		margin: 16px auto 0;
	}
	.cbtns {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: center;
		margin-top: 26px;
	}
	.cbtns .btn {
		text-decoration: none;
		padding: 13px 24px;
		font-size: 15px;
	}
	.primary {
		background: var(--color-accent);
		color: var(--color-neutral-900);
	}
	.outline {
		border: 1px solid #4a4438;
		color: var(--td-ink-2);
	}

	@media (max-width: 640px) {
		.hd {
			padding: 52px 20px 36px;
		}
		.listing {
			padding: 0 20px 56px;
		}
		.dark,
		.apps,
		.road,
		.cta {
			padding: 56px 20px;
		}
		.grid {
			grid-template-columns: 1fr;
		}
		.ritem {
			flex-direction: column;
			gap: 10px;
		}
	}
</style>
