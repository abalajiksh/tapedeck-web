<script>
	/**
	 * One schema, as a nested list.
	 *
	 * The tree is built on the server (`openapi.server.js`), so this walks a
	 * plain structure and decides nothing. It imports itself to recurse —
	 * `<svelte:self>` is on its way out in runes mode.
	 */
	import Self from './SchemaTree.svelte';

	let { node, depth = 0 } = $props();

	/** `string · date-time`, `array`, or nothing at all for a bare object. */
	const typeLabel = $derived(
		[node.type, node.format].filter(Boolean).join(' · ') || (node.children.length ? 'object' : '')
	);
</script>

<div class="row" class:nested={depth > 0}>
	<div class="head">
		{#if node.key}<code class="key">{node.key}</code>{/if}
		{#if typeLabel}<span class="type">{typeLabel}</span>{/if}
		{#if node.required}<span class="req">required</span>{/if}
		{#if node.deprecated}<span class="dep">deprecated</span>{/if}
	</div>

	{#if node.description}
		<div class="desc">{@html node.description}</div>
	{/if}

	{#if node.enumValues}
		<div class="enums">
			{#each node.enumValues as value (value)}
				<code class="enum">{value}</code>
			{/each}
		</div>
	{/if}

	{#if node.loose}
		<p class="note">
			Further properties are not mapped here — the spec marks this one loose rather than claiming a
			shape it hasn't verified.
		</p>
	{/if}

	{#if node.truncated}
		<p class="note">Deeper structure omitted. The spec is the full reference.</p>
	{/if}

	{#if node.variants.length}
		<div class="variants">
			<span class="variant-kind">{node.variantKind}</span>
			{#each node.variants as variant, i (i)}
				<Self node={variant} depth={depth + 1} />
			{/each}
		</div>
	{/if}

	{#if node.items}
		<div class="items">
			<span class="variant-kind">each item</span>
			<Self node={node.items} depth={depth + 1} />
		</div>
	{/if}

	{#each node.children as child (child.key)}
		<Self node={child} depth={depth + 1} />
	{/each}
</div>

<style>
	/* Indent with a rule rather than padding alone — at four levels deep the
	   line is the only thing that keeps a property attached to its parent. */
	.row.nested {
		margin-left: 10px;
		padding-left: 14px;
		border-left: 1px solid var(--color-divider);
	}
	.row.nested + .row.nested {
		margin-top: 2px;
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
		padding: 3px 0;
	}
	.key {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13px;
		color: var(--color-text);
	}
	.type {
		font-size: 12px;
		color: var(--color-neutral-600);
	}
	.req {
		font-size: 11px;
		color: var(--color-accent-700);
	}
	.dep {
		font-size: 11px;
		color: var(--color-neutral-500);
		text-decoration: line-through;
	}
	.desc {
		font-size: 14px;
		color: var(--color-neutral-700);
		max-width: 70ch;
	}
	.desc :global(p) {
		margin: 2px 0 6px;
	}
	.desc :global(code) {
		font-size: 12.5px;
	}
	.enums {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin: 2px 0 6px;
	}
	.enum {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11.5px;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		background: var(--color-neutral-200);
		color: var(--color-neutral-800);
	}
	.note {
		font-size: 13px;
		color: var(--color-neutral-600);
		margin: 2px 0 6px;
		max-width: 62ch;
	}
	.variant-kind {
		display: inline-block;
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
		margin: 4px 0 2px;
	}
</style>
