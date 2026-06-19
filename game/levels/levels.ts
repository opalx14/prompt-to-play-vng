import type { Level, Position } from '@/game/core/types'

function borderWalls(width: number, height: number): Position[] {
  const walls: Position[] = []

  for (let x = 0; x < width; x += 1) {
    walls.push({ x, y: 0 }, { x, y: height - 1 })
  }

  for (let y = 1; y < height - 1; y += 1) {
    walls.push({ x: 0, y }, { x: width - 1, y })
  }

  return walls
}

const level01: Level = {
  id: 'arrival',
  number: 1,
  name: 'Arrival',
  subtitle: 'Learn the grid',
  objective: 'Đưa nhân vật vàng tới ô cổng vàng ở góc trên bên phải.',
  hint: 'Mỗi lần bấm chỉ đi đúng một ô trên grid.',
  width: 7,
  height: 7,
  playerStart: { x: 1, y: 5 },
  exit: { x: 5, y: 1 },
  walls: borderWalls(7, 7),
  plates: [],
  doors: [],
  crates: [],
  lasers: [],
  usesEcho: false,
  maxRecordedActions: 0,
  guide: {
    concept: 'Level làm quen: chưa có Echo. Chỉ cần tìm đường tới cổng vàng.',
    executePlan: 'Đi sang phải 4 ô, sau đó đi lên 4 ô.',
    executeActions: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP', 'UP', 'UP', 'UP'],
    mechanicNotes: [
      'Nhân vật vàng là bạn.',
      'Ô phát sáng màu vàng là đích đến.',
      'Khối tường tím không thể đi xuyên qua.',
    ],
  },
}

const level02: Level = {
  id: 'first-echo',
  number: 2,
  name: 'First Echo',
  subtitle: 'Be in two places',
  objective: 'Tạo Echo đứng trên plate xanh để mở cửa, còn bạn đi qua cửa tới exit.',
  hint: 'Pha Record là lúc dạy đường đi cho Echo. Commit sẽ reset room và bắt đầu pha Execute.',
  width: 7,
  height: 7,
  playerStart: { x: 1, y: 5 },
  exit: { x: 5, y: 1 },
  walls: [
    ...borderWalls(7, 7),
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 3, y: 5 },
  ],
  plates: [{ id: 'plate-a', position: { x: 1, y: 2 } }],
  doors: [{ id: 'door-a', position: { x: 3, y: 2 }, plateIds: ['plate-a'] }],
  crates: [],
  lasers: [],
  usesEcho: true,
  maxRecordedActions: 8,
  guide: {
    concept: 'Echo sẽ lặp lại chính xác các bước bạn đã ghi, mỗi khi bạn thực hiện một lượt mới.',
    recordPlan: 'Trong RECORD, đi lên 3 lần để kết thúc trên plate xanh, rồi bấm Commit.',
    executePlan: 'Trong EXECUTE, bạn đi vòng bên phải. Echo sẽ tự đi lên plate và giữ cửa mở.',
    recordActions: ['UP', 'UP', 'UP'],
    executeActions: ['RIGHT', 'UP', 'UP', 'UP', 'RIGHT', 'RIGHT', 'UP', 'RIGHT'],
    mechanicNotes: [
      'Plate xanh mở cửa tím khi có Player, Echo hoặc crate đứng lên.',
      'Commit không giữ vị trí hiện tại; room sẽ reset về trạng thái ban đầu.',
      'Sau Commit, mỗi bước của bạn làm Echo chạy một bước trong memory.',
    ],
  },
}

const level03: Level = {
  id: 'sync-window',
  number: 3,
  name: 'Sync Window',
  subtitle: 'Timing matters',
  objective: 'Đồng bộ thời điểm Echo chạm plate với lúc bạn đứng trước cửa.',
  hint: 'WAIT tiêu thụ một lượt mà không di chuyển, nên dùng để chờ Echo bắt kịp.',
  width: 8,
  height: 7,
  playerStart: { x: 1, y: 5 },
  exit: { x: 6, y: 2 },
  walls: [
    ...borderWalls(8, 7),
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
  ],
  plates: [{ id: 'plate-a', position: { x: 2, y: 1 } }],
  doors: [{ id: 'door-a', position: { x: 4, y: 3 }, plateIds: ['plate-a'] }],
  crates: [],
  lasers: [],
  usesEcho: true,
  maxRecordedActions: 9,
  guide: {
    concept: 'Cửa chỉ mở đúng lúc Echo tới plate. WAIT giúp bạn cho thời gian trôi mà vẫn đứng yên.',
    recordPlan: 'Trong RECORD: lên 4 lần, rồi sang phải 1 lần để memory kết thúc trên plate.',
    executePlan: 'Trong EXECUTE: tới trước cửa, WAIT 1 lượt, rồi băng qua và đi tới exit.',
    recordActions: ['UP', 'UP', 'UP', 'UP', 'RIGHT'],
    executeActions: ['RIGHT', 'RIGHT', 'UP', 'UP', 'WAIT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP'],
    mechanicNotes: [
      'Nút chấm giữa cụm điều khiển là WAIT.',
      'Nếu tới cửa quá sớm, cửa vẫn khóa vì Echo chưa tới plate.',
      'Bạn có thể Reset để thử lại ngay, không mất tiến trình level đã hoàn thành.',
    ],
  },
}

const level04: Level = {
  id: 'crate-relay',
  number: 4,
  name: 'Crate Relay',
  subtitle: 'Let the memory push',
  objective: 'Dạy Echo đẩy crate gỗ lên plate, rồi dùng cánh cửa đã mở để thoát.',
  hint: 'Actor chỉ cần đi vào crate để đẩy nó thêm một ô theo cùng hướng.',
  width: 7,
  height: 7,
  playerStart: { x: 1, y: 5 },
  exit: { x: 5, y: 1 },
  walls: [
    ...borderWalls(7, 7),
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 3, y: 5 },
  ],
  plates: [{ id: 'plate-a', position: { x: 1, y: 2 } }],
  doors: [{ id: 'door-a', position: { x: 3, y: 2 }, plateIds: ['plate-a'] }],
  crates: [{ x: 1, y: 3 }],
  lasers: [],
  usesEcho: true,
  maxRecordedActions: 8,
  guide: {
    concept: 'Crate cũng kích hoạt plate. Echo có thể lặp lại hành động đẩy crate sau khi room reset.',
    recordPlan: 'Trong RECORD, đi lên 2 lần: bước thứ hai sẽ đẩy crate lên plate. Sau đó Commit.',
    executePlan: 'Trong EXECUTE, đi vòng bên phải như First Echo trong lúc Echo đẩy crate.',
    recordActions: ['UP', 'UP'],
    executeActions: ['RIGHT', 'UP', 'UP', 'UP', 'RIGHT', 'RIGHT', 'UP', 'RIGHT'],
    mechanicNotes: [
      'Crate gỗ bị chặn nếu phía sau nó là tường, cửa đóng hoặc actor khác.',
      'Khi crate nằm trên plate, cửa giữ trạng thái mở dù Echo rời đi.',
      'Room reset cả crate về vị trí ban đầu khi bạn Commit.',
    ],
  },
}

const level05: Level = {
  id: 'laser-crossing',
  number: 5,
  name: 'Laser Crossing',
  subtitle: 'Hold the shutdown plate',
  objective: 'Cho Echo giữ plate để tắt laser, rồi đưa Player băng qua tia tới exit.',
  hint: 'Laser đỏ gây fail ngay khi Player hoặc Echo đứng trong đường tia.',
  width: 7,
  height: 7,
  playerStart: { x: 1, y: 5 },
  exit: { x: 5, y: 1 },
  walls: borderWalls(7, 7),
  plates: [{ id: 'plate-a', position: { x: 1, y: 4 } }],
  doors: [],
  crates: [],
  lasers: [
    {
      id: 'laser-a',
      position: { x: 6, y: 3 },
      direction: 'LEFT',
      disabledByPlateIds: ['plate-a'],
    },
  ],
  usesEcho: true,
  maxRecordedActions: 8,
  guide: {
    concept: 'Plate xanh là công tắc tắt laser. Echo phải đứng trên plate trước khi bạn bước vào hàng có tia.',
    recordPlan: 'Trong RECORD, đi lên đúng 1 lần để memory kết thúc trên plate gần điểm xuất phát, rồi Commit.',
    executePlan: 'Trong EXECUTE, đi sang phải 4 lần, rồi đi lên 4 lần tới exit.',
    recordActions: ['UP'],
    executeActions: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'UP', 'UP', 'UP', 'UP'],
    mechanicNotes: [
      'Tia đỏ đang sáng nghĩa là laser còn nguy hiểm.',
      'Khi Echo đứng trên plate, toàn bộ đường tia biến mất.',
      'Nếu bị laser chạm, bấm Chơi lại hoặc R để reset level.',
    ],
  },
}

export const levels: Level[] = [level01, level02, level03, level04, level05]

export function getLevel(levelId: string): Level {
  return levels.find((level) => level.id === levelId) ?? levels[0]
}
