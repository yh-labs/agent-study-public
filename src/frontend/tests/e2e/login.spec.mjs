import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SS = (name) => path.join(__dirname, 'screenshots', `${name}.png`);

test.describe('로그인 화면', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
  });

  test('로그인 화면 렌더링', async ({ page }) => {
    await page.screenshot({ path: SS('01_login_screen'), fullPage: true });
    await expect(page.getByText('펫로그')).toBeVisible();
    await expect(page.getByText('오늘의 기록이')).toBeVisible();
  });

  test('카카오·구글 버튼 존재 확인', async ({ page }) => {
    await expect(page.getByText('카카오로 시작하기')).toBeVisible();
    await expect(page.getByText('구글로 시작하기')).toBeVisible();
    await page.screenshot({ path: SS('02_buttons'), fullPage: true });
  });

  test('카카오 버튼 클릭 시 OAuth 리디렉션 시작', async ({ page }) => {
    await Promise.all([
      page.waitForNavigation({ timeout: 5000 }).catch(() => null),
      page.getByText('카카오로 시작하기').click(),
    ]);
    await page.screenshot({ path: SS('03_after_kakao_click'), fullPage: true });
    const url = page.url();
    const redirected = url.includes('kakao') || url.includes('supabase') || url.includes('accounts.google');
    expect(redirected).toBe(true);
  });
});
