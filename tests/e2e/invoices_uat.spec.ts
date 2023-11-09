import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

test("admin login and create invoice", async ({ page }) => {
    const { clear, save } = permissions(page);

    await login(page);
    await page.getByRole('link', { name: 'Invoices', exact: true }).click();

    await page
        .getByRole('main')
        .getByRole('link', { name: 'New Invoice' })
        .click();

    await page.waitForTimeout(100);

    await page.getByRole('option').first().click();
    await expect(page.getByRole('combobox', { name: 'Client' })).toHaveValue('cypress');
    await page.locator('div').filter({ hasText: /^Invoice Date$/ }).getByRole('textbox').fill('2023-11-01');
    await page.locator('div').filter({ hasText: /^Due Date$/ }).getByRole('textbox').fill('2023-11-30');

    // await page.locator('#partial').click();
    // await page.locator('#partial').fill('10');
    // await page.waitForTimeout(1000);
    // await page.locator('#partial').press('Tab');
    // await expect(page.getByRole('form', { name: 'Partial/Deposit' })).toHaveValue('10');

    await page.getByRole('button', { name: 'Add Item' }).click();

    await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().click();
    await expect(page.locator('#notes')).toBeVisible();
    await page.getByText('Dolore.').first().click();
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().click();
    await page.getByRole('cell', { name: 'New Product Dolore. Beatae aut dolores. Dolore. Nisi vel quos sunt. Product Notes 120 Product Notes 120' }).getByRole('textbox').fill('something new in here');
    await page.getByRole('row', { name: 'New Product $ 0.00' }).locator('#notes').click();
    await page.getByRole('row', { name: '$ 0.00' }).locator('#notes').fill('Updated description');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#notes').press('Tab');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#cost').fill('10');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#cost').press('Tab');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#quantity').fill('10');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#quantity').press('Tab');
    await page.getByRole('button', { name: 'Public Notes' }).click();

    await page.frameLocator('iFrame').nth(0).getByRole('paragraph').first().click();
    await page.frameLocator('iFrame').nth(0).getByRole('paragraph').first().fill("Public Notes");
    await expect(page.frameLocator('iFrame').nth(0).getByRole('paragraph').first().getByText('Public Notes')).toBeVisible();

    await page.getByRole('button', { name: 'Private Notes' }).click();
    await page.frameLocator('iFrame').nth(1).getByRole('paragraph').first().click();
    await page.frameLocator('iFrame').nth(1).getByRole('paragraph').first().fill("Private Notes");
    await expect(page.frameLocator('iFrame').nth(1).getByRole('paragraph').first().getByText('Private Notes')).toBeVisible();

    await page.getByRole('button', { name: 'Terms' }).click();
    await page.frameLocator('iFrame').nth(2).getByRole('paragraph').first().click();
    await page.frameLocator('iFrame').nth(2).getByRole('paragraph').first().fill("Invoice Terms");
    await expect(page.frameLocator('iFrame').nth(2).getByRole('paragraph').first().getByText('Invoice Terms')).toBeVisible();

    await page.getByRole('button', { name: 'Footer' }).click();
    await page.frameLocator('iFrame').nth(3).getByRole('paragraph').first().click();
    await page.frameLocator('iFrame').nth(3).getByRole('paragraph').first().fill("Invoice Footer");
    await expect(page.frameLocator('iFrame').nth(3).getByRole('paragraph').first().getByText('Invoice Footer')).toBeVisible();

    await page.getByRole('button', { name: 'Documents' }).click();
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('combobox', { name: 'Project' }).click();
    await page.getByRole('combobox', { name: 'User' }).click();

    await page.locator('section').filter({ hasText: 'Exchange Rate' }).getByRole('spinbutton').click();
    await page.locator('section').filter({ hasText: 'Exchange Rate' }).getByRole('spinbutton').fill('0.5');
    await page.getByRole('combobox', { name: 'Vendor' }).click();
    await page.getByRole('combobox', { name: 'Design' }).click();
    await page.getByText('Clean').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Balance Due')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Balance Due\$ 243\.00$/ }).getByRole('definition')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Paid to Date\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Total\$ 243\.00$/ }).getByRole('definition')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Discount\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Subtotal\$ 243\.00$/ }).getByRole('definition')).toBeVisible();


    await page.locator('dd').filter({ hasText: 'PercentAmount' }).getByRole('spinbutton').click();
    await page.locator('dd').filter({ hasText: 'PercentAmount' }).getByRole('spinbutton').fill('10');
    await page.locator('select').selectOption('false');
    await page.getByRole('button', { name: 'Save' }).click();
    
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Mark Sent' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add Item' }).click();

    await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().click();
    await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().fill('Something New');
    await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().press('Tab');
    await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().press('Tab');
    await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().click();
    await page.getByRole('row', { name: '$ 0.00' }).locator('#notes').fill('Updated description');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#notes').press('Tab');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#cost').fill('10');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#cost').press('Tab');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#quantity').fill('100');
    await page.getByRole('row', { name: '$ 0.00' }).locator('#quantity').press('Tab');

    await page.locator('dd').filter({ hasText: 'PercentAmount' }).getByRole('spinbutton').click();
    await page.locator('dd').filter({ hasText: 'PercentAmount' }).getByRole('spinbutton').fill('10');
    await page.locator('dd').filter({ hasText: 'PercentAmount' }).getByRole('spinbutton').press('Tab');

    await expect(page.locator('div').filter({ hasText: /^Subtotal\$ 1,243\.00$/ }).getByRole('definition')).toBeVisible();

    await expect(page.locator('div').filter({ hasText: /^Total\$ 1,118\.70$/ }).getByRole('definition')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Discount\$ 124\.30$/ }).getByRole('definition')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Paid To Date\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Balance Due\$ 1,118\.70$/ }).getByRole('definition')).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);


    // await expect(page.getByRole('form', { name: 'Partial/Deposit' })).toHaveValue('10');
});
