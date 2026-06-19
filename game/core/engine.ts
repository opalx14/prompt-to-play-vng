import type {
  Action,
  Direction,
  Door,
  GameState,
  Laser,
  Level,
  Position,
} from '@/game/core/types'

const ACTION_VECTORS: Record<Action, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  WAIT: { x: 0, y: 0 },
}

const DIRECTION_VECTORS: Record<Direction, Position> = {
  UP: ACTION_VECTORS.UP,
  DOWN: ACTION_VECTORS.DOWN,
  LEFT: ACTION_VECTORS.LEFT,
  RIGHT: ACTION_VECTORS.RIGHT,
}

export function positionsEqual(a: Position | null, b: Position | null): boolean {
  return Boolean(a && b && a.x === b.x && a.y === b.y)
}

function containsPosition(positions: Position[], target: Position): boolean {
  return positions.some((position) => positionsEqual(position, target))
}

function isInside(level: Level, position: Position): boolean {
  return position.x >= 0 && position.y >= 0 && position.x < level.width && position.y < level.height
}

function doorAt(level: Level, position: Position): Door | undefined {
  return level.doors.find((door) => positionsEqual(door.position, position))
}

function isDoorOpen(state: GameState, door: Door): boolean {
  return state.openDoorIds.includes(door.id)
}

function isSolidTerrain(state: GameState, position: Position): boolean {
  if (!isInside(state.level, position)) return true
  if (containsPosition(state.level.walls, position)) return true

  const door = doorAt(state.level, position)
  if (door && !isDoorOpen(state, door)) return true

  return false
}

function cloneCrates(crates: Position[]): Position[] {
  return crates.map((crate) => ({ ...crate }))
}

function tryMoveActor(
  state: GameState,
  from: Position,
  action: Action,
  occupiedBy: Position | null,
): { position: Position; crates: Position[] } {
  if (action === 'WAIT') {
    return { position: from, crates: state.crates }
  }

  const vector = ACTION_VECTORS[action]
  const target = { x: from.x + vector.x, y: from.y + vector.y }

  if (isSolidTerrain(state, target) || positionsEqual(target, occupiedBy)) {
    return { position: from, crates: state.crates }
  }

  const crateIndex = state.crates.findIndex((crate) => positionsEqual(crate, target))
  if (crateIndex === -1) {
    return { position: target, crates: state.crates }
  }

  const crateTarget = { x: target.x + vector.x, y: target.y + vector.y }
  const crateBlocked =
    isSolidTerrain(state, crateTarget) ||
    containsPosition(state.crates, crateTarget) ||
    positionsEqual(crateTarget, occupiedBy) ||
    positionsEqual(crateTarget, from)

  if (crateBlocked) {
    return { position: from, crates: state.crates }
  }

  const crates = cloneCrates(state.crates)
  crates[crateIndex] = crateTarget
  return { position: target, crates }
}

function activePlateIds(state: GameState): string[] {
  return state.level.plates
    .filter((plate) => (
      positionsEqual(state.player, plate.position) ||
      positionsEqual(state.echo, plate.position) ||
      containsPosition(state.crates, plate.position)
    ))
    .map((plate) => plate.id)
}

function desiredOpenDoorIds(state: GameState, activeIds: string[]): string[] {
  return state.level.doors
    .filter((door) => door.plateIds.every((plateId) => activeIds.includes(plateId)))
    .map((door) => door.id)
}

function shouldKeepDoorOpen(state: GameState, door: Door): boolean {
  return (
    positionsEqual(state.player, door.position) ||
    positionsEqual(state.echo, door.position) ||
    containsPosition(state.crates, door.position)
  )
}

function laserDisabled(laser: Laser, activeIds: string[]): boolean {
  const required = laser.disabledByPlateIds ?? []
  return required.length > 0 && required.every((plateId) => activeIds.includes(plateId))
}

function calculateLaserCells(state: GameState, activeIds: string[], openIds: string[]): Position[] {
  const cells: Position[] = []

  for (const laser of state.level.lasers) {
    if (laserDisabled(laser, activeIds)) continue

    const vector = DIRECTION_VECTORS[laser.direction]
    let current = {
      x: laser.position.x + vector.x,
      y: laser.position.y + vector.y,
    }

    while (isInside(state.level, current)) {
      if (containsPosition(state.level.walls, current)) break

      const door = doorAt(state.level, current)
      if (door && !openIds.includes(door.id)) break
      if (containsPosition(state.crates, current)) break

      cells.push(current)
      current = { x: current.x + vector.x, y: current.y + vector.y }
    }
  }

  return cells
}

function updateWorld(state: GameState): GameState {
  const activeIds = activePlateIds(state)
  const desiredIds = desiredOpenDoorIds(state, activeIds)
  const openIds = state.level.doors
    .filter((door) => desiredIds.includes(door.id) || shouldKeepDoorOpen(state, door))
    .map((door) => door.id)
  const laserCells = calculateLaserCells(state, activeIds, openIds)

  return {
    ...state,
    activePlateIds: activeIds,
    openDoorIds: openIds,
    laserCells,
  }
}

function resolveOutcome(state: GameState): GameState {
  const actorHit =
    containsPosition(state.laserCells, state.player) ||
    (state.echo ? containsPosition(state.laserCells, state.echo) : false)

  if (actorHit) {
    return {
      ...state,
      phase: 'FAILED',
      failureReason: 'Tia laser đã chạm vào một actor.',
    }
  }

  if (positionsEqual(state.player, state.level.exit)) {
    return {
      ...state,
      phase: 'WON',
      failureReason: null,
    }
  }

  return state
}

export function createInitialState(level: Level): GameState {
  const initial: GameState = {
    level,
    phase: level.usesEcho ? 'RECORD' : 'EXECUTE',
    player: { ...level.playerStart },
    echo: null,
    crates: cloneCrates(level.crates),
    recordedActions: [],
    turn: 0,
    activePlateIds: [],
    openDoorIds: [],
    laserCells: [],
    lastAction: null,
    failureReason: null,
  }

  return resolveOutcome(updateWorld(initial))
}

export function applyAction(state: GameState, action: Action): GameState {
  if (state.phase === 'WON' || state.phase === 'FAILED') return state

  if (state.phase === 'RECORD') {
    if (state.recordedActions.length >= state.level.maxRecordedActions) return state

    const movement = tryMoveActor(state, state.player, action, null)
    const next = updateWorld({
      ...state,
      player: movement.position,
      crates: movement.crates,
      recordedActions: [...state.recordedActions, action],
      lastAction: action,
    })

    return resolveOutcome(next)
  }

  const echoAction = state.echo ? (state.recordedActions[state.turn] ?? 'WAIT') : 'WAIT'
  const playerMove = tryMoveActor(state, state.player, action, state.echo)
  let working: GameState = {
    ...state,
    player: playerMove.position,
    crates: playerMove.crates,
  }

  let echo = state.echo
  if (echo) {
    const echoMove = tryMoveActor(working, echo, echoAction, working.player)
    echo = echoMove.position
    working = { ...working, echo, crates: echoMove.crates }
  }

  return resolveOutcome(updateWorld({
    ...working,
    turn: state.turn + 1,
    lastAction: action,
  }))
}

export function commitRecording(state: GameState): GameState {
  if (
    state.phase !== 'RECORD' ||
    state.recordedActions.length === 0 ||
    !state.level.usesEcho
  ) {
    return state
  }

  const committed: GameState = {
    ...state,
    phase: 'EXECUTE',
    player: { ...state.level.playerStart },
    echo: { ...state.level.playerStart },
    crates: cloneCrates(state.level.crates),
    turn: 0,
    activePlateIds: [],
    openDoorIds: [],
    laserCells: [],
    lastAction: null,
    failureReason: null,
  }

  return updateWorld(committed)
}

export function undoRecording(state: GameState): GameState {
  if (state.phase !== 'RECORD' || state.recordedActions.length === 0) return state

  const actions = state.recordedActions.slice(0, -1)
  return actions.reduce(
    (current, action) => applyAction(current, action),
    createInitialState(state.level),
  )
}

export function resetLevel(state: GameState): GameState {
  return createInitialState(state.level)
}
