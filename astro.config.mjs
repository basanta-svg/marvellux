// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const BASE = '/marvellux';

/**
 * The templates use root-absolute paths (/images/…, /faq.html). Astro's `base`
 * does not rewrite those, so prefix them in the built output for GitHub Pages.
 */
const prefixRootPaths = () => ({
  name: 'prefix-root-paths',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const attr = /\b(href|src|action|poster)=(["'])\/(?!\/|marvellux\/)/g;
      const cssUrl = /url\((["']?)\/(?!\/|marvellux\/)/g;
      const str = /(["'`])\/(?=(?:images\/|docs\/|favicon|[a-z0-9-]+\.html|#))/g;
      const walk = async (d) => {
        for (const e of await readdir(d, { withFileTypes: true })) {
          const p = join(d, e.name);
          if (e.isDirectory()) await walk(p);
          else if (/\.(html|css|js)$/.test(e.name)) {
            const src = await readFile(p, 'utf8');
            const out = src
              .replace(attr, `$1=$2${BASE}/`)
              .replace(cssUrl, `url($1${BASE}/`)
              .replace(str, `$1${BASE}/`);
            if (out !== src) await writeFile(p, out);
          }
        }
      };
      await walk(fileURLToPath(dir));
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://basanta-svg.github.io',
  base: BASE,
  // Emit about.html, faq.html, … so every original URL keeps working.
  build: { format: 'file' },
  integrations: [prefixRootPaths()],
  vite: {
    plugins: [
      tailwindcss(),
      {
        // Dev only: Astro serves public/ under the base, but the templates use
        // root-absolute /images/… paths. Prefix them in source before compiling.
        name: 'dev-prefix-root-assets',
        apply: 'serve',
        enforce: 'pre',
        transform(code, id) {
          if (id.includes('node_modules') || !/\/src\/.*\.(astro|css|js|ts)(\?|$)/.test(id.replaceAll('\\', '/'))) return;
          const out = code
            .replace(/(["'`(])\/(?=(?:images\/|docs\/|favicon|[a-z0-9-]+\.html|#))/g, `$1${BASE}/`)
            .replace(/\bhref(=|:\s*)(["'])\/\2/g, `href$1$2${BASE}/$2`);
          return out === code ? undefined : { code: out, map: null };
        },
      },
    ],
  },
});
