import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('has title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/HobbyRent/);
    });

    test('hero section loads', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('Rent the Adventure');
    });

    test('can navigate to login', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Log In');
        await expect(page).toHaveURL(/.*login/);
    });
});
