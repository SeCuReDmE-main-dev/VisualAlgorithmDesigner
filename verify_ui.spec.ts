import { test, expect } from '@playwright/test';

test('verify bottom panel slide and pin', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for the app to load
  await page.waitForTimeout(1000);

  // The panel should be at the bottom but hidden (translateY).
  // We can hover the trigger area to reveal it.
  // The hit area is a Box with height 16px placed at the bottom.
  // We can locate it by hovering the bottom middle of the screen.

  const viewportSize = page.viewportSize();
  if (viewportSize) {
    await page.mouse.move(viewportSize.width / 2, viewportSize.height - 5);
  }

  // Wait for the transition to finish
  await page.waitForTimeout(1000);

  // Now the panel should be fully visible, take a screenshot
  await page.screenshot({ path: '/home/jules/verification/screenshots/hovered.png' });

  // Click the pin icon
  await page.getByRole('button', { name: /pin/i }).click().catch(() => page.locator('button svg').last().click());

  // Move mouse away
  await page.mouse.move(0, 0);

  // Wait for any transition to finish (it should stay pinned)
  await page.waitForTimeout(1000);

  // Take another screenshot
  await page.screenshot({ path: '/home/jules/verification/screenshots/pinned.png' });
});
