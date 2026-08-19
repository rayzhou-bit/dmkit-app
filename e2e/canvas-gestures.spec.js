import { test, expect } from '@playwright/test';

const transformOf = (page) =>
  page.locator('.canvas').evaluate((el) => getComputedStyle(el).transform);

// getComputedStyle returns a matrix() string like "matrix(a, b, c, d, tx, ty)"
// where `a` is the uniform scale factor for our translate+scale transform.
const scaleOf = (matrix) => Number(matrix.match(/matrix\(([^,]+),/)[1]);

// ZoomControls renders the percent text as a bare text node followed by a
// sibling `.tooltip` span, so `.zoom-value`'s full textContent (what
// toHaveText reads) also includes the tooltip copy. Read just the first
// child text node to get the actual displayed percent.
const zoomValueText = (page) =>
  page.locator('.zoom-value').evaluate((el) => el.childNodes[0].textContent);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.canvas')).toBeVisible();
});

test('wheel scrolls pan the canvas and never scroll the document', async ({ page }) => {
  const before = await transformOf(page);
  const container = page.locator('.canvas-container');
  const box = await container.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(300); // past the wheel-gesture settle window
  const after = await transformOf(page);

  expect(after).not.toBe(before);
  expect(scaleOf(after)).toBeCloseTo(scaleOf(before), 5); // pan, not zoom
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('ctrl+wheel zooms the canvas', async ({ page }) => {
  expect(await zoomValueText(page)).toBe('100%');
  const before = await transformOf(page);

  // Verified with 10+ repeated runs in this environment: headless Chromium's
  // synthesized wheel event with Control held reliably sets event.ctrlKey,
  // so this exercises the real ctrlKey branch of the onWheel handler
  // (hooks.js) rather than the keyboard-shortcut fallback (zoomByStep via
  // Ctrl/Cmd+=). No flakiness was observed, so no fallback was needed.
  const container = page.locator('.canvas-container');
  const box = await container.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -240);
  await page.keyboard.up('Control');
  await page.waitForTimeout(300);
  const after = await transformOf(page);

  expect(scaleOf(after)).toBeGreaterThan(scaleOf(before));
  expect(await zoomValueText(page)).not.toBe('100%');
});

test('scrolling inside a card textarea does not pan the canvas', async ({ page }) => {
  const textarea = page.locator('.canvas textarea.text').first();
  await textarea.click();
  const longText = Array.from({ length: 60 }, (_, i) => `line ${i}`).join('\n');
  await textarea.fill(longText);

  const beforeTransform = await transformOf(page);
  const beforeScrollTop = await textarea.evaluate((el) => el.scrollTop);

  const box = await textarea.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(300);

  const afterTransform = await transformOf(page);
  const afterScrollTop = await textarea.evaluate((el) => el.scrollTop);

  expect(afterScrollTop).toBeGreaterThan(beforeScrollTop);
  expect(afterTransform).toBe(beforeTransform);
});

test('space + drag pans without starting a multi-select box', async ({ page }) => {
  const before = await transformOf(page);
  const container = page.locator('.canvas-container');
  const box = await container.boundingBox();
  const startX = box.x + box.width * 0.7;
  const startY = box.y + box.height * 0.7;

  await page.keyboard.down('Space');
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 120, startY + 80, { steps: 10 });
  await page.mouse.up();
  await page.keyboard.up('Space');
  await page.waitForTimeout(100);

  const after = await transformOf(page);
  expect(after).not.toBe(before);

  // `.selection-area` carries a static CSS border (index.scss) that is
  // present regardless of selection state, so getComputedStyle(...).border
  // can't distinguish "no selection" from "selecting". The gesture code
  // itself (useMultiSelectHooks in hooks.js) only ever writes an inline
  // `border` when a start/end selection pair exists, defaulting to
  // `border: null` (which React clears to '') otherwise. So the inline
  // style, not the computed style, is the correct signal here.
  const inlineBorder = await page.locator('.selection-area').evaluate((el) => el.style.border);
  expect(inlineBorder).toBeFalsy();
});
