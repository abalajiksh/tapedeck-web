const KEY = 'tapedeck-site-theme';

function read() {
	try {
		return localStorage.getItem(KEY) || 'system';
	} catch (e) {
		return 'system';
	}
}

function sysDark() {
	try {
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	} catch (e) {
		return false;
	}
}

function apply(pref) {
	const root = document.documentElement;
	root.setAttribute('data-theme', pref === 'system' ? (sysDark() ? 'dark' : 'light') : pref);
	root.setAttribute('data-theme-pref', pref);
}

/**
 * Flip between light and dark. Every press changes what is on screen.
 *
 * This used to cycle system → dark → light, which meant a press that changed
 * nothing at each end: on a dark OS the first press stored "dark" over a page
 * already rendering dark, and on a light OS getting from light back to dark
 * took two. A control that appears not to work is worse than one with fewer
 * states.
 *
 * "Match your system" is not lost, it is inferred — landing on the theme the OS
 * already prefers stores `system` rather than pinning the same value, so the
 * page goes back to following the OS on its own. That is what the reader means
 * by choosing it, and it costs no third press to reach.
 */
export function toggleTheme() {
	const showing = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
	const wanted = showing === 'dark' ? 'light' : 'dark';
	const next = wanted === (sysDark() ? 'dark' : 'light') ? 'system' : wanted;
	try {
		localStorage.setItem(KEY, next);
	} catch (e) {
		/* private mode — the choice just doesn't persist */
	}
	apply(next);
	return next;
}

/** The stored preference: 'system', 'dark' or 'light'. */
export function themePref() {
	return read();
}

/** Follow the OS while the preference is "system". Returns an unsubscribe fn. */
export function watchSystemTheme() {
	try {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = () => read() === 'system' && apply('system');
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	} catch (e) {
		return () => {};
	}
}
