<script>
	import MethodBadge from '$lib/api/MethodBadge.svelte';

	let { data } = $props();

	/** Filters the full operation list. Progressive enhancement only — every
	 *  tag and every endpoint is in the HTML before this runs. */
	let q = $state('');

	const needle = $derived(q.trim().toLowerCase());
	const matches = $derived(
		needle
			? data.operations.filter(
					(o) =>
						o.path.toLowerCase().includes(needle) ||
						o.summary.toLowerCase().includes(needle) ||
						o.method.toLowerCase() === needle
				)
			: []
	);
</script>

<svelte:head>
	<title>API reference — Tapedeck</title>
	<meta
		name="description"
		content="Every endpoint a Tapedeck deck serves: {data.info.operationCount} operations across {data
			.info.pathCount} paths, with the auth each one requires."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<span class="eyebrow">API reference</span>
		<h1>Everything a deck will answer.</h1>
		<p class="lede">
			{data.info.operationCount} operations across {data.info.pathCount} paths. The deck is the server,
			so anything the web UI does, a client of yours can do too.
		</p>
		<p class="version">
			Describes <strong>v{data.info.version}</strong>. Your own deck is the authority on what
			<em>it</em>
			runs — ask it for <code>GET /api/openapi.yaml</code> and you get this document as that binary
			actually serves it.
		</p>
	</div>
</header>

<section class="band surface">
	<div class="wrap">
		<div class="intro">{@html data.info.description}</div>
	</div>
</section>

<section class="band">
	<div class="wrap">
		<h2 class="h2">Credentials</h2>
		<p class="para wide">
			Three mechanisms, and they are not interchangeable. Each endpoint below says which it takes.
		</p>
		<div class="schemes">
			{#each data.info.schemes as s (s.key)}
				<article class="scheme">
					<h3 class="h3">{s.label}</h3>
					<code class="detail">{s.detail}</code>
					<div class="prose">{@html s.description}</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<section class="band surface">
	<div class="wrap">
		<h2 class="h2">By area</h2>

		<div class="search">
			<label class="sr-only" for="api-filter">Search endpoints</label>
			<input
				id="api-filter"
				type="search"
				bind:value={q}
				placeholder="Filter endpoints — try “listens”, “chain” or “post”"
				autocomplete="off"
			/>
		</div>

		{#if needle}
			<p class="count">
				{matches.length}
				{matches.length === 1 ? 'endpoint' : 'endpoints'} matching “{q.trim()}”
			</p>
			<ul class="results">
				{#each matches.slice(0, 60) as o (o.anchor)}
					<li>
						<a href="/api/{o.tagSlug}/#{o.anchor}">
							<MethodBadge method={o.method} />
							<code>{o.path}</code>
							<span class="sum">{o.summary}</span>
						</a>
					</li>
				{/each}
			</ul>
			{#if matches.length > 60}
				<p class="count">Showing the first 60. Narrow the filter to see the rest.</p>
			{/if}
		{:else}
			<div class="grid-320">
				{#each data.tags as t (t.slug)}
					<a class="tcard" href="/api/{t.slug}/">
						<div class="tcard-head">
							<h3 class="h3">{t.name}</h3>
							<span class="pill">{t.count}</span>
						</div>
						{#if t.description}
							<div class="tdesc">{@html t.description}</div>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.version {
		font-size: 15px;
		color: var(--color-neutral-700);
		max-width: 62ch;
		margin-top: 14px;
	}
	.intro {
		max-width: 76ch;
		font-size: 16px;
		color: var(--color-neutral-700);
	}
	.intro :global(h2) {
		font-family: var(--font-heading);
		font-weight: var(--font-heading-weight);
		font-size: 28px;
		letter-spacing: -0.02em;
		color: var(--color-text);
		margin: 32px 0 10px;
	}
	.intro :global(h3) {
		font-size: 18px;
		color: var(--color-text);
		margin: 22px 0 8px;
	}
	.intro :global(table) {
		border-collapse: collapse;
		font-size: 14.5px;
		margin: 14px 0;
		width: 100%;
	}
	.intro :global(th),
	.intro :global(td) {
		border: 1px solid var(--color-divider);
		padding: 8px 12px;
		text-align: left;
		vertical-align: top;
	}
	.intro :global(code) {
		font-size: 13.5px;
	}
	.schemes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-top: 28px;
	}
	.scheme {
		padding: 22px;
		border: 1px solid var(--color-divider);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
	}
	.detail {
		display: inline-block;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12px;
		color: var(--color-neutral-600);
		margin: 6px 0 10px;
	}
	.prose {
		font-size: 14.5px;
		color: var(--color-neutral-700);
	}
	.prose :global(p) {
		margin: 8px 0;
	}
	.prose :global(code) {
		font-size: 13px;
	}
	.search {
		margin: 26px 0 18px;
	}
	.search input {
		width: 100%;
		max-width: 520px;
		font: inherit;
		font-size: 15px;
		padding: 11px 14px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-divider);
		background: var(--color-bg);
		color: var(--color-text);
	}
	.search input:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	.count {
		font-size: 14px;
		color: var(--color-neutral-600);
		margin: 0 0 12px;
	}
	.results {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.results li + li {
		border-top: 1px solid var(--color-divider);
	}
	.results a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 4px;
		text-decoration: none;
		color: var(--color-text);
	}
	.results a:hover {
		background: var(--color-neutral-100);
	}
	.results code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13.5px;
		overflow-wrap: anywhere;
	}
	.results .sum {
		font-size: 14px;
		color: var(--color-neutral-600);
		margin-left: auto;
		text-align: right;
		max-width: 46ch;
	}
	.tcard {
		display: block;
		padding: 22px;
		border: 1px solid var(--color-divider);
		border-radius: var(--radius-lg);
		background: var(--color-bg);
		text-decoration: none;
		color: var(--color-text);
		transition:
			border-color 0.14s,
			transform 0.14s;
	}
	.tcard:hover {
		border-color: var(--color-accent-300);
		transform: translateY(-2px);
	}
	.tcard-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.tcard-head .h3 {
		margin: 0;
	}
	/* Tag descriptions are full prose in the spec; the card shows the opening
	   and the page itself carries the rest. */
	.tdesc {
		font-size: 14px;
		color: var(--color-neutral-600);
		margin-top: 8px;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.tdesc :global(p) {
		margin: 0;
	}
	@media (max-width: 700px) {
		.results a {
			flex-wrap: wrap;
			gap: 8px;
		}
		.results .sum {
			margin-left: 0;
			text-align: left;
			flex: 1 0 100%;
		}
	}
</style>
