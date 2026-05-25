import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {}
	},
	server: {
		fs: {
			strict: false
		}
	},
	build: {
		target: 'es2022'
	},
	optimizeDeps: {
		exclude: []
	}
});
