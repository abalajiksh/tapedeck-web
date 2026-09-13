<script>
	import Operation from '$lib/api/Operation.svelte';
	import MethodBadge from '$lib/api/MethodBadge.svelte';

	let { data } = $props();

	/** Narrows the list on this page. Enhancement only: every operation is
	 *  rendered server-side and stays in the document when this is empty. */
	let q = $state('');

	const needle = $derived(q.trim().toLowerCase());
	const shown = $derived(
		needle
			? data.tag.operations.filter(
					(o) =>
						o.path.toLowerCase().includes(needle) ||
						o.summary.toLowerCase().includes(needle) ||
						o.method.toLowerCase() === needle
				)
			: data.tag.operations
	);
</script>

<svelte:head>
	<title>{data.tag.name} — Tapedeck API</title>
	<meta
		name="description"
		content="The {data.tag.name} endpoints of the Tapedeck API: {data.tag.operations
			.length} operations, with the auth each one requires."
	/>
</svelte:head>

<header class="page-head">
	<div class="wrap">
		<a class="back" href="/api/">← API reference</a>
		<h1>{data.tag.name}</h1>
		{#if data.tag.description}
			<div class="lede tagdesc">{@html data.tag.description}</div>
		{:else}
			<p class="lede">
				{data.tag.operations.length}
				{data.tag.operations.length === 1 ? 'endpoint' : 'endpoints'}. The spec declares no
				description for this area.
			</p>
		{/if}
	</div>
</header>

<section class="band surface">
	<div class="wrap">
		<nav class="areas" aria-label="API areas">
			{#each data.siblings as s (s.slug)}
				<a
					class="area"
					href="/api/{s.slug}/"
					aria-current={s.slug === data.tag.slug ? 'page' : undefined}>{s.name}</a
				>
			{/each}
		</nav>
	</div>
</section>

<section class="band">
	<div class="wrap">
		<div class="toolbar">
			<label class="sr-only" for="tag-filter">Filter these endpoints</label>
			<input
				id="tag-filter"
				type="search"
				bind:value={q}
				placeholder="Filter {data.tag.operations.length} endpoints"
				autocomplete="off"
			/>
			<span class="count">
				{shown.length} of {data.tag.operations.length} · v{data.version}
			</span>
		</div>

		<ul class="jump">
			{#each shown as o (o.anchor)}
				<li>
					<a href="#{o.anchor}">
						<MethodBadge method={o.method} />
						<code>{o.path}</code>
					</a>
				</li>
			{/each}
		</ul>

		{#if shown.length === 0}
			<p class="empty">Nothing here matches “{q.trim()}”.</p>
		{/if}

		{#each shown as o (o.anchor)}
			<Operation op={o} />
		{/each}
	</div>
</section>

<style>
	.back {
		font-size: 14px;
		color: var(--color-neutral-600);
		text-decoration: none;
	}
	.back:hover {
		color: var(--color-accent-700);
	}
	.page-head h1 {
		max-width: none;
	}
	.tagdesc :global(p) {
		margin: 10px 0;
	}
	.tagdesc :global(code) {
		font-size: 15px;
	}
	.areas {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.area {
		font-size: 13px;
		padding: 6px 11px;
		border-radius: 999px;
		border: 1px solid var(--color-divider);
		text-decoration: none;
		color: var(--color-neutral-700);
		background: var(--color-bg);
	}
	.area:hover {
		border-color: var(--color-accent-300);
	}
	.area[aria-current='page'] {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-bg);
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px;
		margin-bottom: 18px;
	}
	.toolbar input {
		flex: 1 1 320px;
		max-width: 460px;
		font: inherit;
		font-size: 15px;
		padding: 10px 14px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-divider);
		background: var(--color-bg);
		color: var(--color-text);
	}
	.toolbar input:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}
	.count {
		font-size: 13px;
		color: var(--color-neutral-600);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	/* A contents list, because these pages run long — Patch is 43 endpoints. */
	.jump {
		list-style: none;
		padding: 16px 18px;
		margin: 0 0 10px;
		border: 1px solid var(--color-divider);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
		gap: 2px 20px;
	}
	.jump a {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 4px 0;
		text-decoration: none;
		color: var(--color-neutral-700);
	}
	.jump a:hover {
		color: var(--color-accent-700);
	}
	.jump code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12.5px;
		overflow-wrap: anywhere;
	}
	.empty {
		font-size: 15px;
		color: var(--color-neutral-600);
		padding: 20px 0;
	}
</style>
