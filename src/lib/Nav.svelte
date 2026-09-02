<script>
	import { page } from '$app/state';
	import { toggleTheme } from '$lib/theme.js';

	const links = [
		{ href: '/features/', label: 'Features' },
		{ href: '/shelf/', label: 'The Shelf' },
		{ href: '/patch/', label: 'Patch' },
		{ href: '/plugins/', label: 'Plugins' },
		{ href: '/docs/', label: 'Docs' }
	];

	// /plugins/<slug> should still light up the Plugins link.
	const current = (href) => page.url.pathname === href || page.url.pathname.startsWith(href);
</script>

<nav>
	<a class="brand" href="/">
		<span class="mark">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3" /><circle cx="8" cy="12" r="2" /><circle cx="16" cy="12" r="2" /></svg>
		</span>
		<span class="wordmark">Tapedeck</span>
	</a>

	{#each links as l (l.href)}
		<a
			class="navlink"
			href={l.href}
			aria-current={current(l.href) ? 'page' : undefined}
			style:color={current(l.href) ? 'var(--color-accent-700)' : 'var(--color-text)'}>{l.label}</a
		>
	{/each}

	<button
		type="button"
		class="td-theme-btn"
		onclick={toggleTheme}
		title="Light, dark or match your system"
		aria-label="Switch theme"
	>
		<svg class="td-i-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
		<svg class="td-i-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" /></svg>
	</button>

	<a class="btn btn-primary demo" href="https://demo.tapedeck.cc">Live demo</a>
</nav>

<style>
	nav {
		position: sticky;
		top: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 14px 32px;
		background: color-mix(in srgb, var(--color-bg) 88%, transparent);
		backdrop-filter: blur(14px);
		border-bottom: 1px solid var(--color-divider);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--color-text);
		margin-right: auto;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 10px;
		background: var(--color-accent);
		color: var(--color-bg);
	}
	.wordmark {
		font-family: var(--font-heading);
		font-size: 19px;
	}
	.navlink {
		font-size: 14px;
		text-decoration: none;
	}
	.demo {
		text-decoration: none;
		flex: none;
		white-space: nowrap;
	}
	/* Narrow: wrap to a second row rather than hiding links behind a menu the
	   site is too small to need. The brand claims the first row on its own. */
	@media (max-width: 860px) {
		nav {
			flex-wrap: wrap;
			gap: 12px 18px;
			padding: 12px 18px;
		}
		.brand {
			margin-right: auto;
		}
		.navlink {
			font-size: 13px;
		}
	}
	@media (max-width: 560px) {
		.brand {
			flex: 1 0 100%;
			margin-right: 0;
		}
		.demo {
			margin-left: auto;
		}
	}
</style>
