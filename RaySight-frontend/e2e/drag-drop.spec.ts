import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

/**
 * Gate 0 selector contract expected from the workbench integration:
 *
 * - data-testid="algorithm-canvas": full canvas shell
 * - data-testid="algorithm-canvas-drop-surface": valid drop surface only
 * - data-testid="canvas-controls": controls/minimap overlay marked no-drop
 * - data-testid="palette-card-{algorithmId}": focusable palette item
 * - data-testid="palette-drag-handle-{algorithmId}": pointer drag handle
 * - button name "Add {label} to canvas": universal non-drag placement
 * - data-testid="algorithm-node" + data-algorithm-id="{algorithmId}"
 * - data-testid="port-output-{portId}" / "port-input-{portId}"
 * - data-testid="algorithm-edge": committed edge
 *
 * Tests deliberately use this stable accessibility/test-id surface rather
 * than React Flow implementation classes.
 */
const selectors = {
  canvas: '[data-testid="algorithm-canvas"]',
  dropSurface: '[data-testid="algorithm-canvas-drop-surface"]',
  controls: '[data-testid="canvas-controls"]',
  allNodes: '[data-testid="algorithm-node"]',
  allEdges: '[data-testid="algorithm-edge"]',
  paletteCard: (algorithmId: string) => `[data-testid="palette-card-${algorithmId}"]`,
  dragHandle: (algorithmId: string) => `[data-testid="palette-drag-handle-${algorithmId}"]`,
  node: (algorithmId: string) => `[data-testid="algorithm-node"][data-algorithm-id="${algorithmId}"]`,
  outputPort: '[data-testid^="port-output-"]',
  inputPort: '[data-testid^="port-input-"]',
};

interface Point {
  x: number;
  y: number;
}

interface ExternalRequestGuard {
  begin: () => void;
  finish: () => readonly string[];
}

async function openDesigner(page: Page): Promise<void> {
  await page.goto('/designer');
  await expect(page.locator(selectors.canvas)).toBeVisible();
  await expect(page.locator(selectors.dropSurface)).toBeVisible();
}

async function centerOf(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  expect(box, 'Expected the contract target to have a bounding box.').not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

async function pointerDrag(page: Page, source: Locator, target: Locator | Point): Promise<void> {
  await source.scrollIntoViewIfNeeded();
  const from = await centerOf(source);
  const to = 'x' in target ? target : await centerOf(target);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

async function pointerMoveBelowThreshold(page: Page, source: Locator): Promise<void> {
  const from = await centerOf(source);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 3, from.y + 3, { steps: 2 });
  await page.mouse.up();
}

async function typedPointerDrag(source: Locator, target: Locator, pointerType: 'touch' | 'pen', pointerId: number): Promise<void> {
  const from = await centerOf(source);
  const to = await centerOf(target);
  const event = (type: string, point: Point) => source.dispatchEvent(type, {
    pointerId,
    pointerType,
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    clientX: point.x,
    clientY: point.y,
    bubbles: true,
  });

  await event('pointerdown', from);
  await event('pointermove', { x: from.x + 8, y: from.y });
  await event('pointermove', to);
  await event('pointerup', to);
}

async function installExternalRequestGuard(page: Page, testInfo: TestInfo): Promise<ExternalRequestGuard> {
  const configuredBaseURL = String(testInfo.project.use.baseURL);
  const expectedOrigin = new URL(configuredBaseURL).origin;
  const externalCalls: string[] = [];
  let active = false;

  await page.route('**/*', async (route) => {
    const requestURL = new URL(route.request().url());
    const isNetworkURL = requestURL.protocol === 'http:' || requestURL.protocol === 'https:';

    if (active && isNetworkURL && requestURL.origin !== expectedOrigin) {
      externalCalls.push(requestURL.href);
      await route.abort('blockedbyclient');
      return;
    }

    await route.continue();
  });

  return {
    begin: () => {
      externalCalls.length = 0;
      active = true;
    },
    finish: () => {
      active = false;
      return [...externalCalls];
    },
  };
}

test.describe('Gate 0 drag, drop, placement, and connections', () => {
  test('pointer drag places exactly one palette block without an external call', async ({ page }, testInfo) => {
    const networkGuard = await installExternalRequestGuard(page, testInfo);
    await openDesigner(page);

    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();
    networkGuard.begin();
    await pointerDrag(
      page,
      page.locator(selectors.dragHandle('pathfinding')),
      page.locator(selectors.dropSurface),
    );
    const externalCalls = networkGuard.finish();

    await expect(page.locator(selectors.canvas)).toHaveAttribute('data-dnd-phase', 'idle');
    await expect(nodes).toHaveCount(before + 1);
    await expect(page.locator(selectors.node('pathfinding')).last()).toBeVisible();
    expect(externalCalls).toEqual([]);
  });

  test('touch pointer drag places exactly one block', async ({ page }) => {
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();
    await typedPointerDrag(
      page.locator(selectors.dragHandle('pathfinding')),
      page.locator(selectors.dropSurface),
      'touch',
      701,
    );
    await expect(page.locator(selectors.canvas)).toHaveAttribute('data-dnd-phase', 'idle');
    await expect(nodes).toHaveCount(before + 1);
  });

  test('pen pointer drag places exactly one block', async ({ page }) => {
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();
    await typedPointerDrag(
      page.locator(selectors.dragHandle('pathfinding')),
      page.locator(selectors.dropSurface),
      'pen',
      702,
    );
    await expect(page.locator(selectors.canvas)).toHaveAttribute('data-dnd-phase', 'idle');
    await expect(nodes).toHaveCount(before + 1);
  });

  test('movement below the six-pixel activation threshold does not insert', async ({ page }) => {
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();

    await pointerMoveBelowThreshold(page, page.locator(selectors.dragHandle('pathfinding')));

    await expect(nodes).toHaveCount(before);
  });

  test('Escape cancels an active pointer drag', async ({ page }) => {
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();
    const handleCenter = await centerOf(page.locator(selectors.dragHandle('pathfinding')));
    const dropCenter = await centerOf(page.locator(selectors.dropSurface));

    await page.mouse.move(handleCenter.x, handleCenter.y);
    await page.mouse.down();
    await page.mouse.move(dropCenter.x, dropCenter.y, { steps: 8 });
    await page.keyboard.press('Escape');
    await page.mouse.up();

    await expect(nodes).toHaveCount(before);
  });

  test('dropping over the controls/no-drop overlay does not insert', async ({ page }) => {
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();

    await pointerDrag(
      page,
      page.locator(selectors.dragHandle('pathfinding')),
      page.locator(selectors.controls),
    );

    await expect(nodes).toHaveCount(before);
  });

  test('universal Add button places a block at the visible canvas center', async ({ page }) => {
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();

    await page.getByRole('button', { name: 'Add Pathfinding to canvas' }).click();

    await expect(nodes).toHaveCount(before + 1);
    const nodeCenter = await centerOf(page.locator(selectors.node('pathfinding')).last());
    const canvasCenter = await centerOf(page.locator(selectors.dropSurface));
    expect(Math.abs(nodeCenter.x - canvasCenter.x)).toBeLessThanOrEqual(20);
    expect(Math.abs(nodeCenter.y - canvasCenter.y)).toBeLessThanOrEqual(20);
  });

  test('keyboard placement supports Enter, arrows, Shift precision, commit, and cancel', async ({ page }) => {
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();
    const card = page.locator(selectors.paletteCard('pathfinding'));

    await card.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Enter');
    await expect(nodes).toHaveCount(before + 1);

    await card.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Escape');
    await expect(nodes).toHaveCount(before + 1);
  });

  test('typed output and input ports create one edge', async ({ page }) => {
    await openDesigner(page);
    await page.getByRole('button', { name: 'Add Search to canvas' }).click();
    await page.getByRole('button', { name: 'Add Recommendation to canvas' }).click();

    const sourcePort = page.locator(selectors.node('search')).locator(selectors.outputPort).first();
    const targetPort = page.locator(selectors.node('recommendation')).locator(selectors.inputPort).first();
    await expect(sourcePort).toBeVisible();
    await expect(targetPort).toBeVisible();

    const edges = page.locator(selectors.allEdges);
    const before = await edges.count();
    await pointerDrag(page, sourcePort, targetPort);
    await expect(edges).toHaveCount(before + 1);
  });

  test('clicking a typed output then input creates one edge', async ({ page }) => {
    await openDesigner(page);
    await page.getByRole('button', { name: 'Add Search to canvas' }).click();
    await page.getByRole('button', { name: 'Add Recommendation to canvas' }).click();

    const sourcePort = page.locator(selectors.node('search')).locator(selectors.outputPort).first();
    const targetPort = page.locator(selectors.node('recommendation')).locator(selectors.inputPort).first();
    const edges = page.locator(selectors.allEdges);
    const before = await edges.count();
    await sourcePort.click();
    await targetPort.click();
    await expect(edges).toHaveCount(before + 1);
  });

  test('a prefab is one atomic undo and redo transaction', async ({ page }) => {
    await openDesigner(page);
    await page.getByTestId('library-tab-workflows').click();

    const nodes = page.locator(selectors.allNodes);
    const edges = page.locator(selectors.allEdges);
    const nodeCount = await nodes.count();
    const edgeCount = await edges.count();
    await page.getByRole('button', { name: 'Add Homework Organizer to canvas' }).click();
    await expect(nodes).toHaveCount(nodeCount + 3);
    await expect(edges).toHaveCount(edgeCount + 2);

    await page.getByTestId('graph-undo').click();
    await expect(nodes).toHaveCount(nodeCount);
    await expect(edges).toHaveCount(edgeCount);

    await page.getByTestId('graph-redo').click();
    await expect(nodes).toHaveCount(nodeCount + 3);
    await expect(edges).toHaveCount(edgeCount + 2);
  });

  test('pointer drag places one complete prefab transaction', async ({ page }) => {
    await openDesigner(page);
    await page.getByTestId('library-tab-workflows').click();
    const nodes = page.locator(selectors.allNodes);
    const edges = page.locator(selectors.allEdges);
    const nodeCount = await nodes.count();
    const edgeCount = await edges.count();

    await pointerDrag(
      page,
      page.locator(selectors.dragHandle('homework-organizer')),
      page.locator(selectors.dropSurface),
    );

    await expect(nodes).toHaveCount(nodeCount + 3);
    await expect(edges).toHaveCount(edgeCount + 2);
  });

  test('post-Gate-0 annex surfaces are absent by default', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await openDesigner(page);

    await expect(page.getByTestId('library-tab-h2o')).toHaveCount(0);
    await expect(page.getByText('RaySight', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Evaluate' })).toHaveCount(0);
    expect(requests.some((url) => url.includes('/api/'))).toBe(false);
  });

  test('100 repeated pointer drags produce exactly 100 insertions', async ({ page }) => {
    test.setTimeout(420_000);
    await openDesigner(page);
    const nodes = page.locator(selectors.allNodes);
    const before = await nodes.count();
    const dropSurface = page.locator(selectors.dropSurface);
    const dragHandle = page.locator(selectors.dragHandle('pathfinding'));
    await expect(dragHandle).toBeEnabled();
    await page.waitForTimeout(250);

    for (let index = 0; index < 100; index += 1) {
      await pointerDrag(page, dragHandle, dropSurface);
      await expect(page.locator(selectors.canvas)).toHaveAttribute('data-dnd-phase', 'idle');
      await expect(nodes).toHaveCount(before + index + 1);
    }

    await expect(nodes).toHaveCount(before + 100);
  });
});
