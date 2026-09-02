import { marked } from 'marked';

/**
 * The plugin registry.
 *
 * Adding a plugin means adding a folder under `/plugins/<slug>/` — a
 * `plugin.json` and, optionally, a `README.md`. Nothing else in the site is
 * edited: the listing, the category filter and the `/plugins/<slug>` route all
 * derive from what this glob finds. Both globs are resolved by Vite at build
 * time, so a malformed entry fails `bun run build` rather than a page load, and
 * `marked` never reaches the browser.
 */
const manifests = import.meta.glob('/plugins/*/plugin.json', { eager: true, import: 'default' });
const readmes = import.meta.glob('/plugins/*/README.md', { eager: true, query: '?raw', import: 'default' });

/** Display label and card tinting per status. Order here is the listing order. */
export const STATUS = {
	shipped: { label: 'Shipped', bg: 'var(--color-accent-2-200)', fg: 'var(--color-accent-2-800)' },
	dev: { label: 'In development', bg: 'var(--color-accent-200)', fg: 'var(--color-accent-800)' },
	untested: { label: 'Built, untested', bg: 'var(--color-neutral-200)', fg: 'var(--color-neutral-800)' },
	soon: { label: 'Coming soon', bg: 'var(--color-neutral-200)', fg: 'var(--color-neutral-700)' },
	planned: { label: 'Planned', bg: 'var(--color-neutral-200)', fg: 'var(--color-neutral-700)' }
};

const STATUS_RANK = Object.keys(STATUS);

/** Categories the filter shows first, in this order. Any other category a
 *  plugin declares is appended after these rather than dropped. */
const CATEGORY_ORDER = ['Players', 'Servers', 'Analysis', 'Apps'];

const REQUIRED = ['name', 'kind', 'category', 'status', 'summary'];

function slugOf(path) {
	return path.split('/').at(-2);
}

function validate(slug, m) {
	const missing = REQUIRED.filter((k) => !m[k]);
	if (missing.length) {
		throw new Error(`plugins/${slug}/plugin.json is missing: ${missing.join(', ')}`);
	}
	if (!STATUS[m.status]) {
		throw new Error(
			`plugins/${slug}/plugin.json has status "${m.status}"; expected one of ${STATUS_RANK.join(', ')}`
		);
	}
	if (m.link && !/^https?:\/\//.test(m.link)) {
		throw new Error(`plugins/${slug}/plugin.json: link must be an absolute http(s) URL`);
	}
}

function build() {
	const all = Object.entries(manifests).map(([path, m]) => {
		const slug = slugOf(path);
		validate(slug, m);
		const readme = readmes[`/plugins/${slug}/README.md`];
		return {
			slug,
			name: m.name,
			by: m.by ?? '',
			kind: m.kind,
			category: m.category,
			status: m.status,
			summary: m.summary,
			adds: m.adds ?? '',
			link: m.link ?? '',
			linkLabel: m.linkLabel || (m.link ? 'View on GitHub' : ''),
			order: typeof m.order === 'number' ? m.order : null,
			// A README is what earns a detail page. Without one there is nothing
			// to show beyond the card, so the card doesn't link inward.
			hasPage: Boolean(readme),
			body: readme ? marked.parse(readme) : ''
		};
	});

	all.sort((a, b) => {
		if (a.order !== null || b.order !== null) {
			return (a.order ?? Infinity) - (b.order ?? Infinity);
		}
		const rank = STATUS_RANK.indexOf(a.status) - STATUS_RANK.indexOf(b.status);
		return rank || a.name.localeCompare(b.name);
	});

	return all;
}

/** Every plugin, sorted. Card fields only — README HTML is stripped, so the
 *  listing payload doesn't carry the full prose of every plugin. */
export function listPlugins() {
	return build().map(({ body, ...card }) => card);
}

/** One plugin including its rendered README, or undefined. */
export function getPlugin(slug) {
	return build().find((p) => p.slug === slug);
}

/** Filter labels for the listing, derived from the data. */
export function listCategories() {
	const found = [...new Set(build().map((p) => p.category))];
	const known = CATEGORY_ORDER.filter((c) => found.includes(c));
	const extra = found.filter((c) => !CATEGORY_ORDER.includes(c)).sort();
	return ['All', ...known, ...extra];
}
