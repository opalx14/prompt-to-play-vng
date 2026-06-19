import { describe, expect, it } from 'vitest'
import {
  applyAction,
  commitRecording,
  createInitialState,
  resetLevel,
} from '@/game/core/engine'
import type { Action } from '@/game/core/types'
import { levels } from '@/game/levels/levels'

function runActions(levelIndex: number, record: Action[], execute: Action[]) {
  let state = createInitialState(levels[levelIndex])

  for (const action of record) state = applyAction(state, action)
  if (levels[levelIndex].usesEcho) state = commitRecording(state)
  for (const action of execute) state = applyAction(state, action)

  return state
}

describe('Echo Relay engine', () => {
  it('solves level 1 without an echo', () => {
    const state = runActions(0, [], [
      'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT',
      'UP', 'UP', 'UP', 'UP',
    ])

    expect(state.phase).toBe('WON')
    expect(state.echo).toBeNull()
  })

  it('solves level 2 with an echo holding a pressure plate', () => {
    const state = runActions(
      1,
      ['UP', 'UP', 'UP'],
      ['RIGHT', 'UP', 'UP', 'UP', 'RIGHT', 'RIGHT', 'UP', 'RIGHT'],
    )

    expect(state.phase).toBe('WON')
    expect(state.activePlateIds).toEqual(['plate-a'])
    expect(state.openDoorIds).toEqual(['door-a'])
  })

  it('solves level 3 by waiting for the synchronization window', () => {
    const state = runActions(
      2,
      ['UP', 'UP', 'UP', 'UP', 'RIGHT'],
      ['RIGHT', 'RIGHT', 'UP', 'UP', 'WAIT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP'],
    )

    expect(state.phase).toBe('WON')
    expect(state.turn).toBe(9)
  })

  it('lets the echo push a crate onto a pressure plate', () => {
    const state = runActions(
      3,
      ['UP', 'UP'],
      ['RIGHT', 'UP', 'UP', 'UP', 'RIGHT', 'RIGHT', 'UP', 'RIGHT'],
    )

    expect(state.phase).toBe('WON')
    expect(state.crates).toContainEqual({ x: 1, y: 2 })
    expect(state.activePlateIds).toEqual(['plate-a'])
  })

  it('fails when the player enters an active laser beam', () => {
    const level = levels[4]
    let state = createInitialState(level)
    state = applyAction(state, 'RIGHT')
    state = commitRecording(state)

    state = applyAction(state, 'RIGHT')
    state = applyAction(state, 'RIGHT')
    state = applyAction(state, 'UP')
    state = applyAction(state, 'UP')

    expect(state.phase).toBe('FAILED')
    expect(state.failureReason).toContain('laser')
  })

  it('solves level 5 after the echo disables the laser', () => {
    const state = runActions(
      4,
      ['UP'],
      ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP', 'UP', 'UP', 'UP'],
    )

    expect(state.phase).toBe('WON')
    expect(state.laserCells).toHaveLength(0)
  })

  it('restores level data exactly on reset', () => {
    let state = createInitialState(levels[3])
    state = applyAction(state, 'UP')
    state = applyAction(state, 'UP')

    expect(resetLevel(state)).toEqual(createInitialState(levels[3]))
  })
})
