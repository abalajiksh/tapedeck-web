<script>
	const REEL = [
		{ initial: 'M', who: '@mira', when: 'now', track: 'Teardrop', artist: 'Massive Attack', bg: 'var(--color-accent-300)' },
		{ initial: 'A', who: '@ash', when: '4 min', track: 'Ageispolis', artist: 'Aphex Twin', bg: 'var(--color-accent-2-300)' },
		{ initial: 'J', who: '@jo', when: '22 min', track: 'Bookends Theme', artist: 'Simon & Garfunkel', bg: 'var(--td-ink-2)' },
		{ initial: 'M', who: '@mira', when: '38 min', track: 'Angel', artist: 'Massive Attack', bg: 'var(--color-accent-300)' },
		{ initial: 'R', who: '@rune', when: '1 h', track: 'Rue the Whirl', artist: 'Boards of Canada', bg: 'var(--color-accent-2-400)' },
		{ initial: 'A', who: '@ash', when: '2 h', track: 'Xtal', artist: 'Aphex Twin', bg: 'var(--color-accent-2-300)' }
	];

	let chainShared = $state(false);
	let deckOpen = $state(false);

	const switches = $derived([
		{
			on: chainShared,
			title: 'Share a chain',
			body: 'Anyone patched with you sees what ran through it — and only what ran through it.',
			toggle: () => (chainShared = !chainShared)
		},
		{
			on: deckOpen,
			title: 'Open your deck',
			body: 'To the people you have already accepted, which is what a patch is.',
			toggle: () => (deckOpen = !deckOpen)
		}
	]);

	const verdict = $derived(
		!chainShared && !deckOpen
			? 'Nothing is shared. This is the shipped default — Patch reaches nobody until you decide it should.'
			: chainShared && deckOpen
				? 'Patched decks see your deck, and anyone patched with you sees what ran through the shared chain. Instance-wide figures are unlocked because a chain is shared.'
				: chainShared
					? 'Only listens through the shared chain are visible — and instance-wide figures, which the chain opt-in is what covers.'
					: 'Your deck is readable by the people you accepted. Instance-wide figures stay gated, because those reach people you never approved.'
	);
</script>

<svelte:head>
	<title>Patch — Tapedeck</title>
	<meta
		name="description"
		content="The one social part of Tapedeck: patch into another deck on your instance, pass records along as Dubs, and listen together — all behind two switches that ship off."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<span class="tag tag-accent-2">Patch</span>
		<h1>Everything else is yours alone. This is the part that isn't.</h1>
		<p class="lede">
			Patch into another deck on your server and their listening appears on The Reel, alongside the
			artists you have in common, what the whole instance is playing, and a page for each deck. A
			patch waits for a yes — a private deck holds requests in an inbox — so being followed and being
			readable are separate states.
		</p>
	</div>
</header>

<section class="band top-flush">
	<div class="wrap reel-split">
		<div class="reel">
			<div class="reel-head">
				<span class="reel-title">The Reel</span>
				<span class="reel-sub">4 decks patched · your instance</span>
			</div>
			<div class="reel-list">
				{#each REEL as r, i (i)}
					<div class="reel-row">
						<span class="avatar" style:background={r.bg}>{r.initial}</span>
						<span class="reel-track">
							<span class="rt-name">{r.track}</span>
							<span class="rt-artist">{r.artist}</span>
						</span>
						<span class="reel-when">{r.who}<br />{r.when}</span>
					</div>
				{/each}
			</div>
			<div class="reel-foot">
				A listen heard in company is <em>marked</em> as such — and "unmarked" is never read as "alone".
				The History filter has three states rather than two, because most listening predates the column.
			</div>
		</div>

		<div>
			<div class="switches-card">
				<div class="card-kicker">Two switches, both off</div>
				<div class="switches-h">And neither is per listen.</div>
				<div class="switches">
					{#each switches as s (s.title)}
						<button
							type="button"
							class="switch"
							role="switch"
							aria-checked={s.on}
							onclick={s.toggle}
							style:background={s.on ? 'var(--color-accent-2-100)' : 'var(--color-neutral-100)'}
							style:border-color={s.on ? 'var(--td-tint-2-edge)' : 'var(--color-divider)'}
						>
							<span
								class="sw-track"
								style:background={s.on ? 'var(--color-accent-2-600)' : 'var(--color-neutral-400)'}
							>
								<span class="sw-knob" style:left={s.on ? '17px' : '3px'}></span>
							</span>
							<span>
								<span class="sw-title">{s.title}</span>
								<span class="sw-body">{s.body}</span>
							</span>
						</button>
					{/each}
				</div>
				<div class="verdict">{verdict}</div>
			</div>
			<p class="gate-note">
				Instance-wide figures and Shared Spool captures stay <strong>chain-gated</strong> whichever you
				use: those reach people you never approved, or write onto somebody else's history, and a per-chain
				opt-in is the only consent that covers them.
			</p>
		</div>
	</div>
</section>

<section class="band surface">
	<div class="wrap">
		<h2 class="h2">Passing music around without polluting a history</h2>
		<div class="grid-300 mt">
			<div class="card elev-sm pad">
				<div class="card-kicker">Dub</div>
				<div class="card-title big">Pass a record to someone</div>
				<p class="card-body sm">
					It lands in their Crate with your reason attached, never in their history. The Crate is
					kept well away from your own records — it is the one place music you don't own is allowed
					to appear, and you have to visit it deliberately.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">Shared Spool</div>
				<div class="card-title big">Listen together</div>
				<p class="card-body sm">
					Plays from one deck wait in the other's inbox and enter no history until each is accepted.
					A sitting you both forgot to start can be reconstructed afterwards from the listens
					themselves.
				</p>
			</div>
			<div class="card elev-sm pad">
				<div class="card-kicker">The Reel</div>
				<div class="card-title big">What everyone is playing</div>
				<p class="card-body sm">
					Browse the artists you have in common, open somebody's deck, and see what the whole
					instance is playing — all of it gated by the switches above rather than assumed.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band">
	<div class="wrap grid-320 start">
		<div>
			<span class="tag tag-accent">Status</span>
			<h2 class="h2 mid">Nothing federates outward yet.</h2>
			<p class="para">
				Every account can already have an ActivityPub actor, a WebFinger record, an outbox and an
				inbox that verifies HTTP signatures — all opt-in and off by default. What remains is
				<em>sending</em>.
			</p>
			<p class="para">
				That order is deliberate: the identity other servers cache has to be right before anyone
				holds a copy of it, and blocking has to exist before a stranger can knock.
			</p>
		</div>
		<div class="vocab">
			<div class="eyebrow">The vocabulary is settled and frozen</div>
			<div class="vocab-code">{`Create {
  object: td:Listen { … }
}`}</div>
			<p class="vocab-note">
				A server that understands nothing renders <em>"Listened to Teardrop by Massive Attack"</em>.
				One that understands <code>td:</code> also gets the signal chain and the format.
			</p>
		</div>
	</div>
</section>

<section class="band dark">
	<div class="wrap center">
		<h2 class="h2 on-dark cta-h">Run one instance. Bring the household onto it.</h2>
		<div class="btn-row center mt">
			<a class="btn accent-btn" href="https://codeberg.org/abksh/tapedeck" rel="noopener">Get the source</a>
			<a class="btn outline-btn" href="/docs/">Quickstart</a>
		</div>
	</div>
</section>

<style>
	h1 {
		font-size: clamp(40px, 4.8vw, 66px);
		letter-spacing: -0.03em;
		line-height: 1.03;
		margin: 18px 0 0;
		max-width: 16ch;
	}
	.lede {
		max-width: 58ch;
	}
	.band.top-flush {
		padding-top: 0;
		padding-bottom: 72px;
	}
	.mt {
		margin-top: 30px;
	}
	.pad {
		padding: 28px;
	}
	.center {
		text-align: center;
	}
	.start {
		align-items: start;
		gap: 44px;
	}
	.card-title.big {
		font-size: 21px;
	}
	.card-body.sm {
		font-size: 14.5px;
	}
	.h2.mid {
		font-size: 36px;
		margin-top: 16px;
	}
	.cta-h {
		font-size: clamp(30px, 3.6vw, 44px);
		max-width: 22ch;
		margin: 0 auto;
	}

	/* ── the reel ─────────────────────────────────────── */
	.reel-split {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 26px;
		align-items: start;
	}
	.reel {
		border-radius: 30px;
		padding: 26px 28px;
		background: var(--color-neutral-900);
		color: var(--td-ink);
	}
	.reel-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 18px;
		flex-wrap: wrap;
	}
	.reel-title {
		font-family: var(--font-heading);
		font-size: 20px;
		color: var(--td-ink);
	}
	.reel-sub {
		font-size: 12px;
		color: var(--color-neutral-500);
	}
	.reel-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.reel-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 14px;
		border-radius: 18px;
		background: #2a2721;
	}
	.avatar {
		display: grid;
		place-items: center;
		flex: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		color: var(--color-neutral-900);
		font-family: var(--font-heading);
		font-size: 15px;
	}
	.reel-track {
		min-width: 0;
		flex: 1;
	}
	.rt-name {
		display: block;
		font-size: 14.5px;
		color: var(--td-ink);
	}
	.rt-artist {
		display: block;
		font-size: 12px;
		color: var(--color-accent-300);
	}
	.reel-when {
		font-size: 11px;
		color: var(--color-neutral-500);
		text-align: right;
	}
	.reel-foot {
		margin-top: 16px;
		padding-top: 14px;
		border-top: 1px solid #3a352c;
		font-size: 12px;
		color: var(--color-neutral-500);
	}

	/* ── the two switches ─────────────────────────────── */
	.switches-card {
		padding: 24px 26px;
		border-radius: 28px;
		background: var(--color-surface);
	}
	.switches-h {
		font-family: var(--font-heading);
		font-size: 21px;
		margin-top: 4px;
	}
	.switches {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 16px;
	}
	.switch {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		cursor: pointer;
		font: inherit;
		text-align: left;
		padding: 14px 16px;
		border-radius: 20px;
		border: 1px solid var(--color-divider);
		color: inherit;
	}
	.sw-track {
		flex: none;
		margin-top: 3px;
		width: 34px;
		height: 20px;
		border-radius: 999px;
		position: relative;
	}
	.sw-knob {
		position: absolute;
		top: 3px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-bg);
	}
	.sw-title {
		display: block;
		font-family: var(--font-heading);
		font-size: 16px;
	}
	.sw-body {
		display: block;
		font-size: 13px;
		color: var(--color-neutral-700);
		margin-top: 3px;
	}
	.verdict {
		margin-top: 16px;
		padding: 14px 16px;
		border-radius: 18px;
		background: var(--td-band-2);
		font-size: 13.5px;
		color: var(--td-band-2-ink);
	}
	.gate-note {
		font-size: 13.5px;
		color: var(--color-neutral-600);
		margin-top: 14px;
		text-wrap: pretty;
	}

	/* ── federation vocabulary ────────────────────────── */
	.vocab {
		padding: 28px 30px;
		border-radius: 28px;
		background: var(--color-neutral-900);
		color: var(--td-ink-2);
		font-size: 14px;
	}
	.vocab-code {
		margin-top: 14px;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13px;
		line-height: 1.9;
		color: var(--color-accent-200);
		white-space: pre-wrap;
	}
	.vocab-note {
		margin: 16px 0 0;
		text-wrap: pretty;
	}
	.vocab code {
		font-size: 0.9em;
		background: #332f27;
		padding: 2px 7px;
		border-radius: 6px;
	}

	@media (max-width: 860px) {
		.reel-split {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
