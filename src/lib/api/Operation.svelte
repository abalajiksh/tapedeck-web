<script>
	import MethodBadge from './MethodBadge.svelte';
	import AuthChips from './AuthChips.svelte';
	import SchemaTree from './SchemaTree.svelte';

	/** One endpoint, rendered whole. Everything is in the HTML — nothing here
	 *  waits on JavaScript to become readable. */
	let { op } = $props();

	/** 2xx reads as success, 4xx/5xx as a failure worth noticing. */
	const tone = (status) => (status.startsWith('2') ? 'ok' : status === 'default' ? 'any' : 'err');
</script>

<article class="op" id={op.anchor}>
	<header>
		<div class="sig">
			<MethodBadge method={op.method} />
			<code class="path">{op.path}</code>
			<a class="anchor" href="#{op.anchor}" aria-label="Link to {op.method} {op.path}">#</a>
		</div>
		<div class="meta">
			<AuthChips auth={op.auth} />
		</div>
	</header>

	<h3 class:deprecated={op.deprecated}>
		{op.summary}
		{#if op.deprecated}<span class="dep-tag">deprecated</span>{/if}
	</h3>

	{#if op.description}
		<div class="prose">{@html op.description}</div>
	{/if}

	{#if op.parameters.length}
		<section>
			<h4>Parameters</h4>
			{#each op.parameters as p (p.in + p.name)}
				<div class="param">
					<div class="param-head">
						<code class="key">{p.name}</code>
						<span class="in">{p.in}</span>
						{#if p.required}<span class="req">required</span>{/if}
					</div>
					{#if p.description}<div class="desc">{@html p.description}</div>{/if}
					{#if p.schema}<SchemaTree node={p.schema} />{/if}
				</div>
			{/each}
		</section>
	{/if}

	{#if op.requestBody}
		<section>
			<h4>Request body {#if op.requestBody.required}<span class="req">required</span>{/if}</h4>
			{#if op.requestBody.description}
				<div class="prose">{@html op.requestBody.description}</div>
			{/if}
			{#each op.requestBody.content as c (c.mediaType)}
				<p class="media">{c.mediaType}</p>
				{#if c.schema}<SchemaTree node={c.schema} />{/if}
				{#if c.example}<pre class="example scroll-x"><code>{c.example}</code></pre>{/if}
			{/each}
		</section>
	{/if}

	{#if op.responses.length}
		<section>
			<h4>Responses</h4>
			{#each op.responses as r (r.status)}
				<div class="response">
					<div class="status-row">
						<span class="status {tone(r.status)}">{r.status}</span>
						{#if r.description}<div class="desc inline">{@html r.description}</div>{/if}
					</div>
					{#each r.content as c (c.mediaType)}
						<p class="media">{c.mediaType}</p>
						{#if c.schema}<SchemaTree node={c.schema} />{/if}
						{#if c.example}<pre class="example scroll-x"><code>{c.example}</code></pre>{/if}
					{/each}
				</div>
			{/each}
		</section>
	{/if}
</article>

<style>
	.op {
		padding: 28px 0;
		border-top: 1px solid var(--color-divider);
		/* Anchored jumps otherwise land under the sticky nav. */
		scroll-margin-top: 90px;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px 16px;
	}
	.sig {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}
	.path {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 15px;
		color: var(--color-text);
		overflow-wrap: anywhere;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}
	/* Visible on hover or keyboard focus — a permalink that never appears is
	   not a permalink. */
	.anchor {
		opacity: 0;
		text-decoration: none;
		color: var(--color-neutral-500);
		font-size: 14px;
		transition: opacity 0.12s;
	}
	.op:hover .anchor,
	.anchor:focus-visible {
		opacity: 1;
	}
	h3 {
		font-family: var(--font-body);
		font-size: 17px;
		font-weight: 600;
		margin: 12px 0 0;
		max-width: 70ch;
	}
	h3.deprecated {
		color: var(--color-neutral-600);
	}
	.dep-tag {
		font-size: 11px;
		font-weight: 500;
		color: var(--color-accent-700);
		margin-left: 6px;
	}
	h4 {
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
		margin: 0 0 8px;
	}
	section {
		margin-top: 22px;
	}
	.prose {
		font-size: 15px;
		color: var(--color-neutral-700);
		max-width: 72ch;
	}
	.prose :global(p) {
		margin: 10px 0;
	}
	.prose :global(table) {
		border-collapse: collapse;
		font-size: 14px;
		margin: 12px 0;
	}
	.prose :global(th),
	.prose :global(td) {
		border: 1px solid var(--color-divider);
		padding: 6px 10px;
		text-align: left;
	}
	.prose :global(code) {
		font-size: 13px;
	}
	.param,
	.response {
		padding: 10px 0;
	}
	.param + .param,
	.response + .response {
		border-top: 1px dashed var(--color-divider);
	}
	.param-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
	}
	.key {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13px;
	}
	.in {
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-neutral-500);
	}
	.req {
		font-size: 11px;
		color: var(--color-accent-700);
	}
	.status-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 10px;
	}
	.status {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12px;
		font-weight: 700;
		padding: 3px 7px;
		border-radius: var(--radius-sm);
		flex: none;
	}
	.status.ok {
		background: var(--color-accent-2-200);
		color: var(--color-accent-2-800);
	}
	.status.err {
		background: var(--color-neutral-200);
		color: var(--color-neutral-800);
	}
	.status.any {
		background: transparent;
		border: 1px solid var(--color-divider);
		color: var(--color-neutral-600);
	}
	.desc {
		font-size: 14px;
		color: var(--color-neutral-700);
		max-width: 70ch;
	}
	.desc :global(p) {
		margin: 2px 0 6px;
	}
	.desc.inline :global(p:first-child) {
		margin-top: 0;
	}
	.media {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11.5px;
		color: var(--color-neutral-500);
		margin: 10px 0 4px;
	}
	.example {
		background: var(--color-neutral-100);
		border: 1px solid var(--color-divider);
		border-radius: var(--radius-md);
		padding: 12px 14px;
		margin: 8px 0 0;
		font-size: 12.5px;
		line-height: 1.5;
	}
	.example code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		white-space: pre;
	}
</style>
