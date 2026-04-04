import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		prerender: {
			entries: ['*', '/sitemap.xml', '/robots.txt'],
			handleHttpError: 'warn',
			handleUnseenRoutes: 'ignore'
		},
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		}),
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components',
			$stores: './src/lib/stores',
			$services: './src/lib/services',
			$convex: './convex'
		}
	}
};

export default config;
