<script>
	let { data } = $props();
	const p = $derived(data.plugin);
</script>

<svelte:head>
	<title>{p.name} — Tapedeck plugins</title>
	<meta name="description" content={p.summary} />
</svelte:head>

<article class="wrap">
	<a class="back" href="/plugins/">← All plugins</a>

	<div class="meta">
		<span class="tag" style:background={data.status.bg} style:color={data.status.fg}
			>{data.status.label}</span
		>
		<span class="kind">{p.kind}</span>
	</div>

	<h1>{p.name}</h1>
	{#if p.by}<div class="by">{p.by}</div>{/if}
	<p class="summary">{p.summary}</p>

	{#if p.adds}
		<div class="adds"><strong>What it adds:</strong> {p.adds}</div>
	{/if}

	{#if p.link}
		<a class="btn btn-primary out" href={p.link} rel="noopener">{p.linkLabel}</a>
	{/if}

	<!-- Rendered from plugins/<slug>/README.md at build time. -->
	<div class="prose">{@html p.body}</div>
</article>

<style>
	.wrap {
		max-width: 760px;
		margin: 0 auto;
		padding: 56px 32px 90px;
	}
	.back {
		font-size: 14px;
		text-decoration: none;
	}
	.back:hover {
		text-decoration: underline;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 28px;
	}
	.kind {
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-neutral-600);
	}
	h1 {
		font-size: clamp(32px, 4.4vw, 48px);
		letter-spacing: -0.025em;
		line-height: 1.08;
		margin: 16px 0 0;
	}
	.by {
		font-size: 14px;
		color: var(--color-neutral-600);
		margin-top: 6px;
	}
	.summary {
		font-size: 18px;
		color: var(--color-neutral-700);
		margin-top: 18px;
		text-wrap: pretty;
	}
	.adds {
		font-size: 14px;
		color: var(--color-neutral-700);
		margin-top: 20px;
		padding: 16px 20px;
		border-radius: 20px;
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
	}
	.out {
		display: inline-block;
		margin-top: 20px;
		text-decoration: none;
	}
	.prose {
		margin-top: 40px;
		padding-top: 32px;
		border-top: 1px solid var(--color-divider);
		font-size: 16.5px;
		line-height: 1.65;
		color: var(--color-neutral-800);
	}
	/* The README is rendered to HTML, so its elements can't be reached by
	   Svelte's scoped selectors — :global is required here. */
	.prose :global(h2) {
		font-size: 26px;
		letter-spacing: -0.015em;
		margin: 36px 0 12px;
	}
	.prose :global(h3) {
		font-size: 20px;
		margin: 28px 0 10px;
	}
	.prose :global(p) {
		text-wrap: pretty;
	}
	.prose :global(ul),
	.prose :global(ol) {
		padding-left: 22px;
	}
	.prose :global(li) {
		margin: 6px 0;
	}
	.prose :global(code) {
		font-size: 0.9em;
		padding: 2px 6px;
		border-radius: 6px;
		background: var(--color-neutral-200);
	}
	.prose :global(pre) {
		padding: 18px 20px;
		border-radius: 18px;
		background: var(--color-neutral-900);
		color: var(--td-ink-2);
		overflow-x: auto;
	}
	.prose :global(pre code) {
		background: none;
		padding: 0;
		color: inherit;
	}
	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		font-size: 15px;
	}
	.prose :global(th),
	.prose :global(td) {
		text-align: left;
		padding: 10px 14px;
		border-bottom: 1px solid var(--color-divider);
		vertical-align: top;
	}
	.prose :global(th) {
		font-weight: 700;
	}
	.prose :global(blockquote) {
		margin: 20px 0;
		padding-left: 18px;
		border-left: 3px solid var(--color-accent-300);
		color: var(--color-neutral-700);
	}
	@media (max-width: 640px) {
		.wrap {
			padding: 36px 20px 64px;
		}
	}
</style>
