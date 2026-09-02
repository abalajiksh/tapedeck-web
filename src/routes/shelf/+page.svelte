<script>
	import { onMount } from 'svelte';

	const MEDIA = [
		{
			key: 'vinyl',
			label: 'Vinyl',
			unit: 'Side A · 12" · 33⅓',
			title: 'Selected Ambient Works 85–92',
			artist: 'Aphex Twin',
			note: 'The arm swings down when a side starts and lifts when it stops. None of it moves under prefers-reduced-motion.'
		},
		{
			key: 'tape',
			label: 'Cassette',
			unit: 'Side B · C90',
			title: 'Mezzanine',
			artist: 'Massive Attack',
			note: 'Both reels turn behind the window, and the counter is derived from the sides played rather than accumulated.'
		},
		{
			key: 'disc',
			label: 'CD / SACD',
			unit: 'Disc 1',
			title: 'Wednesday Morning, 3 A.M.',
			artist: 'Simon & Garfunkel',
			note: 'A disc plays start to finish, so its tracks come off as one numbered unit — the UI says Disc 1, not Side A.'
		}
	];

	let medium = $state(0);
	let playing = $state(false);
	let counter = $state(148);

	const m = $derived(MEDIA[medium]);
	const spin = $derived(playing ? 'running' : 'paused');

	onMount(() => {
		const t = setInterval(() => {
			if (playing) counter += 1;
		}, 1000);
		return () => clearInterval(t);
	});

	function pick(i) {
		medium = i;
		playing = false;
	}
</script>

<svelte:head>
	<title>The Shelf — Tapedeck</title>
	<meta
		name="description"
		content="Catalogue vinyl, cassette, CD and SACD, then play a side: one listen per track, wear derived from the plays, and running times it admits it doesn't have."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap hero-grid">
		<div>
			<span class="tag tag-accent">The Shelf</span>
			<h1>A shelf you catalogue, and sides you play.</h1>
			<p class="lede narrow">
				Vinyl, cassette, CD and SACD. Look a pressing up by barcode, catalogue number, or artist and
				release — MusicBrainz always, Discogs first for a barcode, because it catalogues
				<em>pressings</em> and usually lands on the exact edition.
			</p>
			<p class="para narrow-2">
				No disc player of any brand or vintage will tell you what it is playing. The shelf already
				holds the tracklist — so it works today with no driver at all.
			</p>
		</div>
		<div>
			<div class="pillrow media-row">
				{#each MEDIA as x, i (x.key)}
					<button
						type="button"
						class="pill lg"
						aria-pressed={i === medium}
						onclick={() => pick(i)}
						style:border-color={i === medium ? 'var(--color-accent)' : 'var(--color-divider)'}
						style:background={i === medium ? 'var(--color-accent)' : 'transparent'}
						style:color={i === medium ? 'var(--color-bg)' : 'var(--color-text)'}>{x.label}</button
					>
				{/each}
			</div>
			<div class="player">
				<div class="stage">
					{#if m.key === 'vinyl'}
						<div class="vinyl-wrap">
							<div class="disc" style:animation-play-state={spin}>
								<div class="groove g1"></div>
								<div class="groove g2"></div>
								<div class="labelface"></div>
							</div>
							<div class="pivot"></div>
							<div class="arm" style:transform="rotate({playing ? '-24deg' : '-2deg'})"></div>
						</div>
					{:else if m.key === 'tape'}
						<div class="shell">
							<div class="label">
								<div class="lline"></div>
								<div class="lline short"></div>
							</div>
							<div class="well">
								<div class="tape-span"></div>
								{#each [0, 1] as reel (reel)}
									<div class="reel" style:animation-play-state={spin}>
										<svg viewBox="0 0 100 100" width="76" height="76" fill="none" stroke="#f9f4ed" stroke-width="4.5" stroke-linecap="round" aria-hidden="true">
											<circle cx="50" cy="50" r="43" /><circle cx="50" cy="50" r="14" />
											<path d="M50 30V7M67 40l20-11M67 60l20 11M50 70v23M33 60L13 71M33 40L13 29" />
										</svg>
									</div>
								{/each}
							</div>
							<div class="counter">
								<span class="counter-l">Tape</span>
								<span class="counter-n">{String(counter).padStart(4, '0')}</span>
							</div>
						</div>
					{:else}
						<div class="cd" style:animation-play-state={spin}>
							<div class="cd-hole"></div>
						</div>
					{/if}
				</div>
				<div class="now">
					<div class="unit">{m.unit}</div>
					<div class="rec-title">{m.title}</div>
					<div class="rec-artist">{m.artist}</div>
				</div>
				<button type="button" class="go" onclick={() => (playing = !playing)}>
					{playing ? 'Stop' : m.key === 'vinyl' ? 'Start — drop the needle' : 'Start'}
				</button>
				<p class="medium-note">{m.note}</p>
			</div>
		</div>
	</div>
</header>

<section class="band surface">
	<div class="wrap">
		<h2 class="h2 cap-22">A side writes one listen per track, never one per side.</h2>
		<p class="para wide-64 mt-sm">
			Every counting query in Tapedeck is over listens, so a side-shaped row would be invisible to
			all of them. Press Start when the needle drops; the browser runs the clock, so pause and skip
			are recorded as they happen and each track lands where it actually played. Press
			<em>Already played</em> instead and the running order is laid out backwards from the sleeve times
			— right ordering and gaps, but no one saw the clock, and the UI says so.
		</p>
		<div class="grid-280 mt-lg">
			<div class="card elev-sm pad">
				<div class="card-kicker">Skips</div>
				<div class="card-title">Stored, marked, never counted</div>
				<p class="card-body">
					Out of every count and never forwarded — a skip on your Last.fm is a wrong scrobble on a
					permanent record. You can also play just one track: it counts as wear, because the needle
					was in the groove, and it's marked partial.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Wear</div>
				<div class="card-title">Derived, never accumulated</div>
				<p class="card-body">
					Stylus hours and the cassette counter are computed from the sides played, so they cannot
					drift from the plays they claim to count. Correcting a play corrects the wear it banked.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Lyrics theatre</div>
				<div class="card-title">Words across the room</div>
				<p class="card-body">
					The one screen built for playback you can't touch: the current line large, the rest falling
					away, following the clock when the words are timed. Your hands are on a record —
					<a href="/#lyrics">see it on the homepage</a>.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Artwork</div>
				<div class="card-title">Every track wears the record's sleeve</div>
				<p class="card-body">
					A side used to go in with no artwork, so the provider chain asked about each song — and
					answered per song, giving one side a different cover per track. The shelf is holding the
					object; there is nothing to look up.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band">
	<div class="wrap">
		<h2 class="h2 cap-24">
			Running times are often missing, and Tapedeck says so rather than guessing.
		</h2>
		<div class="grid-320 mt">
			<div>
				<p class="para">
					Discogs frequently lists none. A tracklist of blanks used to be filled in at three minutes
					a track and the sum shown as a side length — so an 18:00 side "finished" while the record
					was still playing.
				</p>
				<p class="para">
					Now a side with unknown running times shows no length and no progress bar, the platter
					keeps turning, and its listens carry no duration — so they add nothing to your gear hours
					rather than a made-up figure.
				</p>
				<p class="para">
					<strong>Find running times</strong> looks the pressing up by barcode, matches tracks by title
					rather than by position — what comes back is usually a different pressing — shows you what it
					found beside what you have, and writes only when you accept. Applying corrects the tracklist,
					the listens already recorded, and the wear those plays banked. A running time you already have
					is never overwritten.
				</p>
			</div>
			<div class="sidepanel">
				<div class="sidepanel-t">Where the side break goes</div>
				<p class="sidepanel-b">
					Sides aren't reliably available from any provider — MusicBrainz records a vinyl track
					number as "A1" only when an editor entered one — so Tapedeck splits by
					<strong>playing time</strong> when it has to. A side holds around twenty minutes and a mastering
					engineer balances them; splitting by track count would put a nine-minute closer on the wrong
					side of the break.
				</p>
				<p class="sidepanel-b">
					A multi-disc set is split one record at a time, by each disc's own running time, so a
					double LP whose first record runs long does not have side C opening with tracks physically
					on disc 1. A single record gets no heading, because "Record 1" over one LP distinguishes it
					from nothing.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band band-2">
	<div class="wrap grid-320 center-items">
		<div>
			<h2 class="h2 band-2-h">How it came to be yours</h2>
			<p class="para band-2-body mt-sm">
				Bought new, bought used, a gift, inherited — with a free-text note of where from, because
				"Oxfam on Byres Road" is what makes a thrift find a story rather than a flag. Both optional,
				and blank means nobody said, never "new": a shelf catalogued before the field existed is not
				retroactively claimed as bought new.
			</p>
			<p class="para band-2-body">
				Deliberately <strong>not</strong> condition grading. That describes the object's wear rather than
				where it came from, and it is the field people abandon filling in.
			</p>
		</div>
		<div class="prov">
			<div class="prov-l">Reads as a sentence</div>
			<div class="prov-q">
				"Yours for 12 months — bought used from Oxfam on Byres Road, 22 Aug 2025"
			</div>
			<div class="prov-f">Both travel in the shelf export.</div>
		</div>
	</div>
</section>

<section class="band dark">
	<div class="wrap center">
		<h2 class="h2 on-dark cta-h">Put a side on. Tapedeck will keep the count.</h2>
		<div class="btn-row center mt">
			<a class="btn accent-btn" href="https://codeberg.org/abksh/tapedeck" rel="noopener">Get the source</a>
			<a class="btn outline-btn" href="/docs/">Quickstart</a>
		</div>
	</div>
</section>

<style>
	.hero-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 48px;
		align-items: center;
	}
	h1 {
		font-size: clamp(40px, 4.6vw, 64px);
		letter-spacing: -0.03em;
		line-height: 1.03;
		margin: 18px 0 0;
	}
	.lede.narrow {
		max-width: 50ch;
	}
	.narrow-2 {
		max-width: 52ch;
		margin-top: 14px;
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
	.pad {
		padding: 24px;
	}
	.center {
		text-align: center;
	}
	.center-items {
		align-items: center;
		gap: 44px;
	}
	.cap-22 {
		max-width: 22ch;
	}
	.cap-24 {
		max-width: 24ch;
	}
	.wide-64 {
		max-width: 64ch;
	}
	.cta-h {
		font-size: clamp(30px, 3.6vw, 44px);
		max-width: 20ch;
		margin: 0 auto;
	}

	/* ── the player ───────────────────────────────────── */
	.media-row {
		margin-bottom: 16px;
	}
	.player {
		border-radius: 32px;
		padding: 30px;
		background: var(--color-neutral-900);
		box-shadow: var(--shadow-lg);
	}
	.stage {
		display: grid;
		place-items: center;
		height: 230px;
	}

	.vinyl-wrap {
		position: relative;
		width: 210px;
		height: 210px;
	}
	.disc {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: radial-gradient(circle at center, #12110f 0 16%, #1c1a16 16% 100%);
		box-shadow:
			inset 0 0 60px rgba(0, 0, 0, 0.8),
			0 0 0 1px #3f3a31;
		animation: td-spin 1.8s linear infinite;
	}
	.groove {
		position: absolute;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.g1 {
		inset: 22px;
	}
	.g2 {
		inset: 44px;
	}
	.labelface {
		position: absolute;
		inset: 70px;
		border-radius: 50%;
		background: var(--color-accent-600);
	}
	.pivot {
		position: absolute;
		right: -14px;
		top: 6px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-neutral-500);
	}
	.arm {
		position: absolute;
		right: -10px;
		top: 10px;
		width: 120px;
		height: 4px;
		border-radius: 999px;
		background: var(--color-neutral-400);
		transform-origin: right center;
		transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.shell {
		width: 290px;
		border-radius: 18px;
		padding: 14px;
		background: #211f1a;
		border: 1.5px solid var(--color-accent-600);
	}
	.label {
		border-radius: 12px;
		padding: 16px 14px;
		background: #f5ead8;
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.lline {
		height: 3px;
		border-radius: 999px;
		background: var(--color-accent-500);
	}
	.lline.short {
		width: 68%;
		background: var(--color-accent-2-500);
	}
	.well {
		position: relative;
		margin-top: 14px;
		border-radius: 14px;
		padding: 20px 16px;
		background: #191712;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
	}
	.tape-span {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 70px;
		height: 15px;
		background: #332f27;
	}
	.reel {
		position: relative;
		width: 76px;
		height: 76px;
		animation: td-spin 2.4s linear infinite;
	}
	.counter {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		margin-top: 14px;
		padding: 7px 13px;
		border-radius: 999px;
		background: #191712;
		border: 1px solid #3a352c;
	}
	.counter-l {
		font-size: 9px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.counter-n {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 14px;
		letter-spacing: 0.1em;
		color: var(--td-ink);
	}

	.cd {
		position: relative;
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background: conic-gradient(
			from 0deg,
			#4d5560,
			#8e99a6,
			#c3ccd6,
			#8e99a6,
			#4d5560,
			#8e99a6,
			#c3ccd6,
			#4d5560
		);
		animation: td-spin 0.7s linear infinite;
		box-shadow: 0 0 0 1px #3f3a31;
	}
	.cd-hole {
		position: absolute;
		inset: 66px;
		border-radius: 50%;
		background: var(--color-neutral-900);
		box-shadow: inset 0 0 0 8px #2a2721;
	}

	.now {
		text-align: center;
		margin-top: 14px;
	}
	.unit {
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.rec-title {
		font-family: var(--font-heading);
		font-size: 22px;
		color: var(--td-ink);
		margin-top: 4px;
	}
	.rec-artist {
		font-size: 14px;
		color: var(--color-accent-300);
	}
	.go {
		width: 100%;
		margin-top: 20px;
		cursor: pointer;
		font-family: var(--font-heading);
		font-size: 14px;
		padding: 12px;
		border-radius: 999px;
		border: none;
		background: var(--color-accent);
		color: var(--color-neutral-900);
	}
	.go:hover {
		background: var(--color-accent-400);
	}
	.medium-note {
		font-size: 11.5px;
		color: var(--color-neutral-500);
		margin: 12px 0 0;
		text-align: center;
	}

	/* ── side break panel ─────────────────────────────── */
	.sidepanel {
		padding: 26px 28px;
		border-radius: 28px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
		align-self: start;
	}
	.sidepanel-t {
		font-family: var(--font-heading);
		font-size: 19px;
	}
	.sidepanel-b {
		font-size: 15px;
		color: var(--color-neutral-700);
		margin-top: 8px;
		text-wrap: pretty;
	}

	/* ── provenance ───────────────────────────────────── */
	.band-2-h {
		color: var(--td-band-2-ink);
		font-size: 36px;
	}
	.band-2-body {
		color: var(--td-band-2-ink);
		opacity: 0.86;
	}
	.prov {
		padding: 30px 34px;
		border-radius: 30px;
		background: var(--td-band-2-card);
		border: 1px solid var(--td-band-2-edge);
	}
	.prov-l {
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--td-band-2-ink);
	}
	.prov-q {
		font-family: var(--font-heading);
		font-size: 23px;
		line-height: 1.3;
		margin-top: 10px;
		color: var(--td-band-2-ink);
	}
	.prov-f {
		font-size: 13px;
		color: var(--td-band-2-ink);
		opacity: 0.7;
		margin-top: 12px;
	}
</style>
