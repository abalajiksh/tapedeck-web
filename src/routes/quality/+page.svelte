<script>
	import { AS_OF, LAB_SERVERS, LAB_CHECKS, SUITE, LAYERS, LIMITS } from '$lib/qualityData.js';

	const jump = [
		['#lab', 'The media lab'],
		['#suite', 'The suite'],
		['#when', 'When it runs'],
		['#limits', 'What it does not cover']
	];
</script>

<svelte:head>
	<title>How it's tested — Tapedeck</title>
	<meta
		name="description"
		content="Tapedeck is tested against real Jellyfin, Emby, Plex and Navidrome servers on every release, on both database backends, in three browsers weekly — and this page says what that does not cover."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<span class="tag tag-accent-2">How it's tested</span>
		<h1>Tested against real servers, not against stand-ins.</h1>
		<p class="lede">
			A scrobbler that only works against a mock of a media server is a scrobbler that works against
			a mock of a media server. So there is a rack of real ones — Jellyfin, Emby, Plex and Navidrome
			— and every release plays music through all four before it goes out.
		</p>
		<p class="fine asof">
			The figures on this page are from <strong>v{AS_OF.version}</strong>, {AS_OF.date}.
		</p>
		<nav class="btn-row jump" aria-label="On this page">
			{#each jump as [href, label] (href)}
				<a class="btn btn-secondary" {href}>{label}</a>
			{/each}
		</nav>
	</div>
</header>

<section id="lab" class="band surface">
	<div class="wrap">
		<h2 class="h2">The media lab</h2>
		<p class="para wide mt-sm">
			Four media servers, each a container of its own, each with the same library of deliberately
			awkward files on it: every codec worth testing, multi-artist tags, classical credits,
			non-Latin titles, embedded MusicBrainz identifiers, and a handful of records actually bought
			so that a real lookup has something real to find.
		</p>
		<p class="para wide">
			Before every run they are rolled back to a clean snapshot, so a test never inherits the
			previous run's state and a run that leaves a mess cannot poison the next one. Then Tapedeck is
			pointed at all four at once and told to go and get the listens.
		</p>

		<div class="servers">
			{#each LAB_SERVERS as s (s.name)}
				<div class="server">
					<div class="server-name">{s.name}</div>
					<div class="server-ver">{s.version}</div>
					<div class="server-port">tcp/{s.port}</div>
				</div>
			{/each}
		</div>

		<h3 class="h3 spaced">What it has to prove</h3>
		<div class="grid-300 mt-sm">
			{#each LAB_CHECKS as c (c.title)}
				<div class="card elev-sm">
					<div class="card-title">{c.title}</div>
					<p class="card-body">{c.body}</p>
				</div>
			{/each}
		</div>

		<p class="para wide spaced">
			<strong>This is also where the bugs came from.</strong> Jellyfin 12 turning out to reject the
			authorization header Jellyfin 10 accepted; bitrates stored in bits where the API meant
			kilobits; a Plex listen counting while the player sat paused; Navidrome having read the audio
			format all along while Tapedeck threw the answer away; Emby answering a lyrics request with a
			500 and keeping the words in a subtitle stream instead. None of those are exotic. All of them
			were invisible until something real was on the other end of the connection.
		</p>
	</div>
</section>

<section id="suite" class="band dark">
	<div class="wrap">
		<h2 class="h2 on-dark">The suite</h2>
		<p class="para ink-2 wide mt-sm">
			End-to-end tests driving the real interface in a real browser against a real instance, rather
			than unit tests asserting that a function returns what the same author thought it should.
			There are Rust tests too, thousands of them, and they are not what this page is about: they
			check that the code does what it was written to do. These check that Tapedeck does what it
			says on this website.
		</p>

		<div class="figs">
			{#each SUITE as [n, what] (what)}
				<div class="fig">
					<div class="fig-n">{n}</div>
					<div class="fig-what">{what}</div>
				</div>
			{/each}
		</div>

		<div class="grid-320 mt">
			<div>
				<h3 class="h3 ink">Both databases, every time</h3>
				<p class="para ink-2 sm-plus">
					Tapedeck runs on SQLite by default and on Postgres as a separate build. The whole suite
					runs twice, once against each, because they are genuinely different programs underneath
					and the bugs that matter are the ones that exist in only one of them — a sort order that
					ignores case on one and not the other, a duration sum decoded as the wrong integer
					width, a date function one has and the other has to be given by hand.
				</p>
				<p class="para ink-2 sm-plus">
					A whole release's worth of Postgres-only bugs was found exactly this way, by a suite
					that had been passing on SQLite for weeks.
				</p>
			</div>
			<div>
				<h3 class="h3 ink">And a household's worth of history</h3>
				<p class="para ink-2 sm-plus">
					One of the test runs is seeded from a real multi-person history of tens of thousands of
					listens, and then checked against invariants that have to hold on it: counts that must
					agree with each other, a numerator and a denominator that must have been filtered the
					same way, sessions that must still add up after a rebuild.
				</p>
				<p class="para ink-2 sm-plus">
					Synthetic data is too well-behaved. Eight years of somebody's actual listening has
					duplicate imports, artists spelled three ways and a stretch where the clocks went back.
				</p>
			</div>
		</div>
	</div>
</section>

<section id="when" class="band">
	<div class="wrap">
		<h2 class="h2">When it runs</h2>
		<p class="para wide mt-sm">
			Nothing here is run by hand or on request. Each of these is a gate: it either passes or the
			thing it guards does not happen.
		</p>
		<div class="layers">
			{#each LAYERS as l (l.title)}
				<article class="layer">
					<div class="layer-when">{l.kicker}</div>
					<div class="layer-body">
						<h3 class="layer-title">{l.title}</h3>
						<p class="para sm">{l.body}</p>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<section id="limits" class="band surface">
	<div class="wrap">
		<h2 class="h2">What it does not cover</h2>
		<p class="para wide mt-sm">
			A testing page listing only what passes is an advertisement. These are the gaps, and they are
			the same gaps the <a href="/features/#sources">source cards</a> and
			<a href="/plugins/">plugin statuses</a> admit to.
		</p>
		<div class="grid-300 mt">
			{#each LIMITS as l (l.title)}
				<div class="card elev-sm">
					<div class="card-kicker">Known gap</div>
					<div class="card-title">{l.title}</div>
					<p class="card-body">{l.body}</p>
				</div>
			{/each}
		</div>
		<p class="para wide spaced">
			If you run a server Tapedeck claims to support and something it records is wrong, that is
			worth an issue even without a diagnosis — a captured response from a server that is not in the
			lab is the single most useful thing anyone can send.
			<a href="https://codeberg.org/abksh/tapedeck/issues">Issues are on Codeberg</a>.
		</p>
	</div>
</section>

<style>
	.asof {
		margin-top: 14px;
	}
	.jump {
		margin-top: 26px;
	}

	/* ── the lab's servers ─────────────────────────────── */
	.servers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 14px;
		margin-top: 28px;
	}
	.server {
		padding: 20px 22px;
		border: 1px solid var(--color-divider);
		border-radius: 20px;
		background: var(--color-bg);
	}
	.server-name {
		font-size: 17px;
		font-weight: 600;
	}
	.server-ver {
		margin-top: 4px;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 15px;
		color: var(--color-accent-700);
	}
	.server-port {
		margin-top: 2px;
		font-size: 12.5px;
		color: var(--color-neutral-500);
	}

	/* ── the figures on the dark band ──────────────────── */
	.figs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 20px;
		margin-top: 30px;
	}
	.fig {
		padding: 22px 24px;
		border-radius: 22px;
		background: #2a2721;
	}
	.fig-n {
		font-size: 42px;
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--color-accent-300);
	}
	.fig-what {
		margin-top: 8px;
		font-size: 14px;
		color: var(--td-ink-2);
		text-wrap: pretty;
	}

	/* ── when it runs ──────────────────────────────────── */
	.layers {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: 28px;
	}
	.layer {
		display: grid;
		grid-template-columns: 170px minmax(0, 1fr);
		gap: 28px;
		padding: 24px 0;
		border-top: 1px solid var(--color-divider);
	}
	.layer:last-child {
		border-bottom: 1px solid var(--color-divider);
	}
	.layer-when {
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-accent-700);
		padding-top: 5px;
	}
	.layer-title {
		font-size: 20px;
		margin: 0 0 8px;
		letter-spacing: -0.01em;
	}
	.layer-body :global(.para) {
		max-width: 68ch;
	}
	@media (max-width: 760px) {
		.layer {
			grid-template-columns: 1fr;
			gap: 10px;
		}
	}

	.h3.spaced {
		margin-top: 42px;
	}
	.para.spaced {
		margin-top: 26px;
	}
	.para.sm-plus {
		font-size: 16px;
	}
	.mt-sm {
		margin-top: 16px;
	}
	.mt {
		margin-top: 26px;
	}
</style>
