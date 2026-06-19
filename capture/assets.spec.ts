import { mkdir } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

type Move = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'WAIT'

const MOVE_LABELS: Record<Move, string> = {
  UP: 'Move up',
  DOWN: 'Move down',
  LEFT: 'Move left',
  RIGHT: 'Move right',
  WAIT: 'Wait',
}

async function ready(page: Page) {
  await expect(page.locator('[data-game-ready="true"]')).toBeVisible()
  await page.waitForTimeout(350)
}

async function clickMoves(page: Page, moves: Move[], delay = 180) {
  for (const move of moves) {
    await page.getByRole('button', { name: MOVE_LABELS[move] }).click()
    await page.waitForTimeout(delay)
  }
}

async function chooseLevel(page: Page, levelNumber: number, levelName: string) {
  await page.getByRole('button', { name: 'Levels' }).click()
  await page.getByRole('button', { name: `Level ${levelNumber}: ${levelName}` }).click()
  await page.waitForTimeout(350)
}

test('capture submission screenshots and raw demo video', async ({ page }) => {
  await mkdir('submission/screenshots', { recursive: true })
  await mkdir('submission/demo', { recursive: true })

  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem('echo-relay-capture-ready')) {
      window.localStorage.clear()
      window.sessionStorage.setItem('echo-relay-capture-ready', 'true')
    }
    window.localStorage.setItem('echo-relay-help-seen-v1', 'true')
  })
  await page.goto('/')
  await ready(page)
  await page.screenshot({ path: 'submission/screenshots/01-arrival.png', fullPage: true })

  await clickMoves(page, [
    'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT',
    'UP', 'UP', 'UP', 'UP',
  ])
  await expect(page.locator('[data-phase="WON"]')).toBeVisible()
  await page.getByRole('button', { name: 'Level tiếp theo' }).click()

  await clickMoves(page, ['UP', 'UP', 'UP'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await clickMoves(page, ['RIGHT', 'UP', 'UP'])
  await page.screenshot({ path: 'submission/screenshots/02-first-echo.png', fullPage: true })

  await page.evaluate(() => {
    window.localStorage.setItem(
      'echo-relay-progress-v1',
      JSON.stringify(['arrival', 'first-echo', 'sync-window', 'crate-relay']),
    )
  })
  await page.reload()
  await ready(page)
  await chooseLevel(page, 4, 'Crate Relay')
  await clickMoves(page, ['UP', 'UP'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await clickMoves(page, ['RIGHT', 'UP'])
  await page.screenshot({ path: 'submission/screenshots/03-crate-relay.png', fullPage: true })

  await chooseLevel(page, 5, 'Laser Crossing')
  await page.screenshot({ path: 'submission/screenshots/04-laser-active.png', fullPage: true })
  await clickMoves(page, ['UP'])
  await page.getByRole('button', { name: /Commit/ }).click()
  await clickMoves(page, ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP'])
  await page.screenshot({ path: 'submission/screenshots/05-laser-disabled.png', fullPage: true })
  await clickMoves(page, ['UP', 'UP', 'UP'])
  await expect(page.locator('[data-phase="WON"]')).toBeVisible()
  await page.screenshot({ path: 'submission/screenshots/06-mission-complete.png', fullPage: true })

  const video = page.video()
  await page.close()
  if (video) await video.saveAs('submission/demo/echo-relay-raw-demo.webm')
})
