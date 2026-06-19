'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GameHud } from '@/components/game/game-hud'
import { HowToPlay } from '@/components/game/how-to-play'
import { LevelSelect } from '@/components/game/level-select'
import {
  applyAction,
  commitRecording,
  createInitialState,
  positionsEqual,
  resetLevel,
  undoRecording,
} from '@/game/core/engine'
import type { Action, GameState } from '@/game/core/types'
import { playSound } from '@/game/audio/audio'
import { getLevel, levels } from '@/game/levels/levels'
import { renderGame } from '@/game/render/renderer'

const PROGRESS_KEY = 'echo-relay-progress-v1'
const MUTED_KEY = 'echo-relay-muted-v1'
const HELP_SEEN_KEY = 'echo-relay-help-seen-v1'

const KEY_ACTIONS: Record<string, Action> = {
  ArrowUp: 'UP',
  w: 'UP',
  W: 'UP',
  ArrowDown: 'DOWN',
  s: 'DOWN',
  S: 'DOWN',
  ArrowLeft: 'LEFT',
  a: 'LEFT',
  A: 'LEFT',
  ArrowRight: 'RIGHT',
  d: 'RIGHT',
  D: 'RIGHT',
  ' ': 'WAIT',
}

function loadCompletedLevels(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const value = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function loadMuted(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(MUTED_KEY) === 'true'
}

function didCratesMove(previous: GameState, next: GameState): boolean {
  return previous.crates.some((crate, index) => !positionsEqual(crate, next.crates[index]))
}

export function GameShell() {
  const gameCardRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState(() => createInitialState(levels[0]))
  const stateRef = useRef<GameState>(state)
  const [completedLevelIds, setCompletedLevelIds] = useState<string[]>([])
  const [muted, setMuted] = useState(false)
  const [showLevelSelect, setShowLevelSelect] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCompletedLevelIds(loadCompletedLevels())
      setMuted(loadMuted())
      setShowHelp(window.localStorage.getItem(HELP_SEEN_KEY) !== 'true')
      gameCardRef.current?.setAttribute('data-game-ready', 'true')
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const replaceState = useCallback((next: GameState) => {
    stateRef.current = next
    setState(next)
  }, [])

  const markLevelComplete = useCallback((levelId: string) => {
    setCompletedLevelIds((current) => {
      if (current.includes(levelId)) return current
      const next = [...current, levelId]
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const dispatchAction = useCallback((action: Action) => {
    const current = stateRef.current
    const next = applyAction(current, action)
    if (next === current) return

    if (next.phase === 'WON' && current.phase !== 'WON') {
      playSound('win', muted)
      markLevelComplete(next.level.id)
    } else if (next.phase === 'FAILED' && current.phase !== 'FAILED') {
      playSound('fail', muted)
    } else if (next.activePlateIds.length > current.activePlateIds.length) {
      playSound('plate', muted)
    } else if (
      !positionsEqual(current.player, next.player) ||
      didCratesMove(current, next)
    ) {
      playSound('move', muted)
    } else {
      playSound('blocked', muted)
    }

    replaceState(next)
  }, [markLevelComplete, muted, replaceState])

  const commit = useCallback(() => {
    const current = stateRef.current
    const next = commitRecording(current)
    if (next !== current) {
      playSound('commit', muted)
      replaceState(next)
    }
  }, [muted, replaceState])

  const undo = useCallback(() => {
    replaceState(undoRecording(stateRef.current))
  }, [replaceState])

  const reset = useCallback(() => {
    replaceState(resetLevel(stateRef.current))
  }, [replaceState])

  const selectLevel = useCallback((levelId: string) => {
    replaceState(createInitialState(getLevel(levelId)))
    setShowLevelSelect(false)
  }, [replaceState])

  const goToNextLevel = useCallback(() => {
    const currentLevelId = stateRef.current.level.id
    const currentIndex = levels.findIndex((level) => level.id === currentLevelId)
    const nextLevel = levels[currentIndex + 1]

    if (nextLevel) selectLevel(nextLevel.id)
    else setShowLevelSelect(true)
  }, [selectLevel])

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current
      window.localStorage.setItem(MUTED_KEY, String(next))
      return next
    })
  }, [])

  const closeHelp = useCallback(() => {
    window.localStorage.setItem(HELP_SEEN_KEY, 'true')
    setShowHelp(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showHelp) {
        if (event.key === 'Escape' || event.key === 'Enter') closeHelp()
        return
      }

      if (showLevelSelect) {
        if (event.key === 'Escape') setShowLevelSelect(false)
        return
      }

      const action = KEY_ACTIONS[event.key]
      if (action) {
        event.preventDefault()
        dispatchAction(action)
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        if (stateRef.current.phase === 'WON') goToNextLevel()
        else if (stateRef.current.phase === 'FAILED') reset()
        else commit()
      } else if (event.key === 'z' || event.key === 'Z') {
        event.preventDefault()
        undo()
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        reset()
      } else if (event.key === 'Escape') {
        setShowLevelSelect(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeHelp, commit, dispatchAction, goToNextLevel, reset, showHelp, showLevelSelect, undo])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let animationFrame = 0

    const draw = (time: number) => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const nextWidth = Math.max(1, Math.round(bounds.width * pixelRatio))
      const nextHeight = Math.max(1, Math.round(bounds.height * pixelRatio))

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth
        canvas.height = nextHeight
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.imageSmoothingEnabled = false
      renderGame(context, stateRef.current, bounds.width, bounds.height, time)
      animationFrame = window.requestAnimationFrame(draw)
    }

    animationFrame = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  const phaseCopy = state.phase === 'RECORD'
    ? ['Ghi ký ức cho Echo', 'Di chuyển, chỉnh timeline bằng Undo rồi Commit để reset room.']
    : state.phase === 'EXECUTE' && state.level.usesEcho
      ? ['Execute cùng Echo', 'Mỗi hành động của bạn phát lại một hành động trong ký ức.']
      : ['Tìm đường tới cổng', 'Quan sát grid và đưa nhân vật vàng đến exit.']

  return (
    <main className="game-page">
      <section
        ref={gameCardRef}
        className="game-card"
        aria-label="Echo Relay puzzle game"
        data-level-id={state.level.id}
        data-phase={state.phase}
        data-turn={state.turn}
      >
        <GameHud
          state={state}
          muted={muted}
          onAction={dispatchAction}
          onCommit={commit}
          onUndo={undo}
          onReset={reset}
          onToggleMute={toggleMute}
          onOpenLevels={() => setShowLevelSelect(true)}
          onOpenHelp={() => setShowHelp(true)}
        >
          <div className={`canvas-frame ${state.phase === 'FAILED' ? 'screen-failed' : ''}`}>
            <canvas ref={canvasRef} className="game-canvas" aria-label="Isometric puzzle board" />
            <div className="canvas-copy">
              <strong>{phaseCopy[0]}</strong>
              <span>{phaseCopy[1]}</span>
            </div>

            {(state.phase === 'WON' || state.phase === 'FAILED') && (
              <div className="result-overlay">
                <div className={`result-card result-${state.phase.toLowerCase()}`}>
                  <span className="result-kicker">
                    {state.phase === 'WON' ? 'MISSION COMPLETE' : 'TIMELINE COLLAPSED'}
                  </span>
                  <h2>{state.phase === 'WON' ? state.level.name : 'Thử lại'}</h2>
                  <p>
                    {state.phase === 'WON'
                      ? `Bạn đã hoàn thành level ${state.level.number}/5.`
                      : state.failureReason}
                  </p>
                  <div className="result-actions">
                    <button type="button" className="secondary-button" onClick={reset}>
                      Chơi lại
                    </button>
                    {state.phase === 'WON' && (
                      <button type="button" className="primary-button" onClick={goToNextLevel}>
                        {state.level.number === levels.length ? 'Xem level' : 'Level tiếp theo'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </GameHud>

        <footer className="game-footer">
          <span>WASD / Arrow keys: di chuyển</span>
          <span>Space: chờ · Z: undo · R: reset</span>
          <span>{completedLevelIds.length}/{levels.length} level hoàn thành</span>
        </footer>
      </section>

      {showHelp && <HowToPlay onClose={closeHelp} />}

      {showLevelSelect && (
        <LevelSelect
          levels={levels}
          currentLevelId={state.level.id}
          completedLevelIds={completedLevelIds}
          onSelect={selectLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
    </main>
  )
}
