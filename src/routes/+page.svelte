<script>
	import { onMount } from 'svelte';
	import {
		TRACKS,
		SIDE,
		LADDER,
		GENRES,
		LAB,
		GRANTS,
		MORE,
		CAVEATS,
		NOTE_DEFAULT,
		RESOLVED,
		LYRICS,
		LYRIC_SIDE
	} from '$lib/homeData.js';

	// `version` is the latest Codeberg tag, read at build time; null if that
	// lookup failed, in which case the chip simply omits it.
	let { data } = $props();

	const mmss = (s) => {
		s = Math.max(0, Math.floor(s));
		return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
	};

	// ── deck ──────────────────────────────────────────────
	let playing = $state(false);
	let trackIdx = $state(0);
	let elapsed = $state(74);
	const track = $derived(TRACKS[trackIdx]);

	// ── chain ladder ──────────────────────────────────────
	let rung = $state(1);

	// ── the shelf side ────────────────────────────────────
	let sidePlaying = $state(false);
	let sideElapsed = $state(0);
	let skipped = $state({});
	const sideTotal = SIDE.reduce((a, t) => a + t.len, 0);
	const sideIndex = $derived.by(() => {
		let acc = 0;
		for (let i = 0; i < SIDE.length; i++) {
			acc += SIDE[i].len;
			if (sideElapsed < acc) return i;
		}
		return SIDE.length - 1;
	});

	// ── genre map / playlist lab ──────────────────────────
	let genre = $state(1);
	let labMode = $state('Similar songs');
	const lab = $derived(LAB[labMode]);

	// ── lyrics theatre ────────────────────────────────────
	let lyricIdx = $state(1);
	let quoted = $state(false);
	let pinned = $state(false);

	// ── notes / MCP ───────────────────────────────────────
	let note = $state(NOTE_DEFAULT);
	let grants = $state(GRANTS.map((g) => g.on));

	// One second-hand drives the deck, the lyric follow and the side. Cleared on
	// unmount so a client-side navigation away doesn't leave it running.
	onMount(() => {
		const timer = setInterval(() => {
			if (playing) {
				if (elapsed + 1 >= track.dur) {
					trackIdx = (trackIdx + 1) % TRACKS.length;
					elapsed = 0;
				} else {
					elapsed += 1;
				}
				const at = elapsed % 72;
				let idx = 0;
				for (let i = 0; i < LYRICS.length; i++) if (at >= LYRICS[i].t) idx = i;
				if (idx !== lyricIdx) {
					lyricIdx = idx;
					quoted = false;
					pinned = false;
				}
			}
			if (sidePlaying) {
				if (sideElapsed + 1 >= sideTotal) {
					sidePlaying = false;
					sideElapsed = sideTotal;
				} else {
					sideElapsed += 1;
				}
			}
		}, 1000);
		return () => clearInterval(timer);
	});

	const meterBars = $derived(
		Array.from({ length: 12 }, (_, i) => {
			const v = playing ? 0.35 + 0.65 * Math.abs(Math.sin(elapsed * 0.9 + i * 1.7)) * (1 - i * 0.03) : 0.12;
			return {
				h: Math.round(v * 26) + 'px',
				color: i % 3 === 2 ? 'var(--color-accent-2-400)' : 'var(--color-accent-500)'
			};
		})
	);

	const CHAIN = [
		{ kind: 'Source', name: 'fooyin', detail: 'Fedora Sway', bg: '#332f27' },
		{ kind: 'DAC', name: 'Schiit Mimir', detail: 'USB input', bg: '#332f27' },
		{ kind: 'Amp', name: 'Schiit Midgaard', detail: 'high gain', bg: '#332f27' },
		{ kind: 'Transducer', name: 'Sennheiser HD 650', detail: '1,142 h', bg: '#3d372c' }
	];

	function skipTrack() {
		const i = sideIndex;
		let acc = 0;
		for (let k = 0; k <= i; k++) acc += SIDE[k].len;
		skipped = { ...skipped, [i]: true };
		sideElapsed = Math.min(acc, sideTotal - 1);
	}
	function resetSide() {
		sidePlaying = false;
		sideElapsed = 0;
		skipped = {};
	}

	// [[wikilink]] resolution, exactly as the app does it: a link that matches
	// nothing stays as prose rather than becoming a dead link.
	const noteSegments = $derived.by(() => {
		const out = [];
		const re = /\[\[([^\]]+)\]\]/g;
		const text = note || '';
		let last = 0,
			m,
			resolved = 0,
			unresolved = 0;
		while ((m = re.exec(text)) !== null) {
			if (m.index > last) out.push({ text: text.slice(last, m.index), kind: 'plain' });
			const key = m[1].trim();
			const hit = RESOLVED[key];
			if (hit) {
				resolved++;
				out.push({ text: hit, kind: 'hit', title: `[[${key}]] — resolved` });
			} else {
				unresolved++;
				out.push({
					text: key.replace(/^[a-z]+:/, ''),
					kind: 'miss',
					title: `[[${key}]] — matched nothing; left as prose`
				});
			}
			last = m.index + m[0].length;
		}
		if (last < text.length) out.push({ text: text.slice(last), kind: 'plain' });
		return { out, resolved, unresolved };
	});

	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const hourLabels = Array.from({ length: 24 }, (_, h) => (h % 6 === 0 ? String(h).padStart(2, '0') : ''));
	// Static — a shaped fake week, computed once rather than per render.
	const heat = (() => {
		const out = [];
		for (let d = 0; d < 7; d++) {
			for (let h = 0; h < 24; h++) {
				const evening = Math.exp(-Math.pow((h - 22 + (h < 6 ? 24 : 0)) / 4.4, 2));
				const morning = 0.35 * Math.exp(-Math.pow((h - 9) / 2.6, 2));
				const weekend = d >= 5 ? 0.9 : 1;
				const v = Math.min(1, (evening + morning) * weekend * (0.75 + 0.25 * Math.sin(d * 2.1 + h)));
				const bg =
					v < 0.08
						? 'var(--color-neutral-200)'
						: v < 0.3
							? 'var(--color-accent-200)'
							: v < 0.55
								? 'var(--color-accent-300)'
								: v < 0.8
									? 'var(--color-accent-500)'
									: 'var(--color-accent-700)';
				out.push({ bg, label: `${days[d]} ${String(h).padStart(2, '0')}:00 — ${Math.round(v * 180)} listens` });
			}
		}
		return out;
	})();

	const AXES = [
		{ left: 'Adventurer', right: 'Loyalist', pos: '34%' },
		{ left: 'Curator', right: 'Drifter', pos: '22%' },
		{ left: 'Casual', right: 'Obsessive', pos: '81%' },
		{ left: 'Lark', right: 'Night Owl', pos: '88%' },
		{ left: 'Mood-Driven', right: 'Identity', pos: '57%' }
	];

	const PLUGIN_TEASERS = [
		{
			name: 'fooyin-tapeout',
			slug: 'fooyin-tapeout',
			status: 'In development',
			statusBg: 'var(--color-accent-200)',
			statusFg: 'var(--color-accent-800)',
			body: 'A native plugin for fooyin, reporting the output device and decoded format the wire format has nowhere to put. Untested so far — fooyin already scrobbles over the generic path meanwhile.'
		},
		{
			name: 'Navidrome plugin',
			slug: 'navidrome-plugin',
			status: 'In development',
			statusBg: 'var(--color-accent-200)',
			statusFg: 'var(--color-accent-800)',
			body: 'Push from the Navidrome side rather than Tapedeck polling it from outside. Navidrome already works today as a polled source.'
		},
		{
			name: 'Audio analysis',
			slug: 'audio-analysis',
			status: 'In development',
			statusBg: 'var(--color-accent-200)',
			statusFg: 'var(--color-accent-800)',
			body: 'Per-recording features computed from the real files via Plex, Jellyfin and OpenSubsonic — what replaces the Every Noise placeholder behind the Genre Map.'
		},
		{
			name: 'Android, desktop and TV apps',
			slug: null,
			status: 'Planned',
			statusBg: 'var(--color-neutral-200)',
			statusFg: 'var(--color-neutral-700)',
			body: 'macOS, Windows, Apple TV, Fire TV and Android — each a client or a standalone instance, with the self-hosted server always the source of truth.'
		}
	];
</script>

<svelte:head>
	<title>Tapedeck — not just what you played, how you played it</title>
	<meta
		name="description"
		content="A self-hosted music intelligence hub. Tapedeck records the full signal chain alongside every listen, catalogues vinyl and tape, and forwards to Last.fm and ListenBrainz while the record stays yours."
	/>
</svelte:head>

<!-- ── HERO ───────────────────────────────────────────── -->
<header class="hero">
	<div class="blob blob-a"></div>
	<div class="blob blob-b"></div>
	<div class="hero-grid">
		<div class="rise">
			<span class="tag tag-accent-2"
				>Self-hosted · Single Rust binary{data.version ? ` · v${data.version}` : ''}</span
			>
			<h1>
				Not just what you played.<br /><span class="accent">How you played it.</span>
			</h1>
			<p class="lede">
				Tapedeck is a music intelligence hub for your own server. It records the full signal chain —
				source file, DAC, amp, transducer — alongside every listen, catalogues the vinyl and tape
				nothing can report automatically, and forwards to Last.fm and ListenBrainz while keeping the
				record yours.
			</p>
			<div class="cta-row">
				<a class="btn btn-primary" href="https://demo.tapedeck.cc" rel="noopener">Try the live demo</a>
				<a class="btn btn-secondary" href="https://codeberg.org/abksh/tapedeck" rel="noopener"
					>Get the source</a
				>
				<a class="btn btn-ghost" href="/docs/">Install in five minutes →</a>
			</div>
			<div class="stats">
				<div><div class="stat-n">565</div><div class="stat-l">tests, unit-level</div></div>
				<div><div class="stat-n">&lt;5ms</div><div class="stat-l">per ingested listen</div></div>
				<div><div class="stat-n">7</div><div class="stat-l">sources polled</div></div>
				<div><div class="stat-n">0</div><div class="stat-l">telemetry calls home</div></div>
			</div>
		</div>

		<!-- the deck -->
		<div id="deck" class="rise slow">
			<div class="deck">
				<div class="deck-top">
					<span
						class="lamp"
						style:background={playing ? 'var(--color-accent-400)' : 'var(--color-neutral-600)'}
					></span>
					<span class="deck-state">{playing ? 'Now playing' : 'Deck idle'}</span>
					<span class="deck-src">fooyin · Fedora Sway</span>
				</div>

				<!-- cassette — cream label over a dark reel well, terracotta shell edge -->
				<div class="cassette-grid">
					<div class="shell">
						<div class="label">
							<div class="lline"></div>
							<div class="lline short"></div>
						</div>
						<div class="well">
							<div class="tape-span"></div>
							{#each [0, 1] as reel (reel)}
								<div class="reel" style:animation-play-state={playing ? 'running' : 'paused'}>
									<svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke="#f9f4ed" stroke-width="4.5" stroke-linecap="round" aria-hidden="true">
										<circle cx="50" cy="50" r="43" /><circle cx="50" cy="50" r="14" />
										<path d="M50 30V7M67 40l20-11M67 60l20 11M50 70v23M33 60L13 71M33 40L13 29" />
									</svg>
								</div>
							{/each}
						</div>
					</div>
					<div class="np">
						<div class="np-title">{track.title}</div>
						<div class="np-meta">{track.artist} — {track.album}</div>
						<div class="np-row">
							<span class="tag codec">{track.codec}</span>
							<div class="meters">
								{#each meterBars as b, i (i)}
									<span style:background={b.color} style:height={b.h}></span>
								{/each}
							</div>
						</div>
						<div class="np-row wrap">
							<span class="clock">{mmss(elapsed)} / {mmss(track.dur)}</span>
							<span class="counter">
								<span class="counter-l">Tape</span>
								<span class="counter-n">{String(Math.floor(elapsed / 2) + 11).padStart(4, '0')}</span>
							</span>
						</div>
					</div>
				</div>

				<div class="progress-row">
					<span class="tick">{mmss(elapsed)}</span>
					<div class="track">
						<div class="fill" style:width={Math.min(100, (elapsed / track.dur) * 100).toFixed(2) + '%'}></div>
					</div>
					<span class="tick right">{mmss(track.dur)}</span>
				</div>

				<div class="deck-btns">
					<button type="button" class="deck-go" onclick={() => (playing = !playing)}>
						{playing ? 'Pause the deck' : 'Start the deck'}
					</button>
					<button
						type="button"
						class="deck-next"
						onclick={() => {
							trackIdx = (trackIdx + 1) % TRACKS.length;
							elapsed = 0;
						}}>Next track</button
					>
				</div>

				<!-- signal chain readout -->
				<div class="chain-block">
					<div class="chain-head">
						<span class="eyebrow-d">Signal chain resolved</span>
						<span class="tag chain-tag">Desktop Reference</span>
						<span class="rung-note">rung 2 · output binding</span>
					</div>
					<div class="chain-steps">
						{#each CHAIN as step (step.kind)}
							<div class="step" style:background={step.bg}>
								<div class="step-kind">{step.kind}</div>
								<div class="step-name">{step.name}</div>
								<div class="step-detail">{step.detail}</div>
							</div>
						{/each}
					</div>
					<div class="chain-foot">
						<span>Codec <strong class="ink">{track.codec}</strong></span>
						<span>Quality <strong class="warm">{track.quality}/100</strong></span>
						<span>Context <strong class="ink">{track.context}</strong></span>
						<span class="push">→ Last.fm · ListenBrainz</span>
					</div>
				</div>
			</div>
			<p class="deck-note">
				A live mock of the dashboard deck. The reels turn only while something is actually playing —
				in the real app and here.
			</p>
		</div>
	</div>
</header>

<!-- ── THE PROBLEM ───────────────────────────────────── -->
<section class="band surface">
	<div class="wrap">
		<h2 class="h2-big">Most scrobblers store a title, an artist and a timestamp.</h2>
		<p class="lede">
			That is a list, not a history. It cannot tell you that your FLAC was degraded to SBC on the
			walk home, that eleven hundred hours have gone through the HD 650 drivers, or that the record
			you played last Sunday came off a shelf rather than a server. Tapedeck records all of it, next
			to the listen, from the moment it arrives.
		</p>
		<div class="tri">
			<div class="card elev-sm">
				<div class="card-kicker">Ingest</div>
				<div class="card-title">Everything already speaks it</div>
				<p class="card-body">
					A ListenBrainz-compatible API, so Pano Scrobbler, Web Scrobbler, multi-scrobbler and
					mpdscribble work with a URL and a token. Plex, Navidrome, Jellyfin, Emby and Roon are
					polled directly.
				</p>
			</div>
			<div class="card elev-sm">
				<div class="card-kicker">Proxy</div>
				<div class="card-title">You don't have to choose</div>
				<p class="card-body">
					Listens are stored locally <em>and</em> forwarded to Last.fm, Libre.fm and ListenBrainz.
					Per user, never server-wide. Each pending listen tracks which sinks accepted it, so a
					retry never double-scrobbles.
				</p>
			</div>
			<div class="card elev-sm">
				<div class="card-kicker">Yours</div>
				<div class="card-title">Nothing leaves that you didn't send</div>
				<p class="card-body">
					One binary, one SQLite file, credentials encrypted with a key held outside the database.
					One opt-in public endpoint, off until you switch it on.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- ── SIGNAL CHAIN ──────────────────────────────────── -->
<section class="band">
	<div class="wrap">
		<span class="tag tag-accent">Signal chain intelligence</span>
		<div class="split narrow-left">
			<div>
				<h2 class="h2-mid">You never have to tag a listen by hand.</h2>
				<p class="para">
					Attribution happens at the source, but a chain lives downstream — so the server resolves
					it on a four-rung ladder, first match winning. The order encodes what each rung <em>is</em
					>: a binding is evidence about this listen, a token is a standing statement about one app,
					a device is the coarsest fallback.
				</p>
				<p class="para">
					Issue one token per app — <code>fooyin</code>, <code>Pano on Android</code> — give each a
					chain, and that is the whole setup. The app itself needs no Tapedeck-specific
					configuration.
				</p>
				<p class="para">
					Hours are <strong>derived</strong> from listens rather than accumulated, so fixing a chain
					today moves the wear for plays you already have. Skips bank nothing.
				</p>
			</div>
			<div>
				<p class="hint">Click a rung to see which listen it would catch.</p>
				<div class="ladder">
					{#each LADDER as r, i (r.n)}
						<button
							type="button"
							class="rung"
							aria-pressed={i === rung}
							onclick={() => (rung = i)}
							style:background={i === rung ? 'var(--td-tint)' : 'var(--color-neutral-100)'}
							style:border-color={i === rung ? 'var(--td-tint-edge)' : 'var(--color-divider)'}
						>
							<span
								class="rung-n"
								style:background={i === rung ? 'var(--color-accent)' : 'var(--color-neutral-300)'}
								style:color={i === rung ? 'var(--color-bg)' : 'var(--td-on-tint)'}>{r.n}</span
							>
							<span class="rung-text">
								<span class="rung-title">{r.title}</span>
								<span class="rung-body">{r.body}</span>
							</span>
						</button>
					{/each}
				</div>
				<div class="payload">
					<div class="payload-l">What the client sent</div>
					<div class="payload-code">{LADDER[rung].payload}</div>
					<div class="payload-out">
						→ resolves to <strong>{LADDER[rung].result}</strong>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ── THE SHELF ─────────────────────────────────────── -->
<section class="band dark">
	<div class="wrap">
		<div class="split even center-items">
			<div>
				<span class="tag on-dark">The Shelf</span>
				<h2 class="h2-mid ink">The listening nothing can report automatically.</h2>
				<p class="para ink-2">
					Catalogue a pressing by barcode, catalogue number or name. Drop the needle, press Start,
					and the platter turns at a real 33⅓ with a countdown — the browser runs the clock, so a
					pause and a skip are recorded as they happen and every track lands where it actually
					played.
				</p>
				<p class="para ink-2">
					A side writes <strong class="ink">one listen per track</strong>, never one per side,
					because every counting query in Tapedeck is over listens. Stylus hours are derived from the
					sides played, so they cannot drift from the plays they claim to count.
				</p>
				<div class="media-tags">
					{#each ['Vinyl', 'Cassette', 'CD', 'SACD'] as m (m)}
						<span class="tag media">{m}</span>
					{/each}
				</div>
				<a class="btn accent-btn" href="/shelf/">How the shelf works →</a>
			</div>

			<div class="panel-dark">
				<div class="platter-row">
					<div class="platter" style:animation-play-state={sidePlaying ? 'running' : 'paused'}>
						<div class="groove g1"></div>
						<div class="groove g2"></div>
						<div class="spindle">SAW</div>
					</div>
					<div class="rec-meta">
						<div class="eyebrow-d">Side A · 12" vinyl · 33⅓</div>
						<div class="rec-title">Selected Ambient Works 85–92</div>
						<div class="rec-artist">Aphex Twin</div>
						<div class="rec-note">Yours for 4 years — bought used from Monorail, Glasgow</div>
					</div>
				</div>

				<div class="side-list">
					{#each SIDE as t, i (t.no)}
						{@const done = i < sideIndex || (i === sideIndex && !sidePlaying && sideElapsed >= sideTotal)}
						{@const isSkipped = !!skipped[i]}
						<div class="side-row" style:background={i === sideIndex && sidePlaying ? '#3d372c' : 'transparent'}>
							<span class="side-no">{t.no}</span>
							<span class="side-title" style:color={i === sideIndex ? 'var(--td-ink)' : 'var(--color-neutral-400)'}
								>{t.title}</span
							>
							<span
								class="side-state"
								style:color={isSkipped ? 'var(--color-accent-400)' : 'var(--color-accent-2-400)'}
								>{isSkipped
									? 'skipped · not counted'
									: i === sideIndex && sidePlaying
										? 'playing'
										: done
											? 'logged'
											: ''}</span
							>
							<span class="side-len">{mmss(t.len)}</span>
						</div>
					{/each}
				</div>

				<div class="progress-row">
					<span class="tick">{mmss(sideElapsed)}</span>
					<div class="track">
						<div class="fill sage" style:width={((sideElapsed / sideTotal) * 100).toFixed(2) + '%'}></div>
					</div>
					<span class="tick">{mmss(sideTotal)}</span>
				</div>

				<div class="deck-btns">
					<button type="button" class="deck-go" onclick={() => (sidePlaying = !sidePlaying)}>
						{sidePlaying
							? 'Pause — lift the arm'
							: sideElapsed > 0
								? 'Resume the side'
								: 'Start — drop the needle'}
					</button>
					<button type="button" class="deck-next" onclick={skipTrack}>Skip</button>
					<button type="button" class="deck-reset" onclick={resetSide}>Reset</button>
				</div>
				<p class="fine">
					{Object.keys(skipped).length
						? 'A skipped track is stored and marked, so it stays out of every count and is never forwarded onward.'
						: 'Playing this side writes four listens, one per track, each stamped as it actually started.'}
				</p>
			</div>
		</div>
	</div>
</section>

<!-- ── LYRICS THEATRE ────────────────────────────────── -->
<section id="lyrics" class="band theatre">
	<div class="wrap">
		<span class="tag on-dark">Lyrics theatre</span>
		<div class="split lyric-head">
			<h2 class="h2-mid ink flush">Hands busy with a record. Words across the room.</h2>
			<p class="para ink-2 flush">
				A full-bleed view built for the listening you can't touch — a side is playing, the sleeve is
				out of reach, and there is nothing to tap. Timed lines follow the clock; untimed ones you
				move yourself.
			</p>
		</div>

		<div class="theatre-grid">
			<!-- rail -->
			<div class="rail">
				<span class="rail-n">5</span>
				<div class="rail-track">
					<div
						class="rail-fill"
						style:height={(((lyricIdx + 1) / LYRICS.length) * 100).toFixed(1) + '%'}
					></div>
					<div
						class="rail-head"
						style:top={(((lyricIdx + 1) / LYRICS.length) * 100).toFixed(1) + '%'}
					></div>
				</div>
				<span class="rail-n">{mmss(LYRICS[lyricIdx].t)}</span>
			</div>

			<!-- the words -->
			<div class="words">
				{#each LYRICS as l, i (l.t)}
					{@const cur = i === lyricIdx}
					{@const d = Math.abs(i - lyricIdx)}
					<button
						type="button"
						class="line"
						class:cur
						aria-current={cur ? 'true' : undefined}
						onclick={() => {
							lyricIdx = i;
							quoted = false;
							pinned = false;
						}}
					>
						<span class="line-bar" style:background={cur ? 'var(--color-accent)' : 'transparent'}></span>
						<span
							class="line-text"
							style:color={cur
								? 'var(--td-ink)'
								: d === 1
									? 'color-mix(in srgb, #f9f4ed 74%, transparent)'
									: d === 2
										? 'color-mix(in srgb, #f9f4ed 52%, transparent)'
										: 'color-mix(in srgb, #f9f4ed 34%, transparent)'}>{l.text}</span
						>
					</button>
				{/each}
				<div class="line-actions">
					<button type="button" class="quote" onclick={() => (quoted = !quoted)}>
						{quoted ? 'Quoted — in your note' : '”  Quote this line'}
					</button>
					<button type="button" class="pin" onclick={() => (pinned = !pinned)}>
						{pinned ? 'Pinned to this listen' : 'Pin a note'}
					</button>
					<span class="chip mono">5 · line {lyricIdx + 1} · {mmss(LYRICS[lyricIdx].t)}</span>
					<span class="chip">played 37 times</span>
				</div>
			</div>

			<!-- the record's running order -->
			<div class="running-order">
				<div class="ro-title">Haunted Room</div>
				<div class="ro-meta">The Sundowners · Hollow Tide</div>
				<div class="ro-tags">
					<span class="tag timed">Timed</span>
					<span class="tag follow">{playing ? 'Following' : 'Paused'}</span>
				</div>
				<div class="ro-side">Side A</div>
				<div class="ro-list">
					{#each LYRIC_SIDE as t, i (t.no)}
						<div class="ro-row" style:background={i === 4 ? 'var(--color-accent-900)' : 'transparent'}>
							<span class="ro-no">{t.no}</span>
							<span class="ro-name" style:color={i === 4 ? 'var(--td-ink)' : 'var(--td-ink-2)'}>{t.title}</span>
							<span class="ro-len">{t.len}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<p class="theatre-note">
			Words are fetched per track and cached here only so a note can point at a line — they are not
			ours, and they never leave the instance: not in a backup, not in an export, not to anyone you
			have patched with. A liner note quotes a line by <em>index</em>, never by its words. The lines
			above are invented for this demo.
		</p>
	</div>
</section>

<!-- ── STATISTICS ────────────────────────────────────── -->
<section class="band">
	<div class="wrap">
		<span class="tag tag-accent-2">Statistics &amp; musical personality</span>
		<h2 class="h2-mid narrow">Every figure says what population it came from.</h2>
		<p class="para wide">
			A lossless share is a fact about the listens whose format is known. Where that is too little of
			your history, the card reports its coverage instead of a number — because a share drawn from a
			twentieth of your listening is a fact about the twentieth, not a verdict on your library.
		</p>

		<div class="stats-grid">
			<div class="card elev-md pad">
				<div class="clock-head">
					<div class="card-title">Listening clock</div>
					<span class="card-meta">21,480 listens · your timezone</span>
				</div>
				<div class="clock">
					<div class="daycol">
						{#each days as d (d)}<div class="day">{d}</div>{/each}
					</div>
					<div class="heatwrap">
						<div class="hours">
							{#each hourLabels as h, i (i)}<div>{h}</div>{/each}
						</div>
						<div class="heat">
							{#each heat as c, i (i)}
								<div title={c.label} style:background={c.bg}></div>
							{/each}
						</div>
					</div>
				</div>
				<div class="legend">
					<span>Quieter</span>
					<span class="sw" style="background:var(--color-neutral-200)"></span>
					<span class="sw" style="background:var(--color-accent-300)"></span>
					<span class="sw" style="background:var(--color-accent-500)"></span>
					<span class="sw" style="background:var(--color-accent-700)"></span>
					<span>Busier</span>
					<span class="push">Peak: Thursday, 23:00</span>
				</div>
			</div>

			<div class="card elev-md pad">
				<div class="card-kicker">Musical personality</div>
				<div class="persona">The Obsessive Night Owl</div>
				<p class="persona-note">
					Five explainable axes, computed locally. No external call, no comparison with anybody else.
				</p>
				<div class="axes">
					{#each AXES as a (a.left)}
						<div>
							<div class="axis-ends"><span>{a.left}</span><span>{a.right}</span></div>
							<div class="axis-track"><div class="axis-dot" style:left={a.pos}></div></div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="figs">
			<div class="card elev-sm">
				<div class="card-kicker">Lossless share</div>
				<div class="fig">64%</div>
				<div class="card-meta">of the 3,140 listens whose format is known (15% of history)</div>
			</div>
			<div class="card elev-sm">
				<div class="card-kicker">Hours on the HD 650</div>
				<div class="fig">1,142</div>
				<div class="card-meta">derived from listens carrying Desktop Reference</div>
			</div>
			<div class="card elev-sm">
				<div class="card-kicker">Off the shelf</div>
				<div class="fig">318</div>
				<div class="card-meta">listens from 41 sides played, 27 records</div>
			</div>
			<div class="card elev-sm">
				<div class="card-kicker">This month ranks</div>
				<div class="fig">2nd</div>
				<div class="card-meta">busiest of your 8 — never a percentile against other people</div>
			</div>
		</div>
	</div>
</section>

<!-- ── GENRE MAP + PLAYLIST LAB ──────────────────────── -->
<section class="band surface">
	<div class="wrap two-col">
		<div>
			<span class="tag tag-accent">Genre Map</span>
			<h3 class="h3">Your listening, placed on Every Noise at Once.</h3>
			<p class="para sm">
				Where your taste sits in the genre space, how it has moved over eight years, and which
				regions border what you already play. Hover a point.
			</p>
			<div class="map">
				<div class="crosshair"></div>
				{#each GENRES as g, i (g.name)}
					<button
						type="button"
						class="dot"
						title={g.name}
						aria-label={g.name}
						aria-pressed={i === genre}
						onclick={() => (genre = i)}
						style:left="{g.x}%"
						style:top="{g.y}%"
						style:width="{g.s}px"
						style:height="{g.s}px"
						style:opacity={i === genre ? 1 : g.o}
						style:background={i === genre ? 'var(--color-accent-700)' : 'var(--color-accent-2-500)'}
					></button>
				{/each}
				<div class="ax-x">organic ← → mechanical</div>
				<div class="ax-y">atmospheric ← → spiky</div>
			</div>
			<div class="readout">
				<div class="readout-name">{GENRES[genre].name}</div>
				<div class="readout-detail">{GENRES[genre].detail}</div>
			</div>
			<div class="caution">
				<strong>This is a placeholder.</strong> Every Noise places <em>artists</em>, so today every
				track by one artist shares its sound coordinates. A
				<a href="/plugins/audio-analysis/">plugin in development</a> will compute per-recording features
				from the real files, through Plex, Jellyfin and OpenSubsonic.
			</div>
		</div>

		<div>
			<span class="tag tag-accent-2">Playlist Lab</span>
			<h3 class="h3">Grow a playlist by moving through your own space.</h3>
			<p class="para sm">
				Ten dimensions: six from the genre map reached through each track's artist, four from your
				own listening — era, familiarity, hour of day, recency. Pick the two you want to see.
			</p>
			<div class="lab-modes">
				{#each Object.keys(LAB) as k (k)}
					<button
						type="button"
						aria-pressed={k === labMode}
						onclick={() => (labMode = k)}
						style:border-color={k === labMode ? 'var(--color-accent)' : 'var(--color-divider)'}
						style:background={k === labMode ? 'var(--color-accent)' : 'transparent'}
						style:color={k === labMode ? 'var(--color-bg)' : 'var(--color-text)'}>{k}</button
					>
				{/each}
			</div>
			<div class="lab">
				<svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
					<polyline
						points={lab.pts.map((p) => p[0] + ',' + p[1]).join(' ')}
						fill="none"
						stroke="#d67f48"
						stroke-width="2"
						stroke-linejoin="round"
						stroke-dasharray="5 4"
					/>
				</svg>
				{#each lab.pts as p, i (i)}
					<div
						class="seed"
						title="seed step {i + 1}"
						style:left="{(p[0] / 400) * 100}%"
						style:top="{(p[1] / 300) * 100}%"
						style:width="{i === 0 ? 14 : 8}px"
						style:height="{i === 0 ? 14 : 8}px"
						style:background={i === 0 ? 'var(--color-accent-300)' : 'var(--color-accent-2-400)'}
					></div>
				{/each}
				<div class="lab-ax">{lab.x}<br />{lab.y}</div>
			</div>
			<p class="fine light">
				Genres attach to artists, so every track by one artist shares its six sound coordinates — the
				listening axes are what separate them. Tracks with no place on the map are dropped and
				counted, never parked in the middle.
			</p>
		</div>
	</div>
</section>

<!-- ── LINER NOTES ───────────────────────────────────── -->
<section class="band">
	<div class="wrap">
		<div class="split notes-split">
			<div>
				<span class="tag tag-accent">Liner Notes</span>
				<h2 class="h2-mid">What you thought at the time, kept next to the music.</h2>
				<p class="para">
					A note is a living document about one thing — a track, a release, an artist, or a single
					playing — edited in place with every earlier version archived, so a rewrite years later
					never erases what you wrote in 2011.
				</p>
				<p class="para">
					Shortcodes resolve against things you've annotated <em>and</em> against your own listen
					history. A reference that matches nothing stays readable prose with a dotted underline —
					never an error, because most of a real library is un-enriched and those are exactly the
					records worth writing about.
				</p>
				<div class="codes">
					{#each ['[[track:3]]', '[[artist:…]]', '[[gear:…]]', '[[line:12]]'] as c (c)}
						<span class="tag tag-neutral mono">{c}</span>
					{/each}
				</div>
			</div>
			<div class="card elev-md pad">
				<div class="note-head">
					<div class="card-kicker flush">Note on a release</div>
					<span class="card-meta">Selected Ambient Works 85–92</span>
					<span class="tag tag-accent-2 push">Private</span>
				</div>
				<label class="sr-only" for="note-input">Liner note text</label>
				<textarea id="note-input" class="input note-input" bind:value={note} spellcheck="false"
				></textarea>
				<div class="fine">Rendered and sanitised server-side — shortcodes resolve in the same pass</div>
				<div class="note-render">
					{#each noteSegments.out as s, i (i)}
						{#if s.kind === 'hit'}
							<span class="wl-hit" title={s.title}>{s.text}</span>
						{:else if s.kind === 'miss'}
							<span class="wl-miss" title={s.title}>{s.text}</span>
						{:else}<span>{s.text}</span>{/if}
					{/each}
				</div>
				<div class="note-foot">
					<span>{noteSegments.resolved} resolved</span>
					<span>{noteSegments.unresolved} left as prose</span>
					<span class="push">rev 4 · edited today</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ── PATCH + MCP ───────────────────────────────────── -->
<section class="band surface">
	<div class="wrap two-col wide-min">
		<div class="card elev-sm pad-lg">
			<span class="tag tag-accent-2 self-start">Patch</span>
			<h3 class="h3">The other decks on your instance.</h3>
			<p class="para sm">
				Everything else in Tapedeck is yours alone. Patch is the part that isn't: patch into another
				deck on your server and their listening appears on The Reel. A patch waits for a yes — being
				followed and being readable are separate states.
			</p>
			<p class="para sm">
				Pass a record along as a <strong>Dub</strong> and it lands in their Crate with your reason
				attached, never in their history. Or listen together in a <strong>Shared Spool</strong>,
				where plays wait in the other's inbox and enter no history until accepted.
			</p>
			<p class="para sm">
				<strong>Two switches, both off, and neither is per listen.</strong> Instance-wide figures stay
				chain-gated whichever you use, because those reach people you never approved.
			</p>
			<a class="btn btn-secondary self-start mt" href="/patch/">Read about Patch →</a>
		</div>
		<div class="card elev-sm pad-lg">
			<span class="tag tag-accent self-start">Model Context Protocol</span>
			<h3 class="h3">Ask a chatbot about your listening.</h3>
			<p class="para sm">
				Twenty-six tools, all of them the same queries the web UI uses. Seven grants, every one off
				by default — your statistics and your journal are separate grants on purpose.
			</p>
			<div class="grants">
				{#each GRANTS as g, i (g.name)}
					<button
						type="button"
						class="grant"
						role="switch"
						aria-checked={grants[i]}
						onclick={() => {
							const g2 = grants.slice();
							g2[i] = !g2[i];
							grants = g2;
						}}
						style:background={grants[i] ? 'var(--td-tint-2)' : 'var(--color-neutral-100)'}
					>
						<span
							class="sw-track"
							style:background={grants[i] ? 'var(--color-accent-2-600)' : 'var(--color-neutral-400)'}
						>
							<span class="sw-knob" style:left={grants[i] ? '15px' : '3px'}></span>
						</span>
						<code>{g.name}</code>
						<span class="grant-what">{g.what}</span>
					</button>
				{/each}
			</div>
			<p class="fine mt">
				A playlist an assistant builds is saved into Tapedeck first and reaches a media server only
				when you send it. Every call is recorded — which tool, when, with what, how many rows came
				back.
			</p>
		</div>
	</div>
</section>

<!-- ── EVERYTHING ELSE ───────────────────────────────── -->
<section class="band">
	<div class="wrap">
		<h2 class="h2-mid tight">And the rest of what it does.</h2>
		<div class="more-grid">
			{#each MORE as f (f.title)}
				<div class="card elev-sm pad-sm">
					<div class="card-kicker">{f.kicker}</div>
					<div class="card-title">{f.title}</div>
					<p class="card-body">{f.body}</p>
				</div>
			{/each}
		</div>
		<div class="mt-lg"><a class="btn btn-secondary big" href="/features/">Every feature, in depth →</a></div>
	</div>
</section>

<!-- ── PLUGINS ───────────────────────────────────────── -->
<section class="band surface">
	<div class="wrap">
		<span class="tag tag-accent-2">Plugins &amp; clients</span>
		<h2 class="h2-mid narrow">Anything that speaks the API works. Plugins go further.</h2>
		<p class="para wide">
			A plugin exists where the wire format runs out — where a player knows the output device, the
			real signal path or the file that was actually decoded, and there is no field to put it in.
			Some are shipped, most are in development, and the page says which.
		</p>
		<div class="teasers">
			{#each PLUGIN_TEASERS as p (p.name)}
				<div class="card elev-sm pad">
					<span class="tag self-start" style:background={p.statusBg} style:color={p.statusFg}
						>{p.status}</span
					>
					<div class="card-title mt-sm">
						{#if p.slug}<a class="plain" href="/plugins/{p.slug}/">{p.name}</a>{:else}{p.name}{/if}
					</div>
					<p class="card-body">{p.body}</p>
				</div>
			{/each}
		</div>
		<div class="cta-row mt-lg">
			<a class="btn btn-primary big" href="/plugins/">Plugins &amp; roadmap →</a>
			<a class="btn btn-secondary big" href="https://github.com/abalajiksh/fooyin-tapeout" rel="noopener"
				>fooyin-tapeout on GitHub</a
			>
		</div>
	</div>
</section>

<!-- ── HONEST CAVEATS ────────────────────────────────── -->
<section class="band band-2">
	<div class="wrap">
		<span class="tag band-2-tag">Known gaps</span>
		<h2 class="h2-mid band-2-ink">Things that look finished and aren't.</h2>
		<p class="para band-2-body">
			A page like this normally stops here. Tapedeck is a system of record, and a system of record
			that overstates itself is worse than one that admits a gap — so these are on the marketing page
			rather than three clicks into an issue tracker.
		</p>
		<div class="caveats">
			{#each CAVEATS as c (c.title)}
				<div class="caveat">
					<div class="caveat-t">{c.title}</div>
					<p class="caveat-b">{c.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── GET IT ────────────────────────────────────────── -->
<section class="band dark">
	<div class="wrap two-col center-items">
		<div>
			<h2 class="h2-big ink">One binary. Your server. Your history.</h2>
			<p class="para ink-2">
				No config files to hunt through and no token to copy out of a console — open the UI on first
				run and it walks you through creating the admin account.
			</p>
			<div class="cta-row">
				<a class="btn accent-btn big" href="https://codeberg.org/abksh/tapedeck" rel="noopener"
					>Get the source on Codeberg</a
				>
				<a class="btn outline big" href="https://demo.tapedeck.cc" rel="noopener">Open the live demo</a>
				<a class="btn outline big" href="/docs/">Quickstart &amp; API</a>
			</div>
			<p class="fine light">
				Requires Rust 1.85+ and Bun; a Docker image is in development.
				<strong class="ink-2"
					>demo.tapedeck.cc runs the real binary on a passively-cooled Raspberry Pi Zero 2 W with a 64
					GB SD card</strong
				> — that is the whole hardware requirement.
			</p>
		</div>
		<div class="term">
			<div><span class="prompt">$</span> git clone https://codeberg.org/abksh/tapedeck.git</div>
			<div><span class="prompt">$</span> cd tapedeck</div>
			<div><span class="prompt">$</span> cargo build --release</div>
			<div><span class="prompt">$</span> ./tapedeck</div>
			<div class="term-ok">📋 Visit the web UI to complete setup.</div>
			<div class="term-dim">   → http://your-server:8080</div>
		</div>
	</div>
</section>

<style>
	/* ── shared scaffolding ───────────────────────────── */
	.wrap {
		max-width: 1180px;
		margin: 0 auto;
	}
	.band {
		padding: 96px 32px;
	}
	.band.surface {
		background: var(--color-surface);
	}
	.band.dark {
		background: var(--color-neutral-900);
		color: var(--td-ink);
	}
	.band.theatre {
		background: #141311;
		color: var(--td-ink);
	}
	.band.band-2 {
		background: var(--td-band-2);
		color: var(--td-band-2-ink);
	}
	.two-col {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 26px;
	}
	.two-col.wide-min {
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
	}
	.split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 56px;
		align-items: start;
		margin-top: 22px;
	}
	.split.narrow-left {
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
	}
	.split.notes-split {
		grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
		gap: 52px;
		margin-top: 0;
	}
	.center-items {
		align-items: center;
	}

	h1 {
		font-size: clamp(44px, 5.2vw, 74px);
		line-height: 1.02;
		margin: 18px 0 0;
		letter-spacing: -0.03em;
		text-wrap: balance;
	}
	.accent {
		color: var(--color-accent-700);
	}
	.h2-big {
		font-size: clamp(32px, 3.8vw, 50px);
		max-width: 22ch;
		letter-spacing: -0.025em;
		line-height: 1.05;
	}
	.h2-mid {
		font-size: clamp(30px, 3.4vw, 46px);
		letter-spacing: -0.02em;
		line-height: 1.06;
		margin-top: 20px;
	}
	.h2-mid.narrow {
		max-width: 22ch;
	}
	.h2-mid.tight {
		max-width: 18ch;
		margin-top: 0;
	}
	.h2-mid.flush {
		margin: 0;
	}
	.h3 {
		font-size: 30px;
		letter-spacing: -0.02em;
		margin: 18px 0 0;
	}
	.lede {
		font-size: 19px;
		max-width: 62ch;
		margin: 24px 0 0;
		color: var(--color-neutral-700);
		text-wrap: pretty;
	}
	.para {
		margin-top: 16px;
		font-size: 17px;
		color: var(--color-neutral-700);
		text-wrap: pretty;
	}
	.para.sm {
		font-size: 16px;
	}
	.para.wide {
		max-width: 64ch;
	}
	.para.flush {
		margin: 0;
		font-size: 16.5px;
	}
	.para.ink-2,
	.ink-2 {
		color: var(--td-ink-2);
	}
	.ink {
		color: var(--td-ink);
	}
	.warm {
		color: var(--color-accent-300);
	}
	.fine {
		font-size: 12.5px;
		color: var(--color-neutral-600);
		margin: 14px 0 0;
	}
	.fine.light {
		color: var(--color-neutral-500);
	}
	.hint {
		font-size: 13px;
		color: var(--color-neutral-600);
		margin-bottom: 12px;
	}
	.push {
		margin-left: auto;
	}
	.self-start {
		align-self: flex-start;
	}
	.mt {
		margin-top: 22px;
	}
	.mt-sm {
		margin-top: 8px;
	}
	.mt-lg {
		margin-top: 26px;
	}
	.pad {
		padding: 26px;
	}
	.pad-sm {
		padding: 22px;
	}
	.pad-lg {
		padding: 32px;
		gap: 0;
	}
	.flush {
		margin: 0;
	}
	.plain {
		color: inherit;
		text-decoration: none;
	}
	.plain:hover {
		color: var(--color-accent-700);
	}
	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
	code {
		font-size: 0.9em;
		background: var(--color-neutral-200);
		padding: 2px 7px;
		border-radius: 6px;
	}
	.btn.big {
		padding: 12px 22px;
		font-size: 15px;
		text-decoration: none;
	}
	.accent-btn {
		background: var(--color-accent);
		color: var(--color-neutral-900);
		text-decoration: none;
		padding: 12px 22px;
		font-size: 15px;
	}
	.outline {
		border: 1px solid #4a4438;
		color: var(--td-ink-2);
		text-decoration: none;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* ── hero ─────────────────────────────────────────── */
	.hero {
		position: relative;
		padding: 96px 32px 72px;
		overflow: hidden;
	}
	.blob {
		position: absolute;
		border-radius: 50%;
		opacity: var(--td-blob-o);
	}
	.blob-a {
		top: -180px;
		right: -140px;
		width: 520px;
		height: 520px;
		background: var(--td-blob-1);
		filter: blur(8px);
	}
	.blob-b {
		bottom: -220px;
		left: -160px;
		width: 440px;
		height: 440px;
		background: var(--td-blob-2);
		filter: blur(10px);
	}
	.hero-grid {
		position: relative;
		max-width: 1180px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
		gap: 64px;
		align-items: center;
	}
	.rise {
		animation: td-rise 0.7s ease both;
	}
	.rise.slow {
		animation: td-rise 0.9s 0.1s ease both;
	}
	.hero .tag {
		margin-bottom: 22px;
	}
	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 32px;
	}
	.cta-row .btn {
		font-size: 15px;
		padding: 12px 22px;
		text-decoration: none;
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 26px;
		margin-top: 44px;
		padding-top: 26px;
		border-top: 1px solid var(--color-divider);
	}
	.stat-n {
		font-family: var(--font-heading);
		font-size: 26px;
	}
	.stat-l {
		font-size: 12px;
		color: var(--color-neutral-600);
	}

	/* ── the deck ─────────────────────────────────────── */
	.deck {
		border-radius: 34px;
		padding: 26px;
		background: var(--color-neutral-900);
		box-shadow: var(--shadow-lg);
		color: var(--td-ink);
	}
	.deck-top {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 18px;
	}
	.lamp {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.deck-state {
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-neutral-400);
	}
	.deck-src {
		margin-left: auto;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.cassette-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 22px;
		align-items: start;
	}
	.shell {
		border-radius: 18px;
		padding: 13px;
		background: #211f1a;
		border: 1.5px solid var(--color-accent-600);
	}
	.label {
		border-radius: 12px;
		padding: 15px 13px;
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
		width: 70%;
		background: var(--color-accent-2-500);
	}
	.well {
		position: relative;
		margin-top: 13px;
		border-radius: 14px;
		padding: 18px 14px;
		background: #191712;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
	}
	.tape-span {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 66px;
		height: 14px;
		background: #332f27;
	}
	.reel {
		position: relative;
		width: 70px;
		height: 70px;
		animation: td-spin 2.4s linear infinite;
	}
	.np-title {
		font-family: var(--font-heading);
		font-size: 29px;
		line-height: 1.08;
		color: var(--td-ink);
	}
	.np-meta {
		font-size: 15px;
		color: var(--td-ink-2);
		margin-top: 6px;
	}
	.np-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 16px;
	}
	.np-row.wrap {
		flex-wrap: wrap;
		margin-top: 18px;
	}
	.codec {
		background: var(--color-accent-2-800);
		color: var(--color-accent-2-100);
		font-size: 11px;
	}
	.meters {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 26px;
	}
	.meters span {
		width: 4px;
		border-radius: 2px;
	}
	.clock {
		font-size: 12px;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
		color: var(--td-ink-2);
	}
	.counter {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 7px 13px;
		border-radius: 999px;
		background: #191712;
		border: 1px solid #3a352c;
		white-space: nowrap;
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
	.progress-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 18px;
	}
	.tick {
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: var(--color-neutral-400);
		min-width: 38px;
	}
	.tick.right {
		text-align: right;
	}
	.track {
		flex: 1;
		height: 5px;
		border-radius: 999px;
		background: #3a352c;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: 999px;
		background: var(--color-accent);
	}
	.fill.sage {
		background: var(--color-accent-2-400);
	}
	.deck-btns {
		display: flex;
		gap: 10px;
		margin-top: 16px;
	}
	.deck-go {
		flex: 1;
		cursor: pointer;
		font-family: var(--font-heading);
		font-size: 14px;
		padding: 11px;
		border-radius: 999px;
		border: none;
		background: var(--color-accent);
		color: var(--color-neutral-900);
	}
	.deck-go:hover {
		background: var(--color-accent-400);
	}
	.deck-next,
	.deck-reset {
		cursor: pointer;
		font: inherit;
		font-size: 13px;
		padding: 11px 18px;
		border-radius: 999px;
		border: 1px solid #4a4438;
		background: transparent;
		color: var(--td-ink-2);
	}
	.deck-reset {
		padding: 11px 16px;
		color: var(--color-neutral-400);
	}
	.deck-next:hover,
	.deck-reset:hover {
		background: #332f27;
	}
	.chain-block {
		margin-top: 22px;
		padding-top: 20px;
		border-top: 1px solid #3a352c;
	}
	.chain-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 14px;
		flex-wrap: wrap;
	}
	.eyebrow-d {
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.chain-tag {
		background: var(--color-accent-2-800);
		color: var(--color-accent-2-200);
		font-size: 10px;
	}
	.rung-note {
		margin-left: auto;
		font-size: 10px;
		color: var(--color-neutral-500);
	}
	.chain-steps {
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		gap: 6px;
	}
	.step {
		flex: 1;
		min-width: 96px;
		padding: 10px 12px;
		border-radius: 14px;
		border: 1px solid #4a4438;
	}
	.step-kind {
		font-size: 9px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.step-name {
		font-size: 13px;
		color: var(--td-ink);
		margin-top: 3px;
	}
	.step-detail {
		font-size: 10px;
		color: var(--color-neutral-500);
	}
	.chain-foot {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 16px;
		font-size: 11px;
		color: var(--color-neutral-400);
	}
	.deck-note {
		font-size: 12px;
		color: var(--color-neutral-600);
		margin: 12px 4px 0;
		text-align: center;
	}

	/* ── cards row ────────────────────────────────────── */
	.tri {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 18px;
		margin-top: 48px;
	}

	/* ── chain ladder ─────────────────────────────────── */
	.ladder {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.rung {
		cursor: pointer;
		text-align: left;
		display: flex;
		gap: 16px;
		align-items: flex-start;
		padding: 18px 20px;
		border-radius: 22px;
		border: 1px solid var(--color-divider);
		font: inherit;
		color: inherit;
	}
	.rung-n {
		display: grid;
		place-items: center;
		flex: none;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		font-family: var(--font-heading);
		font-size: 14px;
	}
	.rung-title {
		display: block;
		font-family: var(--font-heading);
		font-size: 17px;
	}
	.rung-body {
		display: block;
		font-size: 13.5px;
		color: var(--color-neutral-700);
		margin-top: 4px;
	}
	.payload {
		margin-top: 18px;
		padding: 20px 22px;
		border-radius: 22px;
		background: var(--color-neutral-900);
		color: var(--td-ink-2);
	}
	.payload-l {
		color: var(--color-neutral-500);
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin-bottom: 10px;
	}
	.payload-code {
		white-space: pre-wrap;
		color: var(--color-accent-200);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13px;
		line-height: 1.7;
	}
	.payload-out {
		margin-top: 14px;
		padding-top: 12px;
		border-top: 1px solid #3a352c;
		font-size: 13px;
	}
	.payload-out strong {
		color: var(--color-accent-300);
	}

	/* ── the shelf ────────────────────────────────────── */
	.on-dark {
		background: var(--color-accent-800);
		color: var(--color-accent-200);
	}
	.media-tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 24px;
	}
	.tag.media {
		background: #332f27;
		color: var(--td-ink-2);
	}
	.band.dark .accent-btn {
		display: inline-block;
		margin-top: 26px;
	}
	.panel-dark {
		border-radius: 30px;
		padding: 26px;
		background: #2a2721;
		border: 1px solid #3f3a31;
	}
	.platter-row {
		display: flex;
		gap: 22px;
		align-items: center;
	}
	.platter {
		position: relative;
		flex: none;
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background: radial-gradient(circle at center, #12110f 0 18%, #1c1a16 18% 100%);
		display: grid;
		place-items: center;
		box-shadow:
			0 0 0 1px #3f3a31,
			inset 0 0 40px rgba(0, 0, 0, 0.7);
		animation: td-spin 1.8s linear infinite;
	}
	.groove {
		position: absolute;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.g1 {
		inset: 14px;
	}
	.g2 {
		inset: 30px;
	}
	.spindle {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background: var(--color-accent-600);
		display: grid;
		place-items: center;
		color: #1c1a16;
		font-family: var(--font-heading);
		font-size: 11px;
	}
	.rec-meta {
		min-width: 0;
	}
	.rec-title {
		font-family: var(--font-heading);
		font-size: 22px;
		line-height: 1.15;
		margin-top: 6px;
		color: var(--td-ink);
	}
	.rec-artist {
		font-size: 14px;
		color: var(--color-accent-300);
	}
	.rec-note {
		font-size: 12px;
		color: var(--color-neutral-500);
		margin-top: 6px;
	}
	.side-list {
		margin-top: 22px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.side-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 9px 12px;
		border-radius: 14px;
	}
	.side-no {
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: var(--color-neutral-500);
		width: 22px;
	}
	.side-title {
		flex: 1;
		font-size: 14px;
	}
	.side-state {
		font-size: 11px;
	}
	.side-len {
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: var(--color-neutral-500);
	}
	.panel-dark .fine {
		color: var(--color-neutral-500);
		font-size: 11.5px;
	}

	/* ── lyrics theatre ───────────────────────────────── */
	.split.lyric-head {
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.62fr);
		gap: 44px;
		align-items: end;
		margin-top: 20px;
	}
	.theatre-grid {
		margin-top: 38px;
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) minmax(0, 300px);
		border-radius: 30px;
		overflow: hidden;
		background: #100f0d;
		border: 1px solid #2b2721;
	}
	.rail {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding: 22px 0;
		background: #0d0c0b;
	}
	.rail-n {
		font-size: 10px;
		writing-mode: vertical-rl;
		color: var(--color-neutral-600);
		font-variant-numeric: tabular-nums;
	}
	.rail-track {
		position: relative;
		flex: 1;
		width: 5px;
		margin: 14px 0;
		border-radius: 999px;
		background: #252119;
	}
	.rail-fill {
		position: absolute;
		top: 0;
		left: 0;
		width: 5px;
		border-radius: 999px;
		background: linear-gradient(to bottom, var(--color-accent-2-500), var(--color-accent-500));
	}
	.rail-head {
		position: absolute;
		left: -3px;
		width: 11px;
		height: 3px;
		border-radius: 999px;
		background: var(--td-ink);
	}
	.words {
		padding: 52px 44px;
		min-height: 440px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2px;
	}
	.line {
		cursor: pointer;
		padding: 5px 0;
		display: flex;
		gap: 18px;
		align-items: flex-start;
		background: none;
		border: none;
		font: inherit;
		text-align: left;
		width: 100%;
	}
	.line.cur {
		padding: 14px 0;
	}
	.line-bar {
		flex: none;
		width: 3px;
		align-self: stretch;
		border-radius: 999px;
	}
	.line-text {
		font-family: var(--font-body);
		font-size: clamp(17px, 1.5vw, 23px);
		line-height: 1.55;
		text-wrap: pretty;
	}
	.line.cur .line-text {
		font-family: var(--font-heading);
		font-size: clamp(30px, 3.4vw, 50px);
		line-height: 1.08;
		letter-spacing: -0.02em;
	}
	.line-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin: 22px 0 0 21px;
	}
	.quote,
	.pin {
		cursor: pointer;
		font: inherit;
		font-family: var(--font-heading);
		font-size: 14px;
		padding: 11px 20px;
		border-radius: 999px;
	}
	.quote {
		border: none;
		background: var(--color-accent);
		color: #141311;
	}
	.pin {
		border: 1px solid #3a352c;
		background: transparent;
		color: var(--td-ink);
	}
	.chip {
		padding: 8px 14px;
		border-radius: 999px;
		background: #1c1a16;
		font-size: 11.5px;
		color: var(--color-neutral-500);
	}
	.running-order {
		padding: 26px 24px;
		background: #0d0c0b;
		border-left: 1px solid #2b2721;
	}
	.ro-title {
		font-family: var(--font-heading);
		font-size: 19px;
		color: var(--td-ink);
	}
	.ro-meta {
		font-size: 13px;
		color: var(--td-ink-2);
	}
	.ro-tags {
		display: flex;
		gap: 7px;
		margin-top: 14px;
	}
	.tag.timed {
		background: var(--color-accent-2-800);
		color: var(--color-accent-2-100);
		font-size: 11px;
	}
	.tag.follow {
		background: #1c1a16;
		color: var(--td-ink-2);
		font-size: 11px;
	}
	.ro-side {
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-neutral-600);
		margin: 22px 0 10px;
	}
	.ro-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.ro-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		border-radius: 12px;
	}
	.ro-no {
		font-size: 11px;
		color: var(--color-neutral-600);
		width: 14px;
		font-variant-numeric: tabular-nums;
	}
	.ro-name {
		flex: 1;
		font-size: 13.5px;
	}
	.ro-len {
		font-size: 11px;
		color: var(--color-neutral-600);
		font-variant-numeric: tabular-nums;
	}
	.theatre-note {
		font-size: 12.5px;
		color: var(--color-neutral-600);
		margin: 16px 4px 0;
		max-width: 92ch;
		text-wrap: pretty;
	}

	/* ── statistics ───────────────────────────────────── */
	.stats-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 22px;
		margin-top: 40px;
	}
	.clock-head {
		display: flex;
		align-items: baseline;
		gap: 10px;
		flex-wrap: wrap;
	}
	.clock-head .card-title {
		font-size: 19px;
	}
	.clock {
		display: flex;
		gap: 6px;
		margin-top: 16px;
	}
	.daycol {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding-top: 15px;
	}
	.day {
		height: 18px;
		font-size: 10px;
		color: var(--color-neutral-600);
		line-height: 18px;
	}
	.heatwrap {
		flex: 1;
		min-width: 0;
	}
	.hours {
		display: grid;
		grid-template-columns: repeat(24, 1fr);
		gap: 3px;
		font-size: 9px;
		color: var(--color-neutral-600);
		margin-bottom: 4px;
		text-align: center;
	}
	.heat {
		display: grid;
		grid-template-columns: repeat(24, 1fr);
		gap: 3px;
	}
	.heat > div {
		height: 18px;
		border-radius: 5px;
	}
	.legend {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 14px;
		font-size: 11px;
		color: var(--color-neutral-600);
		flex-wrap: wrap;
	}
	.sw {
		width: 16px;
		height: 10px;
		border-radius: 3px;
	}
	.persona {
		font-family: var(--font-heading);
		font-size: 27px;
		line-height: 1.1;
		margin: 4px 0 6px;
	}
	.persona-note {
		font-size: 13px;
		color: var(--color-neutral-600);
		margin: 0 0 18px;
	}
	.axes {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.axis-ends {
		display: flex;
		justify-content: space-between;
		font-size: 11.5px;
		color: var(--color-neutral-700);
	}
	.axis-track {
		position: relative;
		height: 8px;
		margin-top: 6px;
		border-radius: 999px;
		background: var(--color-neutral-200);
	}
	.axis-dot {
		position: absolute;
		top: -3px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-accent);
		box-shadow: var(--shadow-sm);
	}
	.figs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 18px;
		margin-top: 22px;
	}
	.fig {
		font-family: var(--font-heading);
		font-size: 34px;
	}

	/* ── genre map + lab ──────────────────────────────── */
	.map {
		position: relative;
		margin-top: 20px;
		aspect-ratio: 4/3;
		border-radius: 26px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
		overflow: hidden;
	}
	.crosshair {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				to right,
				transparent 49.6%,
				var(--color-divider) 49.6%,
				var(--color-divider) 50.4%,
				transparent 50.4%
			),
			linear-gradient(
				to bottom,
				transparent 49.6%,
				var(--color-divider) 49.6%,
				var(--color-divider) 50.4%,
				transparent 50.4%
			);
	}
	.dot {
		position: absolute;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		border: none;
		cursor: pointer;
		padding: 0;
	}
	.ax-x {
		position: absolute;
		left: 12px;
		bottom: 10px;
		font-size: 10px;
		color: var(--color-neutral-600);
	}
	.ax-y {
		position: absolute;
		left: 12px;
		top: 10px;
		font-size: 10px;
		color: var(--color-neutral-600);
		writing-mode: vertical-rl;
	}
	.readout {
		margin-top: 14px;
		padding: 14px 18px;
		border-radius: 20px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
	}
	.readout-name {
		font-family: var(--font-heading);
		font-size: 17px;
	}
	.readout-detail {
		font-size: 13px;
		color: var(--color-neutral-700);
	}
	.caution {
		margin-top: 12px;
		padding: 14px 18px;
		border-radius: 20px;
		background: var(--color-accent-100);
		border: 1px solid var(--color-accent-300);
		font-size: 12.5px;
		color: var(--color-accent-800);
		text-wrap: pretty;
	}
	.caution a {
		color: var(--color-accent-800);
	}
	.lab-modes {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 18px;
	}
	.lab-modes button {
		cursor: pointer;
		font: inherit;
		font-size: 13px;
		padding: 7px 15px;
		border-radius: 999px;
		border: 1px solid var(--color-divider);
	}
	.lab {
		position: relative;
		margin-top: 16px;
		aspect-ratio: 4/3;
		border-radius: 26px;
		background: var(--color-neutral-900);
		overflow: hidden;
	}
	.lab svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.seed {
		position: absolute;
		transform: translate(-50%, -50%);
		border-radius: 50%;
	}
	.lab-ax {
		position: absolute;
		right: 14px;
		bottom: 12px;
		font-size: 10px;
		color: var(--color-neutral-500);
		text-align: right;
	}

	/* ── liner notes ──────────────────────────────────── */
	.codes {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 22px;
	}
	.note-head {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.note-input {
		margin-top: 14px;
		min-height: 132px;
		font-size: 14px;
		line-height: 1.6;
		border-radius: 20px;
		background: var(--color-neutral-100);
		width: 100%;
	}
	.note-render {
		margin-top: 8px;
		padding: 18px 20px;
		border-radius: 22px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
		font-size: 15px;
		line-height: 1.75;
	}
	.wl-hit {
		background: var(--color-accent-100);
		color: var(--color-accent-800);
		padding: 1px 8px;
		border-radius: 999px;
		white-space: nowrap;
	}
	.wl-miss {
		border-bottom: 1.5px dotted var(--color-neutral-500);
	}
	.note-foot {
		display: flex;
		gap: 14px;
		margin-top: 12px;
		font-size: 11.5px;
		color: var(--color-neutral-600);
	}

	/* ── MCP grants ───────────────────────────────────── */
	.grants {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 18px;
	}
	.grant {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		font: inherit;
		text-align: left;
		padding: 10px 14px;
		border-radius: 16px;
		border: 1px solid var(--color-divider);
	}
	.sw-track {
		width: 30px;
		height: 18px;
		flex: none;
		border-radius: 999px;
		position: relative;
	}
	.sw-knob {
		position: absolute;
		top: 3px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-bg);
	}
	.grant code {
		font-size: 12.5px;
		color: var(--td-on-tint);
		background: none;
		padding: 0;
	}
	.grant-what {
		margin-left: auto;
		font-size: 11.5px;
		color: var(--color-neutral-600);
	}

	/* ── everything else / plugins / caveats ──────────── */
	.more-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
		gap: 16px;
		margin-top: 38px;
	}
	.teasers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 16px;
		margin-top: 34px;
	}
	.band-2-tag {
		background: var(--td-band-2-tag);
		color: var(--td-band-2-tag-ink);
	}
	.band-2-ink {
		color: var(--td-band-2-ink);
	}
	.band-2-body {
		color: var(--td-band-2-ink);
		opacity: 0.88;
		max-width: 62ch;
	}
	.caveats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
		margin-top: 36px;
	}
	.caveat {
		padding: 22px 24px;
		border-radius: 24px;
		background: var(--td-band-2-card);
		border: 1px solid var(--td-band-2-edge);
	}
	.caveat-t {
		font-family: var(--font-heading);
		font-size: 17px;
		color: var(--td-band-2-ink);
	}
	.caveat-b {
		margin: 8px 0 0;
		font-size: 14px;
		color: var(--td-band-2-ink);
		opacity: 0.82;
		text-wrap: pretty;
	}

	/* ── get it ───────────────────────────────────────── */
	.term {
		border-radius: 26px;
		padding: 24px 26px;
		background: #23211c;
		border: 1px solid #3a352c;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13.5px;
		line-height: 2;
		color: var(--td-ink-2);
		overflow-x: auto;
	}
	.prompt {
		color: var(--color-neutral-600);
	}
	.term-ok {
		color: var(--color-accent-300);
		margin-top: 10px;
	}
	.term-dim {
		color: var(--color-neutral-500);
		white-space: pre;
	}

	/* ── narrow ───────────────────────────────────────── */
	@media (max-width: 900px) {
		.split,
		.split.narrow-left,
		.split.notes-split,
		.split.lyric-head,
		.stats-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 32px;
		}
		.theatre-grid {
			grid-template-columns: 44px minmax(0, 1fr);
		}
		.running-order {
			grid-column: 1 / -1;
			border-left: none;
			border-top: 1px solid #2b2721;
		}
	}
	@media (max-width: 640px) {
		.hero {
			padding: 56px 20px 48px;
		}
		.hero-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 40px;
		}
		.band {
			padding: 60px 20px;
		}
		.words {
			padding: 34px 22px;
			min-height: 0;
		}
		.platter-row {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
