<script>
	import { DEMO_URL, ACCOUNT, RESET_AT, RULES, NOTES } from '$lib/demoData.js';

	// Same pattern as the install page: a copy button that falls back to the
	// text simply being there to select when the clipboard is refused.
	let copied = $state(null);

	async function copy(what, text) {
		try {
			await navigator.clipboard.writeText(text);
			copied = what;
			setTimeout(() => copied === what && (copied = null), 1600);
		} catch {
			// No clipboard permission. The field is selectable either way.
		}
	}
</script>

<svelte:head>
	<title>The live demo — Tapedeck</title>
	<meta
		name="description"
		content="Sign in to the public Tapedeck demo with the shared admin account. It runs the real binary on a Raspberry Pi, and the whole database is rebuilt every night."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<span class="tag tag-accent">Live demo</span>
		<h1>Here is the login. Open it in a second tab.</h1>
		<p class="lede">
			<a href={DEMO_URL} rel="noopener">demo.tapedeck.cc</a> is a real Tapedeck with years of listening
			in it — the same binary the packages install, on a Raspberry Pi Zero 2 W. One account is shared
			with everyone, it is the admin, and everything in the database is thrown away and rebuilt at
			{RESET_AT} every night.
		</p>
	</div>
</header>

<section class="band surface">
	<div class="wrap">
		<div class="signin">
			<div class="creds">
				<h2 class="h2 flush">The shared account</h2>
				<p class="para sm">
					Open the demo in a new tab and come back here to copy each field — that is what this page
					is for.
				</p>

				<div class="field">
					<span class="field-l">Username</span>
					<code class="field-v">{ACCOUNT.username}</code>
					<button
						type="button"
						class="copy"
						onclick={() => copy('user', ACCOUNT.username)}
						aria-label="Copy the username">{copied === 'user' ? 'Copied' : 'Copy'}</button
					>
				</div>

				<div class="field">
					<span class="field-l">Password</span>
					<code class="field-v">{ACCOUNT.password}</code>
					<button
						type="button"
						class="copy"
						onclick={() => copy('pass', ACCOUNT.password)}
						aria-label="Copy the password">{copied === 'pass' ? 'Copied' : 'Copy'}</button
					>
				</div>

				<div class="cta-row">
					<a
						class="btn btn-primary big"
						href={DEMO_URL}
						target="_blank"
						rel="noopener">Open the demo in a new tab ↗</a
					>
				</div>
				<p class="fine">
					It opens in a new tab on purpose, so this one stays where it is with the password on it.
				</p>
			</div>

			<aside class="warn-card">
				<span class="tag warn-tag">Read this first</span>
				<p class="warn-lede">
					This login is <strong>admin, and public</strong>. Everyone who opens this page gets the
					same one, so anything you connect to it, anyone can read.
				</p>
				<p class="warn-body">
					Have a look around with it — then make yourself an ordinary account and do the rest of your
					looking from there.
				</p>
				<p class="warn-body">
					Nothing you do needs cleaning up afterwards. The reset at {RESET_AT} takes care of it.
				</p>
			</aside>
		</div>
	</div>
</section>

<section class="band">
	<div class="wrap">
		<h2 class="h2">Three house rules</h2>
		<p class="para wide mt-sm">
			None of them are there to stop you trying things. They are there because a shared admin login on
			a public server is exactly as dangerous as it sounds, and because the nightly wipe makes almost
			everything else safe.
		</p>
		<div class="rules mt">
			{#each RULES as r (r.n)}
				<article class="rule" class:warn={r.tone === 'warn'}>
					<div class="rule-n">{r.n}</div>
					<div>
						<h3 class="rule-t">{r.title}</h3>
						<p class="rule-b">{r.body}</p>
						<p class="rule-b dim">{r.body2}</p>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<section class="band surface">
	<div class="wrap">
		<h2 class="h2">What you are actually looking at</h2>
		<div class="grid-320 mt">
			{#each NOTES as [title, body] (title)}
				<div class="card elev-sm pad-sm">
					<div class="card-title">{title}</div>
					<p class="card-body">{body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="band dark">
	<div class="wrap narrow-wrap">
		<h2 class="h2-mid ink">Liked it enough to keep the history?</h2>
		<p class="para ink-2">
			Then run your own, where the account is yours and nothing is wiped at two in the morning. It is
			one package on openSUSE, Fedora, Debian, Ubuntu or Arch, and the first run walks you through
			creating the admin account — there is no token to copy out of a console.
		</p>
		<div class="cta-row">
			<a class="btn accent-btn big" href="/install/">Install it</a>
			<a class="btn outline big" href="/features/">Every feature, in depth</a>
			<a class="btn outline big" href="/docs/">Quickstart &amp; API</a>
		</div>
	</div>
</section>

<style>
	.flush {
		margin-bottom: 10px;
	}
	.mt {
		margin-top: 26px;
	}
	.mt-sm {
		margin-top: 14px;
	}
	.narrow-wrap {
		max-width: 760px;
	}
	.h2-mid {
		font-size: clamp(30px, 3.4vw, 46px);
		letter-spacing: -0.02em;
		line-height: 1.06;
		margin-top: 20px;
	}
	.pad-sm {
		padding: 22px;
	}
	.cta-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin-top: 32px;
	}
	.cta-row .btn {
		font-size: 15px;
		padding: 12px 22px;
		text-decoration: none;
	}
	.btn.big {
		font-size: 16px;
		padding: 14px 26px;
	}

	/* ── the sign-in panel ────────────────────────────── */
	.signin {
		display: grid;
		grid-template-columns: 1.25fr 1fr;
		gap: 30px;
		align-items: start;
	}
	.creds {
		padding: 34px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-divider);
		background: var(--color-bg);
		box-shadow: var(--shadow-sm);
	}
	.field {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-top: 14px;
		padding: 14px 18px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-divider);
		background: var(--color-neutral-100);
	}
	.field-l {
		flex: 0 0 86px;
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.field-v {
		flex: 1 1 auto;
		min-width: 0;
		overflow-x: auto;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 17px;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: var(--color-text);
		user-select: all;
	}
	.copy {
		flex: 0 0 auto;
		cursor: pointer;
		font: inherit;
		font-size: 12px;
		line-height: 1;
		padding: 8px 14px;
		border-radius: 999px;
		border: 1px solid var(--color-divider);
		background: var(--color-bg);
		color: var(--color-text);
	}
	.copy:hover {
		border-color: var(--color-accent);
		color: var(--color-accent-700);
	}
	.creds .cta-row {
		margin-top: 24px;
	}

	/* ── the warning beside it ────────────────────────── */
	.warn-card {
		padding: 30px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-accent-400);
		background: var(--color-accent-100);
	}
	.warn-tag {
		background: var(--color-accent-700);
		color: var(--color-bg);
	}
	.warn-lede {
		margin: 16px 0 0;
		font-size: 17px;
		line-height: 1.5;
		color: var(--color-accent-900);
	}
	.warn-body {
		margin: 12px 0 0;
		font-size: 14.5px;
		line-height: 1.6;
		color: var(--color-accent-800);
	}

	/* ── the rules ────────────────────────────────────── */
	.rules {
		display: grid;
		gap: 16px;
	}
	.rule {
		display: grid;
		grid-template-columns: 54px 1fr;
		gap: 20px;
		padding: 26px 28px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-divider);
		background: var(--color-bg);
	}
	.rule.warn {
		border-color: var(--color-accent-400);
		background: var(--color-accent-100);
	}
	.rule-n {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		font-size: 18px;
		font-weight: 700;
		background: var(--color-neutral-200);
		color: var(--color-text);
	}
	.rule.warn .rule-n {
		background: var(--color-accent-700);
		color: var(--color-bg);
	}
	.rule-t {
		margin: 4px 0 0;
		font-size: 19px;
		line-height: 1.3;
	}
	.rule-b {
		margin: 10px 0 0;
		font-size: 15px;
		line-height: 1.65;
		color: var(--color-text);
	}
	.rule-b.dim {
		color: var(--color-neutral-600);
	}
	/* The warn card is light in both themes, so its text cannot inherit the
	   theme's ink — in dark mode that is cream on cream. */
	.rule.warn .rule-t,
	.rule.warn .rule-b {
		color: var(--color-accent-900);
	}
	.rule.warn .rule-b.dim {
		color: var(--color-accent-800);
	}

	@media (max-width: 900px) {
		.signin {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 560px) {
		.creds {
			padding: 24px;
		}
		.field {
			flex-wrap: wrap;
			gap: 10px;
		}
		.field-l {
			flex-basis: 100%;
		}
		.rule {
			grid-template-columns: 1fr;
			gap: 14px;
		}
	}
</style>
