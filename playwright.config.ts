import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	timeout: 30_000,
	workers: 1,
	expect: {
		timeout: 5_000
	},
	use: {
		baseURL: 'http://127.0.0.1:4287',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 4287',
		url: 'http://127.0.0.1:4287',
		reuseExistingServer: false,
		timeout: 120_000
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile-chrome', use: { ...devices['Pixel 5'] } }
	]
});
