<footer>
	<div class="inner">
		<span class="brand">tapedeck.cc</span>
		<a href="/">Home</a>
		<a href="/features/">Features</a>
		<a href="/shelf/">The Shelf</a>
		<a href="/patch/">Patch</a>
		<a href="/plugins/">Plugins</a>
		<a href="/docs/">Docs</a>
		<a href="https://demo.tapedeck.cc">Demo</a>
		<span class="credit"
			>Built on MusicBrainz, ListenBrainz, Every Noise at Once, LRCLIB and Discogs.</span
		>
	</div>
</footer>

<style>
	footer {
		padding: 52px 32px;
		background: var(--color-neutral-900);
		border-top: 1px solid #3a352c;
		color: var(--color-neutral-400);
	}
	.inner {
		max-width: 1180px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		gap: 26px;
		align-items: center;
	}
	.brand {
		font-family: var(--font-heading);
		font-size: 17px;
		color: var(--td-ink-2);
	}
	a {
		font-size: 13px;
		color: var(--color-neutral-400);
		text-decoration: none;
	}
	a:hover {
		color: var(--td-ink-2);
	}
	.credit {
		margin-left: auto;
		font-size: 12px;
		color: var(--color-neutral-600);
	}
	@media (max-width: 860px) {
		.credit {
			margin-left: 0;
			flex: 1 0 100%;
		}
	}
</style>
