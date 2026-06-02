import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
			'$env/dynamic/private': fileURLToPath(new URL('./tests/mocks/env-private.ts', import.meta.url)),
			'$env/dynamic/public': fileURLToPath(new URL('./tests/mocks/env-public.ts', import.meta.url))
		}
	},
	test: {
		environment: 'node',
		include: ['tests/unit/**/*.test.ts'],
		globals: true,
		clearMocks: true
	}
});
