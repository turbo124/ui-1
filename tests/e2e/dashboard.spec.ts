import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test("see dashboard after login", async ({ page }) => {
    const { clear, save } = permissions(page);

    await login(page);
    await clear();
    await save();
    await logout(page);

    await login(page, 'permissions@example.com', 'password');

    await expect(page.locator('.flex-grow > .flex-1').first()).toContainText(
        'Dashboard'
    );
});

test("can see search", async ({ page }) => {
    await login(page, 'permissions@example.com', 'password');
    await page.getByPlaceholder('Search... (Ctrl K)').click();
    await page.getByText('User Details').click();
    
    await expect(
        page.getByRole('heading', {
            name: "User Details",
        })
    ).toBeVisible();
});
