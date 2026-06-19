import type { Action, GameState } from '@/game/core/types'

const ACTION_META: Record<Action, { symbol: string; label: string }> = {
  UP: { symbol: '↑', label: 'Lên' },
  DOWN: { symbol: '↓', label: 'Xuống' },
  LEFT: { symbol: '←', label: 'Trái' },
  RIGHT: { symbol: '→', label: 'Phải' },
  WAIT: { symbol: '·', label: 'Chờ' },
}

type ActionSequenceProps = {
  actions: Action[]
  activeIndex?: number
}

function ActionSequence({ actions, activeIndex = -1 }: ActionSequenceProps) {
  return (
    <div className="guide-sequence" aria-label={actions.map((action) => ACTION_META[action].label).join(', ')}>
      {actions.map((action, index) => (
        <span
          className={`guide-action ${index < activeIndex ? 'done' : ''} ${index === activeIndex ? 'next' : ''}`}
          key={`${action}-${index}`}
          title={ACTION_META[action].label}
        >
          {ACTION_META[action].symbol}
        </span>
      ))}
    </div>
  )
}

type LevelGuideProps = {
  state: GameState
}

export function LevelGuide({ state }: LevelGuideProps) {
  const guide = state.level.guide
  const isRecord = state.phase === 'RECORD'
  const isExecute = state.phase === 'EXECUTE'
  const recordActions = guide.recordActions ?? []
  const activeActions = isRecord ? recordActions : guide.executeActions
  const activeIndex = isRecord ? state.recordedActions.length : state.turn
  const nextAction = activeActions[activeIndex]

  return (
    <section className="level-guide" aria-label="Hướng dẫn level">
      <div className="guide-summary">
        <div>
          <span className="guide-kicker">Bạn cần làm gì?</span>
          <p>{guide.concept}</p>
        </div>
        {nextAction && (isRecord || isExecute) && (
          <div className="next-action-card">
            <span>Bước gợi ý tiếp theo</span>
            <strong>{ACTION_META[nextAction].symbol}</strong>
            <small>{ACTION_META[nextAction].label}</small>
          </div>
        )}
      </div>

      <div className="guide-phase-grid">
        {state.level.usesEcho && (
          <article className={`guide-phase ${isRecord ? 'current' : ''}`}>
            <span className="guide-phase-number">1</span>
            <div>
              <strong>RECORD — Dạy Echo</strong>
              <p>{guide.recordPlan}</p>
            </div>
          </article>
        )}
        {state.level.usesEcho && (
          <article className={`guide-phase ${isExecute ? 'current' : ''}`}>
            <span className="guide-phase-number">2</span>
            <div>
              <strong>COMMIT — Reset room</strong>
              <p>Bấm Commit. Player, crate và room trở về vị trí đầu; Echo xuất hiện với memory vừa ghi.</p>
            </div>
          </article>
        )}
        <article className={`guide-phase ${isExecute ? 'current' : ''}`}>
          <span className="guide-phase-number">{state.level.usesEcho ? 3 : 1}</span>
          <div>
            <strong>EXECUTE — Tới exit</strong>
            <p>{guide.executePlan}</p>
          </div>
        </article>
      </div>

      <details className="solution-box">
        <summary>Xem lời giải từng nút</summary>
        <div className="solution-content">
          {state.level.usesEcho && (
            <div>
              <span>RECORD</span>
              <ActionSequence
                actions={recordActions}
                activeIndex={isRecord ? state.recordedActions.length : recordActions.length}
              />
              <small>Sau chuỗi này, bấm Commit.</small>
            </div>
          )}
          <div>
            <span>EXECUTE</span>
            <ActionSequence
              actions={guide.executeActions}
              activeIndex={isExecute ? state.turn : -1}
            />
            <small>· là WAIT: đứng yên nhưng Echo vẫn chạy thêm một bước.</small>
          </div>
        </div>
      </details>
    </section>
  )
}
