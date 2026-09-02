const KEY = 'tapedeck-site-theme';
const NEXT = { system: 'dark', dark: 'light', light: 'system' };

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

/** Cycle system → dark → light → system. */
export function toggleTheme() {
	const next = NEXT[read()] || 'dark';
	try {
		localStorage.setItem(KEY, next);
	} catch (e) {
		/* private mode — the choice just doesn't persist */
	}
	apply(next);
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
