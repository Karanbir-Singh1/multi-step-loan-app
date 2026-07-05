import { expect, test } from '@playwright/test';

const fillIdentity = async (page) => {
  await page.getByLabel('Full name').fill('Asha Mehta');
  await page.getByLabel('Date of birth').fill('1991-04-15');
  await page.getByLabel('Email').fill('asha.mehta@example.com');
  await page.getByLabel('Mobile number').fill('9876543210');
};

const fillKyc = async (page) => {
  await page.getByLabel('PAN').fill('ABCDE1234F');
  await page.getByRole('button', { name: /verify/i }).first().click();
  await expect(page.getByText('PAN verified')).toBeVisible();
  await page.getByLabel('Aadhaar').fill('234567890123');
  await page.getByRole('button', { name: /verify/i }).nth(1).click();
  await expect(page.getByText('Aadhaar verified')).toBeVisible();
};

const fillAddress = async (page) => {
  await page.getByLabel('Address line').fill('Marine');
  await page.getByRole('button', { name: /14 Marine Drive/i }).click();
  await expect(page.getByLabel('City')).toHaveValue('Mumbai');
  await expect(page.getByLabel('PIN code')).toHaveValue('400020');
};

const fillIncome = async (page, loanType = 'personal') => {
  await page.getByLabel('Monthly income').fill('180000');
  await page.getByLabel('Monthly obligations').fill('25000');
  await page.getByLabel('Credit score').fill('780');
  if (loanType === 'personal') {
    await page.getByLabel('Employer or business').fill('Northstar Analytics');
  }
  if (loanType === 'home') {
    await page.getByLabel('Co-applicant income').fill('90000');
  }
};

const uploadDocument = async (page, label) => {
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId(`upload-${label}`).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: `${label.toLowerCase().replaceAll(' ', '-')}.png`,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64'
    )
  });
};

const drawSignature = async (page) => {
  const box = await page.getByLabel('Signature pad').boundingBox();
  await page.mouse.move(box.x + 40, box.y + 70);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + 120);
  await page.mouse.move(box.x + 260, box.y + 70);
  await page.mouse.up();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
});

test('completes a personal loan application and generates a pre-approval summary', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Multi-step loan application' })).toBeVisible();
  await page.getByRole('button', { name: /continue/i }).click();

  await fillIdentity(page);
  await page.getByRole('button', { name: /continue/i }).click();
  await fillKyc(page);
  await page.getByRole('button', { name: /continue/i }).click();
  await fillAddress(page);
  await page.getByRole('button', { name: /continue/i }).click();
  await fillIncome(page);
  await page.getByRole('button', { name: /continue/i }).click();

  await page.getByLabel('Requested amount').fill('1200000');
  await page.getByLabel('Tenure in months').fill('48');
  await page.getByLabel('Loan purpose').fill('Home renovation');
  await page.getByRole('button', { name: /continue/i }).click();

  await uploadDocument(page, 'PAN card');
  await uploadDocument(page, 'Aadhaar card');
  await uploadDocument(page, 'Income proof');
  await page.getByRole('button', { name: /continue/i }).click();

  await drawSignature(page);
  await page.getByLabel(/I consent/).check();
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page.getByText('Applicant summary')).toBeVisible();
  await expect(page.getByText('Pre-approved').first()).toBeVisible();
  await page.getByRole('button', { name: /submit application/i }).click();
  await expect(page.getByText('Application submitted')).toBeVisible();
});

test('enforces validation gates before moving between steps', async ({ page }) => {
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByText('Full name is required.')).toBeVisible();
  await expect(page.getByText('Enter a valid email.')).toBeVisible();
  await expect(page.getByText('Applicant must be at least 21.')).toBeVisible();
});

test('renders home loan dependent fields and validates property rules', async ({ page }) => {
  await page.getByRole('button', { name: /^Home/ }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await fillIdentity(page);
  await page.getByRole('button', { name: /continue/i }).click();
  await fillKyc(page);
  await page.getByRole('button', { name: /continue/i }).click();
  await fillAddress(page);
  await page.getByRole('button', { name: /continue/i }).click();
  await fillIncome(page, 'home');
  await page.getByRole('button', { name: /continue/i }).click();

  await page.getByLabel('Requested amount').fill('7000000');
  await page.getByLabel('Tenure in months').fill('180');
  await page.getByLabel('Loan purpose').fill('Purchase');
  await page.getByLabel('Property value').fill('6900000');
  await page.getByLabel('Down payment').fill('200000');
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page.getByText('Property value must exceed requested amount.')).toBeVisible();
  await expect(page.getByText('Down payment must be at least 10%.')).toBeVisible();
});

test('resumes an auto-saved draft after reload', async ({ page }) => {
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByLabel('Full name').fill('Ravi Nair');
  await page.getByLabel('Email').fill('ravi@example.com');
  await expect(page.getByText(/Auto-saved/)).toBeVisible();
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.getByLabel('Full name')).toHaveValue('Ravi Nair');
  await expect(page.getByLabel('Email')).toHaveValue('ravi@example.com');
});
