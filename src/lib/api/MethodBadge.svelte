<script>
	/**
	 * The HTTP method, as a badge.
	 *
	 * Deliberately not the green/blue/red palette every API explorer uses —
	 * those colours belong to no design system in particular and would be the
	 * only place on the site not drawn from app.css. The two accent ramps carry
	 * the distinction that actually matters to a reader skimming a long page:
	 * whether the call *changes* anything.
	 */
	let { method } = $props();

	const READ_ONLY = ['GET', 'HEAD', 'OPTIONS'];
	const DESTRUCTIVE = ['DELETE'];

	const tone = $derived(
		READ_ONLY.includes(method) ? 'read' : DESTRUCTIVE.includes(method) ? 'destructive' : 'write'
	);
</script>

<span class="badge {tone}">{method}</span>

<style>
	.badge {
		display: inline-block;
		flex: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1;
		padding: 5px 7px;
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
	}
	.read {
		background: var(--color-accent-2-200);
		color: var(--color-accent-2-800);
	}
	.write {
		background: var(--color-accent-200);
		color: var(--color-accent-800);
	}
	/* Outlined rather than filled: DELETE should read as a warning without
	   shouting louder than the endpoint name beside it. */
	.destructive {
		background: transparent;
		border-color: var(--color-accent-400);
		color: var(--color-accent-800);
	}
</style>
