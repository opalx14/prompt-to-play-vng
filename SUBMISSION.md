# Echo Relay — Submission One-Pager

## Elevator pitch

**Echo Relay** là puzzle game isometric theo lượt, nơi người chơi ghi lại một chuỗi hành động để tạo ra một Echo lặp lại chính xác ký ức đó. Player và Echo phải phối hợp để giữ công tắc, mở cửa, đẩy crate, tắt laser và thoát khỏi từng room.

## Core hook

> Một nhân vật không thể ở hai nơi cùng lúc — nhưng ký ức của họ có thể.

## Play time

Khoảng 5–12 phút cho 5 level hiện tại.

## Main features

- Grid-based, turn-based và deterministic.
- Record → Commit → Reset → Echo replay.
- Pressure plate, door, crate, laser và exit.
- 5 level có difficulty curve rõ ràng.
- Undo trong pha Record, reset nhanh và hint theo level.
- Keyboard và on-screen controls.
- Lưu tiến trình và mute setting bằng localStorage.
- Gameplay không cần backend hoặc API key.

## Technical highlights

- Next.js 16, React 19 và TypeScript.
- Canvas 2D isometric renderer tự viết.
- Puzzle engine thuần TypeScript, không phụ thuộc React/DOM.
- Level được định nghĩa bằng dữ liệu.
- Unit tests xác minh golden path của toàn bộ 5 level.
- Playwright E2E xác minh keyboard input, progression và fail/retry.
- Production build tĩnh, dễ deploy lên Vercel.

## Controls

- Move: WASD / Arrow keys
- Wait: Space
- Commit: Enter
- Undo record: Z
- Reset: R
- Level menu: Escape

## Suggested 60–90 second video script

**0–6s — Hook**  
Hiện cảnh Echo và player tách ra hai hướng. Text: “You cannot be in two places. Your memory can.”

**6–18s — Record**  
Cho thấy player đi tới pressure plate, timeline ghi lại từng bước rồi bấm Commit.

**18–32s — Replay**  
Room reset, Echo xuất hiện và lặp lại đường đi. Player đi hướng khác, cửa mở đúng lúc.

**32–48s — Escalation**  
Cắt nhanh qua crate được Echo đẩy lên plate và hành động WAIT để đồng bộ cửa.

**48–62s — Danger**  
Laser đang bật, Echo giữ plate để tắt beam, player băng qua.

**62–75s — Finish**  
Player chạm exit, hiện Mission Complete và level select 5/5.

**75–85s — End card**  
Echo Relay · Prompt To Play 2026 · Playable in browser.

## Screenshots to include

1. Level 1 overview.
2. First Echo trong pha Execute.
3. Echo đẩy crate lên pressure plate.
4. Laser corridor bật/tắt.
5. Mission Complete hoặc level select 5/5.

## Author information to fill before submission

- Name / team:
- Role:
- Email:
- Portfolio URL:
- GitHub URL:
- Public playable URL:
- Video URL:

## Final external tasks

Các việc không thể hoàn tất chỉ bằng source local:

- Deploy repository lên public hosting.
- Điền thông tin tác giả/đội.
- Quay hoặc dựng trailer chính thức.
- Chụp screenshot trên máy sạch sau visual QA.
- Đối chiếu thể lệ mới nhất và form đăng ký chính thức.
