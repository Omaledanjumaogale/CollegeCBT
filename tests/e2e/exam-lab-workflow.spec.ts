import { expect, test } from '@playwright/test';

test.describe('exam lab and mock exam workflow', () => {
	test('configures a course, answers a practice question, and advances a full mock exam', async ({ page }) => {
		test.setTimeout(90_000);
		await page.goto('/exam-lab');
		await page.evaluate(() => {
			localStorage.removeItem('collegecbt_exam_lab_draft_v1');
			localStorage.removeItem('collegecbt_exam_attempt_cache_v1');
		});
		await page.reload();

		await page.locator('#acs-inst-type').selectOption('University');
		await expect(page.locator('#acs-faculty')).toBeVisible();
		await expect(page.locator('#acs-faculty')).toHaveValue('');
		await page.locator('#acs-faculty').selectOption({ label: 'Science' });
		await expect(page.locator('#acs-dept')).toBeVisible();
		await page.locator('#acs-dept').selectOption('Computer Science');
		await expect(page.locator('#acs-level')).toBeVisible();
		await page.locator('#acs-level').selectOption('100 Level');
		await expect(page.locator('#acs-course')).toBeVisible();
		await page.locator('#acs-course').selectOption('Introduction to Programming');
		await expect(page.locator('#acs-topic')).toBeVisible();
		await page.locator('#acs-topic').selectOption('Variables and Data Types');
		await page.locator('#lab-difficulty').selectOption('medium');

		await page.getByRole('button', { name: '⚡ Generate Question' }).click();
		await expect(page.getByText('Multiple Choice Questions')).toBeVisible();
		await page.getByTestId('lab-option-A').click();
		await expect(page.getByText('Answer Explanation')).toBeVisible();

		await page.getByRole('button', { name: 'Mock Exam' }).click();
		await page.locator('#exam-size').selectOption('5');
		await page.locator('#time-per-q').selectOption('60');
		await page.locator('#mock-difficulty').selectOption('easy');
		await page.getByTestId('mock-config-start').click();

		await expect(page.getByText('Q 1 OF 5')).toBeVisible({ timeout: 45_000 });
		await page.getByTestId('mock-option-A').click();
		await expect(page.getByText('Q 2 OF 5')).toBeVisible();
	});
});
