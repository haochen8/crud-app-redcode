import { expect, Page, test } from '@playwright/test';

const password = 'StrongPass1';

async function registerAndLogin(page: Page, userName: string): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('Username').fill(userName);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password').fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/login\?registered=true$/);
  await expect(page.locator('[role="status"].alert-success')).toContainText('Account created');
  await page.getByLabel('Username').fill(userName);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/books$/);
}

test('registration, login, logout, and complete Books CRUD', async ({ page }) => {
  await registerAndLogin(page, 'books-e2e-user');

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in to your space' })).toBeVisible();
  const loginUserName = page.getByLabel('Username', { exact: true });
  await loginUserName.fill('books-e2e-user');
  await page.getByLabel('Password', { exact: true }).fill('WrongPass1');
  await expect(loginUserName).toHaveValue('books-e2e-user');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid username or password');

  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/books$/);

  await page.getByRole('link', { name: 'Add New Book' }).click();
  await page.getByLabel('Title').fill('E2E Book');
  await page.getByLabel('Author').fill('Test Author');
  await page.getByLabel('Publication Date').fill('2020-05-10');
  await page.getByRole('button', { name: 'Save Book' }).click();
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.locator('[role="status"].alert-success')).toContainText(
    'Book added successfully',
  );

  const createdRow = page.getByRole('row', { name: /E2E Book Test Author/ });
  await expect(createdRow).toBeVisible();
  await createdRow.getByRole('link', { name: 'Edit E2E Book' }).click();
  await page.getByLabel('Title').fill('E2E Book Updated');
  await page.getByRole('button', { name: 'Save Book' }).click();
  await expect(page.locator('[role="status"].alert-success')).toContainText(
    'Book updated successfully',
  );

  const updatedRow = page.getByRole('row', { name: /E2E Book Updated Test Author/ });
  await expect(updatedRow).toBeVisible();
  await updatedRow.getByRole('button', { name: 'Delete E2E Book Updated' }).click();
  await updatedRow.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('[role="status"].alert-success')).toContainText('was deleted');
  await expect(page.getByRole('row', { name: /E2E Book Updated/ })).toHaveCount(0);
});

test('five starter quotes and complete Quotes CRUD', async ({ page }) => {
  await registerAndLogin(page, 'quotes-e2e-user');
  await page.getByRole('link', { name: 'My Quotes' }).click();
  await expect(page).toHaveURL(/\/quotes$/);
  await expect(page.locator('article.quote-card')).toHaveCount(5);

  await page.getByRole('button', { name: 'Add Quote' }).click();
  await page.getByLabel('Quote', { exact: true }).fill('An E2E quote.');
  await page.getByLabel('Author', { exact: true }).fill('E2E Author');
  await page.getByRole('button', { name: 'Save Quote' }).click();
  await expect(page.locator('[role="status"].alert-success')).toContainText(
    'Quote added successfully',
  );
  await expect(page.locator('article.quote-card')).toHaveCount(6);

  const createdCard = page.locator('article.quote-card').filter({ hasText: 'An E2E quote.' });
  await createdCard.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Quote', { exact: true }).fill('An updated E2E quote.');
  await page.getByRole('button', { name: 'Save Quote' }).click();
  await expect(page.locator('[role="status"].alert-success')).toContainText(
    'Quote updated successfully',
  );

  const updatedCard = page.locator('article.quote-card').filter({
    hasText: 'An updated E2E quote.',
  });
  await updatedCard.getByRole('button', { name: 'Delete' }).click();
  await updatedCard.getByRole('button', { name: 'Confirm Delete' }).click();
  await expect(page.locator('[role="status"].alert-success')).toContainText(
    'Quote deleted successfully',
  );
  await expect(page.locator('article.quote-card')).toHaveCount(5);
});

test('mobile navigation and theme preference persist @mobile', async ({ page }) => {
  await registerAndLogin(page, 'mobile-e2e-user');
  const menuButton = page.getByRole('button', { name: 'Toggle navigation' });

  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('link', { name: 'My Quotes' })).toBeHidden();
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  const initialTheme = await page.locator('html').getAttribute('data-bs-theme');
  await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
  const selectedTheme = await page.locator('html').getAttribute('data-bs-theme');
  expect(selectedTheme).not.toBe(initialTheme);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', selectedTheme!);
  await menuButton.click();
  await page.getByRole('link', { name: 'My Quotes' }).click();
  await expect(page).toHaveURL(/\/quotes$/);
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('article.quote-card')).toHaveCount(5);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
});
