import type { ReactNode } from 'react'
import { LevelGuide } from '@/components/game/level-guide'
import type { Action, GameState } from '@/game/core/types'

const ACTION_LABELS: Record<Action, string> = {
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
  WAIT: '·',
}

type GameHudProps = {
  state: GameState
  muted: boolean
  onAction: (action: Action) => void
  onCommit: () => void
  onUndo: () => void
  onReset: () => void
  onToggleMute: () => void
  onOpenLevels: () => void
  onOpenHelp: () => void
  children: ReactNode
}

export function GameHud({
  state,
  muted,
  onAction,
  onCommit,
  onUndo,
  onReset,
  onToggleMute,
  onOpenLevels,
  onOpenHelp,
  children,
}: GameHudProps) {
  const canCommit = state.phase === 'RECORD' && state.recordedActions.length > 0
  const canUndo = state.phase === 'RECORD' && state.recordedActions.length > 0

  return (
    <>
      <header className="game-header">
        <div>
          <p className="eyebrow">PROMPT TO PLAY · PORTFOLIO BUILD</p>
          <h1>Echo Relay</h1>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-button help-button" onClick={onOpenHelp}>
            Cách chơi
          </button>
          <button type="button" className="ghost-button" onClick={onOpenLevels}>
            Levels
          </button>
          <button type="button" className="ghost-button" onClick={onToggleMute}>
            {muted ? 'Sound off' : 'Sound on'}
          </button>
          <div className={`phase-badge phase-${state.phase.toLowerCase()}`}>
            {state.phase}
          </div>
        </div>
      </header>

      <div className="mission-strip">
        <div>
          <span>LEVEL {String(state.level.number).padStart(2, '0')}</span>
          <strong>{state.level.name}</strong>
        </div>
        <p>{state.level.objective}</p>
      </div>

      {children}

      <LevelGuide state={state} />

      <div className="game-console">
        <section className="timeline-panel" aria-label="Echo action timeline">
          <div className="panel-heading">
            <span>{state.level.usesEcho ? 'Echo memory' : 'Mission progress'}</span>
            <span>
              {state.level.usesEcho
                ? `${state.recordedActions.length}/${state.level.maxRecordedActions}`
                : `Turn ${state.turn}`}
            </span>
          </div>

          {state.level.usesEcho ? (
            <div
              className="timeline"
              style={{ gridTemplateColumns: `repeat(${state.level.maxRecordedActions}, minmax(34px, 1fr))` }}
            >
              {Array.from({ length: state.level.maxRecordedActions }, (_, index) => {
                const action = state.recordedActions[index]
                const isPlayback = state.phase === 'EXECUTE' && index === state.turn

                return (
                  <span
                    className={`timeline-step ${action ? 'filled' : ''} ${isPlayback ? 'active' : ''}`}
                    key={index}
                  >
                    {action ? ACTION_LABELS[action] : index + 1}
                  </span>
                )
              })}
            </div>
          ) : (
            <div className="direct-mission-copy">
              Không cần Echo trong level này. Hãy làm quen với grid và cổng thoát.
            </div>
          )}

          <div className="hint-inline">
            <strong>Gợi ý nhanh:</strong> {state.level.hint}
          </div>
        </section>

        <section className="controls-panel" aria-label="Game controls">
          <div className="movement-grid">
            <button type="button" aria-label="Move up" onClick={() => onAction('UP')}>↑</button>
            <button type="button" aria-label="Move left" onClick={() => onAction('LEFT')}>←</button>
            <button type="button" aria-label="Wait" onClick={() => onAction('WAIT')}>·</button>
            <button type="button" aria-label="Move right" onClick={() => onAction('RIGHT')}>→</button>
            <button type="button" aria-label="Move down" onClick={() => onAction('DOWN')}>↓</button>
          </div>

          <div className="action-buttons">
            {state.level.usesEcho && (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  Undo · Z
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={onCommit}
                  disabled={!canCommit}
                >
                  Commit · Enter
                </button>
              </>
            )}
            <button type="button" className="secondary-button" onClick={onReset}>
              Reset · R
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
