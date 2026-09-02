// Every route is prerendered to HTML at build time; adapter-static writes the
// result into build/ and Cloudflare Pages serves it as files.
export const prerender = true;
export const trailingSlash = 'always';
