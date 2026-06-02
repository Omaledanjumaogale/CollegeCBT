import { expect, test } from '@playwright/test';

test.describe('critical public flows', () => {
	test('home, exam lab, pricing, and auth routes render without dead ends', async ({ page }) => {
		for (const path of ['/', '/exam-lab', '/pricing', '/auth/login', '/auth/register']) {
			await page.goto(path);
			await expect(page.locator('body')).toBeVisible();
			await expect(page.locator('body')).not.toContainText('404');
		}
	});

	test('hamburger navigation opens the unified menu', async ({ page }) => {
		await page.goto('/');
		const menuButton = page.getByRole('button', { name: /open menu/i });
		await expect(menuButton).toBeVisible();
		await menuButton.click();
		await expect(page.locator('button[aria-expanded="true"]')).toBeVisible();
		await expect(page.getByText('Navigation')).toBeVisible();
		await expect(page.getByRole('link', { name: '🤖 Exam Lab' })).toBeVisible();
	});

	test('dashboard redirects unauthenticated users to login flow', async ({ page }) => {
		await page.goto('/dashboard');
		await page.waitForURL(/\/auth\/login/, { timeout: 15_000 });
	});
});
