<script>
	import '../fonts.css';
	import '../app.css';
	import '../site.css';
	import '../pages.css';
	import { onMount } from 'svelte';
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import { watchSystemTheme } from '$lib/theme.js';

	let { children } = $props();

	onMount(watchSystemTheme);
</script>

<div class="page">
	<Nav />
	<main>{@render children()}</main>
	<Footer />
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	main {
		flex: 1;
	}
</style>
