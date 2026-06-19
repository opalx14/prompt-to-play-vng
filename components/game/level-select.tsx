import type { Level } from '@/game/core/types'

type LevelSelectProps = {
  levels: Level[]
  currentLevelId: string
  completedLevelIds: string[]
  onSelect: (levelId: string) => void
  onClose: () => void
}

export function LevelSelect({
  levels,
  currentLevelId,
  completedLevelIds,
  onSelect,
  onClose,
}: LevelSelectProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="level-select-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-select-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">MISSION ARCHIVE</p>
            <h2 id="level-select-title">Chọn level</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng level select">
            ×
          </button>
        </div>

        <div className="level-grid">
          {levels.map((level, index) => {
            const previousLevel = levels[index - 1]
            const unlocked = index === 0 || completedLevelIds.includes(previousLevel.id)
            const completed = completedLevelIds.includes(level.id)
            const current = currentLevelId === level.id

            return (
              <button
                type="button"
                className={`level-card ${current ? 'current' : ''} ${completed ? 'completed' : ''}`}
                aria-label={`Level ${level.number}: ${level.name}`}
                key={level.id}
                disabled={!unlocked}
                onClick={() => onSelect(level.id)}
              >
                <span className="level-number">{String(level.number).padStart(2, '0')}</span>
                <span className="level-card-copy">
                  <strong>{level.name}</strong>
                  <small>{unlocked ? level.subtitle : 'Hoàn thành level trước để mở'}</small>
                </span>
                <span className="level-status" aria-hidden="true">
                  {completed ? '✓' : unlocked ? '→' : 'LOCK'}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
