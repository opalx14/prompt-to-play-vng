export type Position = { x: number; y: number }

export type Action = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'WAIT'

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type GamePhase = 'RECORD' | 'EXECUTE' | 'WON' | 'FAILED'

export type Plate = {
  id: string
  position: Position
}

export type Door = {
  id: string
  position: Position
  plateIds: string[]
}

export type Laser = {
  id: string
  position: Position
  direction: Direction
  disabledByPlateIds?: string[]
}

export type LevelGuide = {
  concept: string
  recordPlan?: string
  executePlan: string
  recordActions?: Action[]
  executeActions: Action[]
  mechanicNotes: string[]
}

export type Level = {
  id: string
  number: number
  name: string
  subtitle: string
  objective: string
  hint: string
  width: number
  height: number
  playerStart: Position
  exit: Position
  walls: Position[]
  plates: Plate[]
  doors: Door[]
  crates: Position[]
  lasers: Laser[]
  usesEcho: boolean
  maxRecordedActions: number
  guide: LevelGuide
}

export type GameState = {
  level: Level
  phase: GamePhase
  player: Position
  echo: Position | null
  crates: Position[]
  recordedActions: Action[]
  turn: number
  activePlateIds: string[]
  openDoorIds: string[]
  laserCells: Position[]
  lastAction: Action | null
  failureReason: string | null
}
