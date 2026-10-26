// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production domain, used for canonical + Open Graph URLs.
  site: 'https://marvelsbhutan.com',
  // Emit about.html, faq.html, … so every original URL keeps working.
  build: { format: 'file' },
  vite: { plugins: [tailwindcss()] },
});
