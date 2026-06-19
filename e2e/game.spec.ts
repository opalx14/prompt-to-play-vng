import { expect, test, type Page } from '@playwright/test'

type Move = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'WAIT'

const MOVE_LABELS: Record<Move, string> = {
  UP: 'Move up',
  DOWN: 'Move down',
  LEFT: 'Move left',
  RIGHT: 'Move right',
  WAIT: 'Wait',
}

async function waitForGameReady(page: Page) {
  await expect(page.locator('[data-game-ready="true"]')).toBeVisible()
}

async function clickMoves(page: Page, moves: Move[]) {
  for (const move of moves) {
    await page.getByRole('button', { name: MOVE_LABELS[move] }).click()
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  const shouldShowFirstTimeHelp = testInfo.title.includes('first-time instructions')
  await page.addInitScript(({ showHelp }) => {
    window.localStorage.clear()
    if (!showHelp) window.localStorage.setItem('echo-relay-help-seen-v1', 'true')
  }, { showHelp: shouldShowFirstTimeHelp })
})

test('shows first-time instructions with mechanics and controls', async ({ page }) => {
  await page.goto('/')
  await waitForGameReady(page)

  await expect(page.getByRole('heading', { name: 'Cách chơi' })).toBeVisible()
  await expect(page.getByText('RECORD — Ghi đường đi')).toBeVisible()
  await expect(page.getByText('Plate xanh')).toBeVisible()
  await page.getByRole('button', { name: 'Đã hiểu — chơi ngay' }).click()
  await expect(page.getByRole('heading', { name: 'Cách chơi' })).toBeHidden()
})

test('loads the playable game shell', async ({ page }) => {
  await page.goto('/')
  await waitForGameReady(page)

  await expect(page.getByRole('heading', { name: 'Echo Relay' })).toBeVisible()
  await expect(page.getByText('LEVEL 01')).toBeVisible()
  await expect(page.getByText('Arrival', { exact: true })).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
})

test('completes level 1 and level 2', async ({ page }) => {
  await page.goto('/')
  await waitForGameReady(page)

  await clickMoves(page, [
    'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT',
    'UP', 'UP', 'UP', 'UP',
  ])
  await expect(page.locator('[data-phase="WON"]')).toBeVisible()
  await expect(page.getByText('MISSION COMPLETE')).toBeVisible()

  await page.getByRole('button', { name: 'Level tiếp theo' }).click()
  await expect(page.locator('[data-level-id="first-echo"]')).toBeVisible()

  await clickMoves(page, ['UP', 'UP', 'UP'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await expect(page.locator('[data-phase="EXECUTE"]')).toBeVisible()

  await clickMoves(page, [
    'RIGHT', 'UP', 'UP', 'UP',
    'RIGHT', 'RIGHT', 'UP', 'RIGHT',
  ])
  await expect(page.locator('[data-phase="WON"]')).toBeVisible()
})

test('completes level 3 and level 4 from level select', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'echo-relay-progress-v1',
      JSON.stringify(['arrival', 'first-echo', 'sync-window']),
    )
  })
  await page.goto('/')
  await waitForGameReady(page)

  await page.getByRole('button', { name: 'Levels' }).click()
  await page.getByRole('button', { name: 'Level 3: Sync Window' }).click()

  await clickMoves(page, ['UP', 'UP', 'UP', 'UP', 'RIGHT'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await clickMoves(page, [
    'RIGHT', 'RIGHT', 'UP', 'UP', 'WAIT',
    'RIGHT', 'RIGHT', 'RIGHT', 'UP',
  ])
  await expect(page.locator('[data-phase="WON"]')).toBeVisible()

  await page.getByRole('button', { name: 'Level tiếp theo' }).click()
  await expect(page.locator('[data-level-id="crate-relay"]')).toBeVisible()

  await clickMoves(page, ['UP', 'UP'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await clickMoves(page, [
    'RIGHT', 'UP', 'UP', 'UP',
    'RIGHT', 'RIGHT', 'UP', 'RIGHT',
  ])
  await expect(page.locator('[data-phase="WON"]')).toBeVisible()
})

test('keyboard movement advances a turn', async ({ page }) => {
  await page.goto('/')
  await waitForGameReady(page)
  await page.locator('canvas').click({ position: { x: 20, y: 20 } })

  await page.keyboard.press('ArrowRight')
  await expect(page.locator('[data-turn="1"]')).toBeVisible()
})

test('mobile viewport keeps touch controls usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await waitForGameReady(page)

  await expect(page.getByRole('button', { name: 'Move right' })).toBeVisible()
  await page.getByRole('button', { name: 'Move right' }).click()
  await expect(page.locator('[data-turn="1"]')).toBeVisible()
})

test('shows laser failure and allows a successful retry', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'echo-relay-progress-v1',
      JSON.stringify(['arrival', 'first-echo', 'sync-window', 'crate-relay']),
    )
  })
  await page.goto('/')
  await waitForGameReady(page)

  await page.getByRole('button', { name: 'Levels' }).click()
  await page.getByRole('button', { name: 'Level 5: Laser Crossing' }).click()
  await expect(page.locator('[data-level-id="laser-crossing"]')).toBeVisible()

  await clickMoves(page, ['RIGHT'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await clickMoves(page, ['RIGHT', 'RIGHT', 'UP', 'UP'])
  await expect(page.locator('[data-phase="FAILED"]')).toBeVisible()
  await expect(page.getByText('TIMELINE COLLAPSED')).toBeVisible()

  await page.getByRole('button', { name: 'Chơi lại' }).click()
  await clickMoves(page, ['UP'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await clickMoves(page, [
    'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT',
    'UP', 'UP', 'UP', 'UP',
  ])
  await expect(page.locator('[data-phase="WON"]')).toBeVisible()
})
