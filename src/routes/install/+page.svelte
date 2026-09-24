<script>
	import {
		DISTROS,
		PATHS,
		OBS_PACKAGE,
		ONE_CLICK,
		KEY_FPR_SPACED
	} from '$lib/installData.js';

	// Which repository each distribution's picker is on. Prerendered at the
	// first, so without JavaScript every section still shows working commands.
	let picked = $state(Object.fromEntries(DISTROS.map((d) => [d.id, 0])));

	let copied = $state(null);

	async function copy(id, lines) {
		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			copied = id;
			setTimeout(() => copied === id && (copied = null), 1600);
		} catch {
			// No clipboard permission: the text is still there to select.
		}
	}

	const AFTER = [
		'sudoedit /etc/tapedeck/tapedeck.env',
		'# set MUSICBRAINZ_CONTACT to an email address or URL, at least',
		'sudo systemctl enable --now tapedeck'
	];
</script>

<svelte:head>
	<title>Install — Tapedeck</title>
	<meta
		name="description"
		content="Install Tapedeck from its package repositories on openSUSE, Fedora, Debian, Ubuntu or Arch Linux, then start the service and create the admin account."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<span class="tag tag-accent">Install</span>
		<h1>A package for your distribution.</h1>
		<p class="lede">
			Every release is built on the openSUSE Build Service for five distributions, on x86_64 and —
			for most of them — ARM. Add the repository once, and new versions arrive with the rest of your
			system updates. No Rust toolchain and no Bun on the machine that runs it.
		</p>
		<nav class="pillrow jump" aria-label="Jump to">
			{#each DISTROS as d (d.id)}
				<a class="pill lg" href="#{d.id}">{d.name}</a>
			{/each}
			<a class="pill lg" href="#after">After installing</a>
			<a class="pill lg" href="#elsewhere">Anything else</a>
		</nav>
	</div>
</header>

<section class="band surface">
	<div class="wrap">
		<h2 class="h2 mid">What is built</h2>
		<div class="scroll-x mt-sm">
			<table class="table cover">
				<thead>
					<tr><th>Distribution</th><th>OBS repository</th><th>Architectures</th></tr>
				</thead>
				<tbody>
					{#each DISTROS as d (d.id)}
						{#each d.repos as r (r.repo)}
							<tr>
								<td><a href="#{d.id}">{r.label}</a></td>
								<td><code>{r.repo}</code></td>
								<td>{r.arch}</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
		<p class="para xs wide-70">
			The build log and the files for each one are on the
			<a href={OBS_PACKAGE} rel="noopener">OBS package page</a>. openSUSE's
			<a href={ONE_CLICK} rel="noopener">download page</a> writes the same commands for your
			distribution, if you would rather take them from there.
		</p>
	</div>
</section>

<section class="band">
	<div class="wrap distros">
		{#each DISTROS as d (d.id)}
			{@const repo = d.repos[picked[d.id]]}
			{@const lines = d.commands(repo.repo)}
			<article class="distro" id={d.id}>
				<div class="distro-head">
					<h2 class="h2 sm">{d.name}</h2>
					{#if d.repos.length > 1}
						<div class="pillrow" role="group" aria-label="{d.name} release">
							{#each d.repos as r, i (r.repo)}
								<button
									type="button"
									class="pill"
									class:on={i === picked[d.id]}
									aria-pressed={i === picked[d.id]}
									onclick={() => (picked[d.id] = i)}>{r.label}</button
								>
							{/each}
						</div>
					{/if}
				</div>
				<div class="term-box">
					<div class="term-bar">
						<span>{repo.label} · {repo.arch}</span>
						<button type="button" class="copy" onclick={() => copy(d.id, lines)}
							>{copied === d.id ? 'Copied' : 'Copy'}</button
						>
					</div>
					<div class="term">
						{#each lines as line (line)}
							<div><span class="prompt">$</span> {line}</div>
						{/each}
					</div>
				</div>
				<p class="para xs wide-70">{d.note}</p>
			</article>
		{/each}
	</div>
</section>

<section class="band dark" id="after">
	<div class="wrap grid-320">
		<div>
			<h2 class="h2 mid on-dark">After installing</h2>
			<p class="para ink-2 sm-plus">
				The service is installed but <strong>not started</strong>, on every distribution. Until
				someone creates the first admin account, the setup page answers anyone who can reach port
				8080. So it starts when you start it, not as a side effect of a package install.
			</p>
			<div class="term">
				{#each AFTER as line (line)}
					{#if line.startsWith('#')}
						<div class="comment">{line}</div>
					{:else}
						<div><span class="prompt">$</span> {line}</div>
					{/if}
				{/each}
				<div class="term-ok">📋 Visit the web UI to complete setup.</div>
				<div class="term-dim">   → http://your-server:8080</div>
			</div>
			<p class="para ink-2 sm-plus">
				<code>MUSICBRAINZ_CONTACT</code> is the one setting to fill in. MusicBrainz blocks clients
				that don't identify themselves. Leave it empty and the MusicBrainz and Cover Art Archive
				lookups stay off, and the log says so. Behind a reverse proxy, set
				<code>TRUST_PROXY=true</code> and <code>PUBLIC_URL</code> in the same file. Everything
				else is set in the web UI.
			</p>
		</div>
		<div>
			<h3 class="h3 ink">Where it keeps things</h3>
			<div class="paths">
				{#each PATHS as [p, what] (p)}
					<div class="path">
						<code class="path-k">{p}</code>
						<span class="path-v">{what}</span>
					</div>
				{/each}
			</div>
			<p class="para ink-2 sm-plus">
				It runs as a systemd dynamic user. There is no <code>tapedeck</code> account to create, and
				nothing else on the host can write to its directories. Logs are also in
				<code>journalctl -u tapedeck</code>.
			</p>
			<h3 class="h3 ink spaced">Backups and upgrades</h3>
			<p class="para ink-2 sm-plus">
				Back up <code>/var/lib/tapedeck</code>, but keep <code>tapedeck.key</code> out of the database
				backups. A backup stored with its key is the same as no encryption. Fedora and openSUSE
				restart the service when an upgrade lands. On Debian, Ubuntu and Arch the old version keeps
				running until you <code>sudo systemctl restart tapedeck</code>.
			</p>
		</div>
	</div>
</section>

<section class="band surface" id="elsewhere">
	<div class="wrap grid-320">
		<div>
			<h2 class="h2 sm">Anything else</h2>
			<p class="para sm">
				Tapedeck is packaged for Linux only. On Debian 12, Ubuntu 22.04 or 24.04, another
				distribution, or another system, <a href="/docs/#build">build it from source</a>. You need
				Rust 1.88+ and Bun, and <code>cargo build --release</code> gives you one binary with the UI
				inside. A Docker image is <a href="/plugins/">in development</a>.
			</p>
			<p class="para sm">
				Or <a href="https://demo.tapedeck.cc" rel="noopener">try the demo</a> first. It is the real
				binary on a Raspberry Pi Zero 2 W.
			</p>
		</div>
		<div>
			<h2 class="h2 sm">The signing key</h2>
			<p class="para sm">
				Every repository is signed by the same key: <strong>home:abksh OBS Project</strong>. Check
				its fingerprint before you trust it.
			</p>
			<div class="fpr">{KEY_FPR_SPACED}</div>
		</div>
	</div>
</section>

<style>
	.jump {
		margin-top: 26px;
	}
	.jump .pill {
		text-decoration: none;
	}
	.jump .pill:hover {
		border-color: var(--color-accent);
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
	.wide-70 {
		max-width: 70ch;
	}
	.mt-sm {
		margin-top: 18px;
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
	.band.dark a:not(.btn) {
		color: var(--color-accent-400);
	}

	.cover {
		min-width: 520px;
	}
	.cover td code {
		white-space: nowrap;
	}

	/* ── one section per distribution ─────────────────── */
	.distros {
		display: flex;
		flex-direction: column;
		gap: 56px;
	}
	.distro {
		/* Clear the sticky nav when arriving from a #fragment. */
		scroll-margin-top: 96px;
	}
	#after,
	#elsewhere {
		scroll-margin-top: 72px;
	}
	.distro-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
	}
	.distro-head .h2 {
		margin: 0;
	}
	.pill.on {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-bg);
	}

	.term-box {
		margin-top: 16px;
		border-radius: 26px;
		background: var(--color-neutral-900);
		overflow: hidden;
	}
	.term-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px 0 24px;
		font-size: 12px;
		color: var(--color-neutral-500);
	}
	.copy {
		cursor: pointer;
		font: inherit;
		font-size: 12px;
		line-height: 1;
		padding: 7px 13px;
		border-radius: 999px;
		border: 1px solid #4a4438;
		background: transparent;
		color: var(--td-ink-2);
	}
	.copy:hover {
		border-color: var(--color-accent-400);
	}
	.term {
		padding: 22px 24px;
		border-radius: 26px;
		background: var(--color-neutral-900);
		color: var(--td-ink-2);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13.5px;
		line-height: 2;
		overflow-x: auto;
	}
	.term-box .term {
		padding-top: 10px;
		border-radius: 0;
	}
	/* Long repository URLs scroll rather than wrap: a wrapped command is one
	   that gets pasted as two. */
	.term > div {
		white-space: pre;
	}
	.band.dark .term {
		margin-top: 16px;
		/* The dark band is already neutral-900; step the panel off it. */
		background: #2a2721;
	}
	.prompt {
		color: var(--color-neutral-600);
		user-select: none;
	}
	.comment {
		color: var(--color-neutral-500);
	}
	.term-ok {
		color: var(--color-accent-300);
		margin-top: 8px;
	}
	.term-dim {
		color: var(--color-neutral-500);
	}

	/* ── after installing ─────────────────────────────── */
	.paths {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 16px;
	}
	.path {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 13px 18px;
		border-radius: 18px;
		background: #2a2721;
	}
	/* Outranks `.band.dark code`, which would otherwise chip it. */
	.band.dark .path-k {
		color: var(--color-accent-300);
		background: none;
		padding: 0;
	}
	.path-v {
		font-size: 13.5px;
		color: var(--td-ink-2);
	}

	.fpr {
		margin-top: 14px;
		padding: 18px 22px;
		border-radius: 20px;
		background: var(--color-neutral-900);
		color: var(--color-accent-200);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 14px;
		word-spacing: 0.2em;
	}
</style>
