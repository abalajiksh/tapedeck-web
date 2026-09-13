import { marked } from 'marked';
import { parse } from 'yaml';

/**
 * The API reference.
 *
 * Reads the vendored `spec/openapi.yaml` — a copy of the document at the root
 * of the application repo, written by the `tapedeck-spec-sync` Jenkins job on
 * every release tag. See `spec/README.md` for why it is a copy rather than a
 * build-time fetch.
 *
 * A `.server.js` deliberately, like `plugins.server.js`: it keeps `yaml`, and
 * 465KB of spec text, out of the client bundle. Both API routes use
 * `+page.server.js`.
 *
 * Everything here runs at build time, so a malformed spec fails `bun run build`
 * with the offending path named rather than rendering a broken page. The one
 * softening is undeclared tags — see `groupByTag`.
 */

const sources = import.meta.glob('/spec/openapi.yaml', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const RAW = sources['/spec/openapi.yaml'];

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/** Chip labels for the security schemes this spec declares. An unknown scheme
 *  falls back to a humanised key rather than rendering blank. */
const SCHEME_LABELS = {
	sessionCookie: 'Session',
	apiToken: 'Token',
	metricsBearer: 'Metrics bearer',
	mcpBearer: 'MCP bearer'
};

/** How deep a schema is rendered before it is summarised. Nothing in this spec
 *  comes close; the cap exists so a future deeply-nested body degrades into a
 *  note rather than a page nobody can read. */
const MAX_DEPTH = 8;

function slugify(s) {
	return String(s)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function humanise(key) {
	const s = String(key).replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Markdown → HTML. Descriptions throughout the spec are block Markdown, and
 *  `info.description` leans on GFM tables, which marked handles by default. */
function md(text) {
	return text ? marked.parse(String(text)) : '';
}

/** Resolve a JSON pointer like `#/components/schemas/Listen`. */
function pointer(doc, ref) {
	return ref
		.slice(2)
		.split('/')
		.reduce((o, part) => o?.[part.replace(/~1/g, '/').replace(/~0/g, '~')], doc);
}

/**
 * Replace every `$ref` with what it points at.
 *
 * All 36 refs in this document are internal. An external one, an unresolvable
 * one, or a cycle throws — naming the chain, because "maximum call stack
 * exceeded" during a Cloudflare build tells you nothing. OpenAPI 3.1 allows
 * keys beside a `$ref`; those win over the target, which is what the spec
 * means when it overrides a shared response's description.
 */
function deref(node, doc, stack = []) {
	if (Array.isArray(node)) return node.map((n) => deref(n, doc, stack));
	if (!node || typeof node !== 'object') return node;

	if (typeof node.$ref === 'string') {
		const ref = node.$ref;
		if (!ref.startsWith('#/')) {
			throw new Error(`spec/openapi.yaml: external $ref "${ref}" is not supported`);
		}
		if (stack.includes(ref)) {
			throw new Error(`spec/openapi.yaml: $ref cycle — ${[...stack, ref].join(' → ')}`);
		}
		const target = pointer(doc, ref);
		if (target === undefined) {
			throw new Error(`spec/openapi.yaml: unresolvable $ref "${ref}"`);
		}
		const { $ref, ...siblings } = node;
		return { ...deref(target, doc, [...stack, ref]), ...deref(siblings, doc, stack) };
	}

	const out = {};
	for (const [k, v] of Object.entries(node)) out[k] = deref(v, doc, stack);
	return out;
}

/**
 * What a caller must present, as a list of alternatives (any one suffices);
 * each alternative is a list of schemes that must *all* be satisfied.
 *
 * The inheritance rule is the part worth being careful about, because this page
 * is only worth publishing if it is right about auth: an operation's own
 * `security` **replaces** the document default, it does not merge with it. So
 * `security: []` means public — and `??` rather than `||` is load-bearing,
 * since an empty array is exactly the case that must not fall through to the
 * default.
 */
function authFor(op, doc) {
	const required = op.security ?? doc.security ?? [];
	return required.map((alternative) =>
		Object.entries(alternative).map(([scheme, scopes]) => ({
			scheme,
			label: SCHEME_LABELS[scheme] ?? humanise(scheme),
			scopes: scopes ?? []
		}))
	);
}

/** A schema as a tree the renderer can walk without re-deriving anything. */
function schemaTree(schema, { key = null, required = false, depth = 0 } = {}) {
	if (!schema || typeof schema !== 'object') {
		return { key, required, type: 'any', children: [], variants: [] };
	}

	const node = {
		key,
		required,
		type: Array.isArray(schema.type) ? schema.type.join(' | ') : (schema.type ?? null),
		format: schema.format ?? null,
		description: md(schema.description),
		enumValues: schema.enum ?? null,
		deprecated: Boolean(schema.deprecated),
		// The spec uses this deliberately to mean "not fully mapped" rather than
		// "anything goes" — the tier-2 note in its header explains why.
		loose: schema.additionalProperties === true,
		example: schema.example !== undefined ? schema.example : null,
		children: [],
		items: null,
		variants: []
	};

	if (depth >= MAX_DEPTH) {
		node.truncated = true;
		return node;
	}

	const variants = schema.oneOf ?? schema.anyOf ?? null;
	if (variants) {
		node.variantKind = schema.oneOf ? 'one of' : 'any of';
		node.variants = variants.map((v, i) =>
			schemaTree(v, { key: v.title ?? `option ${i + 1}`, depth: depth + 1 })
		);
	}

	if (schema.properties) {
		node.type ??= 'object';
		const req = new Set(schema.required ?? []);
		node.children = Object.entries(schema.properties).map(([name, sub]) =>
			schemaTree(sub, { key: name, required: req.has(name), depth: depth + 1 })
		);
	}

	if (schema.items) {
		node.type ??= 'array';
		node.items = schemaTree(schema.items, { depth: depth + 1 });
	}

	return node;
}

/** `content:` maps, flattened to a list the renderer can loop over. */
function contentList(content) {
	if (!content) return [];
	return Object.entries(content).map(([mediaType, entry]) => ({
		mediaType,
		schema: entry?.schema ? schemaTree(entry.schema) : null,
		example:
			entry?.example !== undefined
				? JSON.stringify(entry.example, null, 2)
				: entry?.schema?.example !== undefined
					? JSON.stringify(entry.schema.example, null, 2)
					: null
	}));
}

let cached;

function build() {
	if (cached) return cached;

	const doc = parse(RAW);
	if (!doc?.paths || !doc?.info) {
		throw new Error('spec/openapi.yaml: no `paths` or no `info` — is the file truncated?');
	}

	const paths = deref(doc.paths, doc);
	const operations = [];

	for (const [path, item] of Object.entries(paths)) {
		// Parameters declared once for the whole path apply to every operation
		// under it, and are overridden by a same-name/same-place one below.
		const shared = item.parameters ?? [];

		for (const method of METHODS) {
			const op = item[method];
			if (!op) continue;

			if (!op.summary) {
				throw new Error(`spec/openapi.yaml: ${method.toUpperCase()} ${path} has no summary`);
			}

			const params = [...shared, ...(op.parameters ?? [])];
			const seen = new Map();
			for (const p of params) seen.set(`${p.in}:${p.name}`, p);

			operations.push({
				method: method.toUpperCase(),
				path,
				anchor: slugify(`${method} ${path}`),
				tag: op.tags?.[0] ?? 'Other',
				summary: op.summary,
				description: md(op.description),
				deprecated: Boolean(op.deprecated),
				auth: authFor(op, doc),
				parameters: [...seen.values()].map((p) => ({
					name: p.name,
					in: p.in,
					required: Boolean(p.required),
					description: md(p.description),
					schema: p.schema ? schemaTree(p.schema) : null
				})),
				requestBody: op.requestBody
					? {
							required: Boolean(op.requestBody.required),
							description: md(op.requestBody.description),
							content: contentList(op.requestBody.content)
						}
					: null,
				responses: Object.entries(op.responses ?? {}).map(([status, r]) => ({
					status,
					description: md(r?.description),
					content: contentList(r?.content)
				}))
			});
		}
	}

	cached = { doc, operations, tags: groupByTag(doc, operations) };
	return cached;
}

/**
 * Operations grouped into the spec's own `tags:` order.
 *
 * A tag an operation names but the document never declares is appended after
 * the declared ones with no description, and warned about. This is softer than
 * the plugin registry's validator on purpose: a contributor editing
 * `plugin.json` sees the build fail, but this file arrives from a sync job in
 * another repo, and dropping the operations — or refusing to build the site —
 * would both be worse than a page with one unexplained heading.
 *
 * As of v0.115.1 this catches `Profile`, used by `/api/v1/profile/spool-chain`.
 */
function groupByTag(doc, operations) {
	const declared = (doc.tags ?? []).map((t) => ({
		name: t.name,
		slug: slugify(t.name),
		description: md(t.description),
		operations: []
	}));

	const byName = new Map(declared.map((t) => [t.name, t]));
	const extra = [];

	for (const op of operations) {
		let tag = byName.get(op.tag);
		if (!tag) {
			tag = { name: op.tag, slug: slugify(op.tag), description: '', operations: [] };
			byName.set(op.tag, tag);
			extra.push(tag);
		}
		tag.operations.push(op);
	}

	if (extra.length) {
		console.warn(
			`[openapi] tag(s) used but not declared in the spec's \`tags:\` list, ` +
				`so they have no description: ${extra.map((t) => t.name).join(', ')}`
		);
	}

	// A declared tag with no operations is dropped rather than rendered empty.
	return [...declared.filter((t) => t.operations.length), ...extra];
}

/** Title, version and the document-level prose, for the index page. */
export function specInfo() {
	const { doc, operations } = build();
	return {
		title: doc.info.title,
		version: doc.info.version,
		summary: doc.info.summary ?? '',
		description: md(doc.info.description),
		operationCount: operations.length,
		pathCount: Object.keys(doc.paths).length,
		schemes: Object.entries(doc.components?.securitySchemes ?? {}).map(([key, s]) => ({
			key,
			label: SCHEME_LABELS[key] ?? humanise(key),
			type: s.type,
			detail:
				s.type === 'apiKey' ? `${s.in} · ${s.name}` : s.scheme ? `http · ${s.scheme}` : s.type,
			description: md(s.description)
		}))
	};
}

/** Tag cards for the index. No operation bodies — just enough to list and
 *  count, so the index payload doesn't carry all 279 in full. */
export function listTags() {
	return build().tags.map((t) => ({
		name: t.name,
		slug: t.slug,
		description: t.description,
		count: t.operations.length
	}));
}

/** Every operation, method/path/summary only — what the index filter needs. */
export function listOperations() {
	return build().operations.map(({ method, path, anchor, summary, tag }) => ({
		method,
		path,
		anchor,
		summary,
		tagSlug: slugify(tag)
	}));
}

/** One tag with its operations in full, or undefined. */
export function getTag(slug) {
	return build().tags.find((t) => t.slug === slug);
}
