type HowToPlayProps = {
  onClose: () => void
}

export function HowToPlay({ onClose }: HowToPlayProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="how-to-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">QUICK START</p>
            <h2 id="how-to-title">Cách chơi</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng hướng dẫn">
            ×
          </button>
        </div>

        <div className="how-to-intro">
          <strong>Mục tiêu chung</strong>
          <p>Đưa nhân vật vàng tới ô exit vàng. Ở các level có Echo, bạn phải tạo một bản sao để làm việc ở nơi khác cùng lúc.</p>
        </div>

        <div className="how-to-steps">
          <article>
            <span>1</span>
            <div>
              <strong>RECORD — Ghi đường đi</strong>
              <p>Di chuyển Player. Mọi nút bạn bấm được lưu vào hàng Echo Memory.</p>
            </div>
          </article>
          <article>
            <span>2</span>
            <div>
              <strong>COMMIT — Tạo Echo</strong>
              <p>Room reset về ban đầu. Echo xuất hiện và nhớ đúng chuỗi vừa ghi.</p>
            </div>
          </article>
          <article>
            <span>3</span>
            <div>
              <strong>EXECUTE — Phối hợp</strong>
              <p>Mỗi lần bạn bấm một nút, Player đi một lượt và Echo phát lại một bước trong memory.</p>
            </div>
          </article>
        </div>

        <div className="how-to-grid">
          <section>
            <h3>Ký hiệu trong room</h3>
            <div className="legend-list">
              <div><i className="legend-swatch player" /><span><strong>Player vàng</strong> — nhân vật bạn điều khiển.</span></div>
              <div><i className="legend-swatch echo" /><span><strong>Echo xanh</strong> — phát lại memory sau Commit.</span></div>
              <div><i className="legend-swatch plate" /><span><strong>Plate xanh</strong> — mở cửa hoặc tắt laser khi bị đè.</span></div>
              <div><i className="legend-swatch exit" /><span><strong>Exit vàng</strong> — đứng vào đây để thắng level.</span></div>
              <div><i className="legend-swatch crate" /><span><strong>Crate gỗ</strong> — đi vào để đẩy thêm một ô.</span></div>
              <div><i className="legend-swatch laser" /><span><strong>Laser đỏ</strong> — chạm vào sẽ fail level.</span></div>
            </div>
          </section>

          <section>
            <h3>Điều khiển</h3>
            <div className="control-cheatsheet">
              <div><kbd>WASD</kbd><span>Di chuyển</span></div>
              <div><kbd>↑ ↓ ← →</kbd><span>Di chuyển</span></div>
              <div><kbd>Space</kbd><span>WAIT một lượt</span></div>
              <div><kbd>Enter</kbd><span>Commit memory</span></div>
              <div><kbd>Z</kbd><span>Undo khi Record</span></div>
              <div><kbd>R</kbd><span>Reset level</span></div>
            </div>
          </section>
        </div>

        <div className="how-to-tip">
          Mỗi level có mục <strong>“Xem lời giải từng nút”</strong> bên dưới bàn chơi. Mở mục đó khi bạn bị kẹt.
        </div>

        <button type="button" className="primary-button how-to-start" onClick={onClose}>
          Đã hiểu — chơi ngay
        </button>
      </section>
    </div>
  )
}
