import type { Direction, GameState, Position } from '@/game/core/types'
import { positionsEqual } from '@/game/core/engine'

const TILE_WIDTH = 72
const TILE_HEIGHT = 36
const WALL_HEIGHT = 34

type ScreenPoint = { x: number; y: number }

type RenderObject = {
  position: Position
  kind: 'wall' | 'door' | 'crate' | 'laser' | 'echo' | 'player'
  id?: string
  direction?: Direction
}

function project(position: Position, origin: ScreenPoint): ScreenPoint {
  return {
    x: origin.x + (position.x - position.y) * (TILE_WIDTH / 2),
    y: origin.y + (position.x + position.y) * (TILE_HEIGHT / 2),
  }
}

function drawDiamond(
  context: CanvasRenderingContext2D,
  point: ScreenPoint,
  fill: string | CanvasGradient,
  stroke: string,
): void {
  const halfWidth = TILE_WIDTH / 2
  const halfHeight = TILE_HEIGHT / 2
  context.beginPath()
  context.moveTo(point.x, point.y - halfHeight)
  context.lineTo(point.x + halfWidth, point.y)
  context.lineTo(point.x, point.y + halfHeight)
  context.lineTo(point.x - halfWidth, point.y)
  context.closePath()
  context.fillStyle = fill
  context.fill()
  context.strokeStyle = stroke
  context.lineWidth = 1
  context.stroke()
}

function drawBlock(
  context: CanvasRenderingContext2D,
  point: ScreenPoint,
  top: string,
  left: string,
  right: string,
  height = WALL_HEIGHT,
): void {
  const halfWidth = TILE_WIDTH / 2
  const halfHeight = TILE_HEIGHT / 2
  const topY = point.y - height

  context.beginPath()
  context.moveTo(point.x - halfWidth, point.y)
  context.lineTo(point.x, point.y + halfHeight)
  context.lineTo(point.x, topY + halfHeight)
  context.lineTo(point.x - halfWidth, topY)
  context.closePath()
  context.fillStyle = left
  context.fill()

  context.beginPath()
  context.moveTo(point.x + halfWidth, point.y)
  context.lineTo(point.x, point.y + halfHeight)
  context.lineTo(point.x, topY + halfHeight)
  context.lineTo(point.x + halfWidth, topY)
  context.closePath()
  context.fillStyle = right
  context.fill()

  drawDiamond(context, { x: point.x, y: topY }, top, 'rgba(255,255,255,0.08)')
}

function drawPlate(
  context: CanvasRenderingContext2D,
  point: ScreenPoint,
  active: boolean,
  time: number,
): void {
  const pulse = 0.55 + Math.sin(time / 260) * 0.12
  context.save()
  context.globalAlpha = active ? 0.95 : pulse
  context.shadowBlur = active ? 22 : 8
  context.shadowColor = active ? '#75efc5' : '#6c78a8'
  drawDiamond(
    context,
    { x: point.x, y: point.y - 2 },
    active ? '#55d6aa' : '#4b5277',
    active ? '#d3fff0' : '#7881ad',
  )
  context.restore()
}

function drawExit(context: CanvasRenderingContext2D, point: ScreenPoint, time: number): void {
  const pulse = 0.68 + Math.sin(time / 310) * 0.18
  context.save()
  context.globalAlpha = pulse
  context.shadowBlur = 24
  context.shadowColor = '#f7d774'
  drawDiamond(context, { x: point.x, y: point.y - 3 }, '#e5b94d', '#fff0a8')
  context.restore()

  context.strokeStyle = `rgba(255, 241, 166, ${pulse})`
  context.lineWidth = 3
  context.beginPath()
  context.ellipse(point.x, point.y - 20, 18, 9, 0, 0, Math.PI * 2)
  context.stroke()
}

function drawActor(
  context: CanvasRenderingContext2D,
  point: ScreenPoint,
  kind: 'player' | 'echo',
  time: number,
): void {
  const bob = Math.sin(time / 220 + point.x) * 2
  const bodyColor = kind === 'player' ? '#f3c969' : '#6ce3ea'
  const headColor = kind === 'player' ? '#ffe9ad' : '#c4fbff'

  context.save()
  context.globalAlpha = kind === 'echo' ? 0.65 : 1
  context.shadowBlur = kind === 'echo' ? 22 : 10
  context.shadowColor = bodyColor

  context.fillStyle = 'rgba(10, 12, 25, 0.45)'
  context.beginPath()
  context.ellipse(point.x, point.y + 9, 16, 7, 0, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = bodyColor
  context.fillRect(point.x - 9, point.y - 24 + bob, 18, 24)
  context.fillStyle = headColor
  context.fillRect(point.x - 7, point.y - 36 + bob, 14, 13)

  context.fillStyle = '#20233b'
  context.fillRect(point.x - 4, point.y - 31 + bob, 2, 2)
  context.fillRect(point.x + 2, point.y - 31 + bob, 2, 2)
  context.restore()
}

function drawDoor(
  context: CanvasRenderingContext2D,
  point: ScreenPoint,
  open: boolean,
): void {
  if (open) {
    context.save()
    context.globalAlpha = 0.5
    context.strokeStyle = '#7cf2c8'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(point.x - 22, point.y - 8)
    context.lineTo(point.x, point.y + 4)
    context.lineTo(point.x + 22, point.y - 8)
    context.stroke()
    context.restore()
    return
  }

  drawBlock(context, point, '#755779', '#463b64', '#352f54', 42)
  context.fillStyle = '#e5b94d'
  context.fillRect(point.x - 3, point.y - 27, 6, 6)
}

function drawCrate(context: CanvasRenderingContext2D, point: ScreenPoint): void {
  drawBlock(context, { x: point.x, y: point.y - 2 }, '#b77a4d', '#72462f', '#5b3629', 24)
  context.strokeStyle = 'rgba(255, 232, 188, 0.45)'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(point.x - 13, point.y - 24)
  context.lineTo(point.x + 13, point.y - 11)
  context.moveTo(point.x + 13, point.y - 24)
  context.lineTo(point.x - 13, point.y - 11)
  context.stroke()
}

function drawLaserEmitter(
  context: CanvasRenderingContext2D,
  point: ScreenPoint,
  direction: Direction,
  active: boolean,
  time: number,
): void {
  drawBlock(context, point, '#842f50', '#4d2038', '#391a2e', 28)
  const pulse = active ? 0.7 + Math.sin(time / 120) * 0.25 : 0.25
  const offsets: Record<Direction, ScreenPoint> = {
    UP: { x: 0, y: -20 },
    DOWN: { x: 0, y: -5 },
    LEFT: { x: -11, y: -12 },
    RIGHT: { x: 11, y: -12 },
  }
  const offset = offsets[direction]

  context.save()
  context.globalAlpha = pulse
  context.shadowBlur = active ? 20 : 4
  context.shadowColor = '#ff4778'
  context.fillStyle = active ? '#ff638e' : '#75455a'
  context.beginPath()
  context.arc(point.x + offset.x, point.y + offset.y, 5, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawLaserBeams(
  context: CanvasRenderingContext2D,
  state: GameState,
  origin: ScreenPoint,
  time: number,
): void {
  const pulse = 0.68 + Math.sin(time / 95) * 0.2

  for (const cell of state.laserCells) {
    const point = project(cell, origin)
    context.save()
    context.globalAlpha = pulse
    context.shadowBlur = 20
    context.shadowColor = '#ff376f'
    drawDiamond(context, { x: point.x, y: point.y - 5 }, 'rgba(255, 45, 102, 0.5)', '#ff6b95')
    context.restore()
  }
}

function drawBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const background = context.createLinearGradient(0, 0, 0, height)
  background.addColorStop(0, '#15172c')
  background.addColorStop(1, '#090b18')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  context.save()
  context.globalAlpha = 0.16
  context.fillStyle = '#7d86ce'
  for (let index = 0; index < 42; index += 1) {
    const x = (index * 83) % width
    const y = (index * 47) % height
    context.fillRect(x, y, index % 3 === 0 ? 2 : 1, index % 3 === 0 ? 2 : 1)
  }
  context.restore()
}

export function renderGame(
  context: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  time: number,
): void {
  drawBackdrop(context, width, height)

  const boardWidth = (state.level.width + state.level.height) * (TILE_WIDTH / 2)
  const scale = Math.min(1, Math.max(0.68, (width - 48) / boardWidth))
  const origin = {
    x: width / 2,
    y: Math.max(118, height / 2 - 105 * scale),
  }

  context.save()
  context.translate(origin.x, origin.y)
  context.scale(scale, scale)
  context.translate(-origin.x, -origin.y)

  for (let sum = 0; sum <= state.level.width + state.level.height - 2; sum += 1) {
    for (let x = 0; x < state.level.width; x += 1) {
      const y = sum - x
      if (y < 0 || y >= state.level.height) continue

      const position = { x, y }
      const point = project(position, origin)
      const alternate = (x + y) % 2 === 0
      const floor = context.createLinearGradient(point.x, point.y - 18, point.x, point.y + 18)
      floor.addColorStop(0, alternate ? '#2c3151' : '#292d4a')
      floor.addColorStop(1, alternate ? '#222640' : '#20233b')
      drawDiamond(context, point, floor, '#3a4061')

      const plate = state.level.plates.find((candidate) => positionsEqual(candidate.position, position))
      if (plate) drawPlate(context, point, state.activePlateIds.includes(plate.id), time)
      if (positionsEqual(position, state.level.exit)) drawExit(context, point, time)
    }
  }

  drawLaserBeams(context, state, origin, time)

  const objects: RenderObject[] = state.level.walls.map((position) => ({
    position,
    kind: 'wall',
  }))

  for (const door of state.level.doors) {
    objects.push({ position: door.position, kind: 'door', id: door.id })
  }
  for (const crate of state.crates) objects.push({ position: crate, kind: 'crate' })
  for (const laser of state.level.lasers) {
    objects.push({
      position: laser.position,
      kind: 'laser',
      id: laser.id,
      direction: laser.direction,
    })
  }
  if (state.echo) objects.push({ position: state.echo, kind: 'echo' })
  objects.push({ position: state.player, kind: 'player' })

  objects.sort((a, b) => {
    const depthA = a.position.x + a.position.y
    const depthB = b.position.x + b.position.y
    if (depthA !== depthB) return depthA - depthB
    return a.position.x - b.position.x
  })

  for (const object of objects) {
    const point = project(object.position, origin)

    if (object.kind === 'wall') {
      drawBlock(context, point, '#414764', '#292e4a', '#232740')
    } else if (object.kind === 'door') {
      drawDoor(context, point, Boolean(object.id && state.openDoorIds.includes(object.id)))
    } else if (object.kind === 'crate') {
      drawCrate(context, point)
    } else if (object.kind === 'laser') {
      const isActive = state.level.lasers.some((laser) => (
        laser.id === object.id &&
        !(laser.disabledByPlateIds ?? []).every((plateId) => state.activePlateIds.includes(plateId))
      ))
      drawLaserEmitter(context, point, object.direction ?? 'LEFT', isActive, time)
    } else {
      drawActor(context, point, object.kind, time)
    }
  }

  context.restore()
}
