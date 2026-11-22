// The Amber Museum: three rooms in a row, each harder than the last.
// Lobby -> Gallery -> Vault, with a getaway door out of the vault.
// Coordinates are canvas pixels; the play floor is x 16..1264, y 80..844.

// Outer shell + the two divider walls. Each divider leaves a door gap at
// y 400..480, and the outer right wall leaves the getaway gap there too.
export const WALLS = [
  { x: 8, y: 72, w: 1264, h: 8 }, // top
  { x: 8, y: 844, w: 1264, h: 8 }, // bottom
  { x: 8, y: 72, w: 8, h: 780 }, // left
  { x: 1264, y: 72, w: 8, h: 328 }, // right, above getaway
  { x: 1264, y: 480, w: 8, h: 372 }, // right, below getaway
  { x: 430, y: 72, w: 8, h: 328 }, // lobby/gallery divider, above door A
  { x: 430, y: 480, w: 8, h: 372 }, // lobby/gallery divider, below door A
  { x: 860, y: 72, w: 8, h: 328 }, // gallery/vault divider, above door B
  { x: 860, y: 480, w: 8, h: 372 }, // gallery/vault divider, below door B
];

// Marble pillars: cover to break sight lines, and solid to walk around.
export const PILLARS = [
  { x: 150, y: 300, w: 36, h: 36 },
  { x: 300, y: 620, w: 36, h: 36 },
  { x: 560, y: 250, w: 36, h: 36 },
  { x: 700, y: 620, w: 36, h: 36 },
  { x: 1000, y: 250, w: 36, h: 36 },
  { x: 1140, y: 620, w: 36, h: 36 },
];

// Doors sit in the wall gaps. A door is a solid rect while locked.
export const DOOR_A = { id: 'A', x: 430, y: 400, w: 8, h: 80, name: 'Gallery Door' };
export const DOOR_B = { id: 'B', x: 860, y: 400, w: 8, h: 80, name: 'Vault Door', lockpick: true };
export const EXIT_DOOR = { id: 'X', x: 1264, y: 400, w: 8, h: 80, name: 'Getaway Door' };

// The amber safe in the middle of the vault; the Sun Opal sleeps inside it.
export const SAFE = { x: 1028, y: 428, w: 64, h: 64, name: 'The Amber Safe' };

export const THIEF_SPAWN = { x: 60, y: 780 };

export const ROOMS = [
  {
    id: 0,
    name: 'Marble Lobby',
    x0: 16,
    x1: 430,
    tip: 'Loot everything — the Gallery Door opens at 3/3.',
    loot: [
      { x: 140, y: 170, kind: 'vase', name: 'Marble Vase' },
      { x: 320, y: 730, kind: 'coins', name: 'Coin Hoard' },
      { x: 360, y: 140, kind: 'painting', name: 'Gilded Portrait' },
    ],
    guards: [
      { x: 120, y: 300, speed: 46, waypoints: [[120, 300], [120, 700], [340, 700], [340, 300]] },
      { x: 250, y: 150, speed: 40, waypoints: [[250, 150], [380, 150], [380, 780], [250, 780]] },
    ],
    cameras: [
      { x: 420, y: 86, angle: 2.2, sweep: 0.8, speed: 0.45 },
    ],
  },
  {
    id: 1,
    name: 'Portrait Gallery',
    x0: 438,
    x1: 860,
    tip: 'Loot 4/4, then hold E on the Vault Door to pick its lock.',
    loot: [
      { x: 520, y: 170, kind: 'idol', name: 'Jade Idol' },
      { x: 700, y: 140, kind: 'painting', name: 'Duchess Portrait' },
      { x: 790, y: 730, kind: 'vase', name: 'Porcelain Vase' },
      { x: 540, y: 720, kind: 'coins', name: 'Coin Hoard' },
    ],
    guards: [
      { x: 520, y: 300, speed: 48, waypoints: [[520, 300], [520, 700], [800, 700], [800, 300]] },
      { x: 650, y: 150, speed: 42, waypoints: [[650, 150], [820, 150], [820, 780], [650, 780]] },
      { x: 640, y: 460, speed: 55, waypoints: [[560, 460], [760, 460]] },
    ],
    cameras: [
      { x: 850, y: 86, angle: 2.2, sweep: 0.8, speed: 0.5 },
      { x: 442, y: 838, angle: -0.9, sweep: 0.7, speed: 0.4 },
    ],
  },
  {
    id: 2,
    name: 'Vault Chamber',
    x0: 868,
    x1: 1264,
    tip: 'Crack the safe (hold E, 5s), take the Sun Opal, then run for the Getaway Door.',
    loot: [
      { x: 990, y: 170, kind: 'gem', name: 'Star Ruby' },
      { x: 1190, y: 730, kind: 'coins', name: 'Gold Bars' },
      // The Sun Opal starts inside the safe; once cracked it slides out onto
      // the floor in front of the safe, where Rook can grab it.
      { x: 1060, y: 524, kind: 'opal', name: 'Sun Opal', inSafe: true },
    ],
    guards: [
      { x: 950, y: 300, speed: 50, waypoints: [[950, 300], [950, 700], [1230, 700], [1230, 300]] },
      { x: 1100, y: 150, speed: 44, waypoints: [[1100, 150], [1240, 150], [1240, 780], [1100, 780]] },
      { x: 1000, y: 460, speed: 58, waypoints: [[920, 460], [1240, 460]] },
      { x: 1150, y: 400, speed: 52, waypoints: [[1150, 180], [1150, 760]] },
    ],
    cameras: [
      { x: 1252, y: 86, angle: 2.2, sweep: 0.8, speed: 0.5 },
      { x: 872, y: 838, angle: -0.9, sweep: 0.7, speed: 0.45 },
      { x: 1252, y: 838, angle: -2.2, sweep: 0.8, speed: 0.55 },
    ],
  },
];
