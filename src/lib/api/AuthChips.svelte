<script>
	/**
	 * What a caller must present.
	 *
	 * `auth` is a list of alternatives — any one is enough — and each
	 * alternative is a list of schemes that must all be satisfied. An empty
	 * list means the endpoint is open, which is a fact worth stating rather
	 * than leaving to the absence of a chip.
	 */
	let { auth } = $props();
</script>

{#if auth.length === 0}
	<span class="chip open">Public</span>
{:else}
	{#each auth as alternative, i (i)}
		{#if i > 0}<span class="or">or</span>{/if}
		{#each alternative as scheme, j (scheme.scheme)}
			{#if j > 0}<span class="and">+</span>{/if}
			<span class="chip">
				{scheme.label}
				{#each scheme.scopes as scope (scope)}
					<code class="scope">{scope}</code>
				{/each}
			</span>
		{/each}
	{/each}
{/if}

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		line-height: 1;
		padding: 5px 9px;
		border-radius: 999px;
		border: 1px solid var(--color-divider);
		background: var(--color-bg);
		color: var(--color-neutral-700);
		white-space: nowrap;
	}
	/* Open endpoints are the exception in this API, so they get the accent
	   rather than blending into the neutral chips around them. */
	.open {
		border-color: var(--color-accent-2-300);
		background: var(--color-accent-2-100);
		color: var(--color-accent-2-800);
	}
	.scope {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11px;
		padding: 2px 5px;
		border-radius: var(--radius-sm);
		background: var(--color-neutral-200);
		color: var(--color-neutral-800);
	}
	.or,
	.and {
		font-size: 11px;
		color: var(--color-neutral-500);
		margin: 0 2px;
	}
</style>
