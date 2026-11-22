// The Amber Museum — Rook's Last Job. Bootstrap, game loop and state machine.
// One frame: read input, update the world (thief, guards, cameras, alarm),
// open doors as rooms are looted, then draw. Title / playing / paused /
// caught / win are the only screens; R restarts, P pauses, M mutes.

import { VIEW_W, VIEW_H, SMOKE_TIME, SMOKE_RADIUS, EMP_ALARM, CHASE_ALARM_RATE } from './config.js';
import { WALLS, PILLARS, DOOR_A, DOOR_B, EXIT_DOOR, SAFE, ROOMS, THIEF_SPAWN } from './rooms.js';
import { makeGuard, updateGuard } from './guards.js';
import { makeCamera, updateCamera, empAllCameras } from './cameras.js';
import { makeThief, updateThief } from './thief.js';
import { makeAlarm, updateAlarm } from './alarm.js';
import {
  makeAudio,
  ensureAudio,
  sfxPickup,
  sfxStep,
  sfxUnlock,
  sfxSpotted,
  sfxCaught,
  sfxWin,
  sfxSmoke,
  sfxEmp,
  sfxAlarm,
  sfxDoor,
} from './audio.js';
import { makeInput, endFrame } from './input.js';
import { drawWorld } from './render.js';
import { applyScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const audio = makeAudio();
const input = makeInput(canvas);

function createWorld() {
  const loot = [];
  for (const room of ROOMS) {
    for (const item of room.loot) {
      loot.push({ ...item, room: room.id, taken: false, inSafe: !!item.inSafe });
    }
  }
  const guards = [];
  for (const room of ROOMS) {
    for (const g of room.guards) guards.push(makeGuard(g));
  }
  const cameras = [];
  for (const room of ROOMS) {
    for (const c of room.cameras) cameras.push(makeCamera(c));
  }
  return {
    time: 0,
    screen: 'title',
    room: 0,
    thief: makeThief(THIEF_SPAWN),
    guards,
    cameras,
    loot,
    alarm: makeAlarm(),
    doors: {
      A: { locked: true },
      B: { locked: true, pickable: false, picked: false },
      exit: { locked: true },
    },
    safe: { cracked: false },
    smoke: [],
    events: [],
    caught: false,
    rating: 'GHOST',
    stats: { seen: 0, lootTaken: 0, time: 0 },
    message: '',
    messageTimer: 0,
    solids: [],
    blockers: [],
    alarmBeepTimer: 0,
  };
}

let world = createWorld();

function showMessage(text) {
  world.message = text;
  world.messageTimer = 3;
  statusEl.textContent = `${ROOMS[world.room].name}. Alarm ${Math.round(world.alarm.value)}. ${text}`;
}

// Solid rects for movement and sight: walls, pillars, the safe, locked doors.
// During a lockdown every door seals, even one already picked.
function computeSolids() {
  const solids = [...WALLS, ...PILLARS, SAFE];
  const sealed = world.alarm.lockdown > 0;
  if (world.doors.A.locked || sealed) solids.push(DOOR_A);
  if (!world.doors.B.picked || sealed) solids.push(DOOR_B);
  if (world.doors.exit.locked || sealed) solids.push(EXIT_DOOR);
  return solids;
}

function roomLootDone(roomId) {
  const items = world.loot.filter((i) => i.room === roomId);
  return items.every((i) => i.taken);
}

function consumeEvents() {
  for (const ev of world.events) {
    if (ev.type === 'loot') {
      sfxPickup(audio);
      showMessage(`${ev.name} pocketed`);
    } else if (ev.type === 'unlock') {
      sfxUnlock(audio);
      showMessage(`${ev.name} unlocked`);
    } else if (ev.type === 'spotted') {
      sfxSpotted(audio);
      showMessage('Spotted! Break line of sight!');
    } else if (ev.type === 'interrupted') {
      showMessage('Interrupted — a guard is on you!');
    }
  }
  world.events.length = 0;
}

function rateRun() {
  if (world.stats.seen === 0 && world.alarm.lockdowns === 0) return 'GHOST';
  if (world.alarm.lockdowns === 0) return 'SHADOW';
  return 'LOUD';
}

function update(dt) {
  world.time += dt;
  if (world.screen !== 'playing') return;
  world.stats.time += dt;

  const solids = computeSolids();
  world.solids = solids;
  world.blockers = solids;

  // Thief first: movement, loot pickup, hold-E interactions.
  updateThief(world.thief, dt, input, world);

  // Which room is Rook standing in?
  world.room = world.thief.x < 430 ? 0 : world.thief.x < 860 ? 1 : 2;

  // Guards and cameras; cameras and pursuits feed the alarm.
  for (const g of world.guards) updateGuard(g, dt, world);
  let alarmRate = 0;
  for (const cam of world.cameras) alarmRate += updateCamera(cam, dt, world);
  alarmRate += world.guards.filter((g) => g.state === 'chase').length * CHASE_ALARM_RATE;
  updateAlarm(world.alarm, dt, alarmRate);

  // Smoke clouds fade.
  for (const c of world.smoke) c.ttl -= dt;
  world.smoke = world.smoke.filter((c) => c.ttl > 0);

  // Doors open as their room is fully looted.
  if (world.doors.A.locked && roomLootDone(0)) {
    world.doors.A.locked = false;
    sfxDoor(audio);
    showMessage('Gallery Door unlocked — move on');
  }
  if (!world.doors.B.pickable && roomLootDone(1)) {
    world.doors.B.pickable = true;
    showMessage('Vault Door can be picked — hold E beside it');
  }
  if (world.doors.exit.locked && roomLootDone(2)) {
    world.doors.exit.locked = false;
    sfxDoor(audio);
    showMessage('Getaway Door open — RUN!');
  }

  // Footsteps and the alarm's heartbeat.
  if (world.thief.moving && world.thief.stepTimer > 0.28) {
    world.thief.stepTimer = 0;
    sfxStep(audio);
  }
  if (world.alarm.value > 50) {
    world.alarmBeepTimer -= dt;
    if (world.alarmBeepTimer <= 0) {
      world.alarmBeepTimer = 0.7;
      sfxAlarm(audio);
    }
  }
  if (world.messageTimer > 0) world.messageTimer -= dt;

  consumeEvents();

  // Caught: a chasing guard touched Rook.
  if (world.caught) {
    world.screen = 'caught';
    sfxCaught(audio);
    return;
  }

  // Getaway: cross the open exit door with the Sun Opal in hand.
  if (!world.doors.exit.locked && world.thief.x > 1252) {
    world.rating = rateRun();
    world.screen = 'win';
    sfxWin(audio);
  }
}

function handleInput() {
  if (input.pressed.has('Enter') && world.screen === 'title') {
    ensureAudio(audio);
    world.screen = 'playing';
  }
  if (input.click && world.screen === 'title') {
    ensureAudio(audio);
    world.screen = 'playing';
  }
  if (input.pressed.has('KeyR') && (world.screen === 'caught' || world.screen === 'win')) {
    world = createWorld();
    world.screen = 'playing';
  }
  if (input.pressed.has('KeyP')) {
    if (world.screen === 'playing') world.screen = 'paused';
    else if (world.screen === 'paused') world.screen = 'playing';
  }
  if (input.pressed.has('KeyM')) {
    audio.muted = !audio.muted;
    showMessage(audio.muted ? 'Sound off' : 'Sound on');
  }
  if (world.screen !== 'playing') return;
  if (input.pressed.has('KeyQ') && world.thief.smoke > 0) {
    world.thief.smoke -= 1;
    world.smoke.push({ x: world.thief.x, y: world.thief.y, r: SMOKE_RADIUS, ttl: SMOKE_TIME });
    sfxSmoke(audio);
    showMessage('Smoke out — they cannot see through it');
  }
  if (input.pressed.has('KeyF') && world.thief.emp > 0) {
    world.thief.emp -= 1;
    empAllCameras(world.cameras);
    world.alarm.value = Math.min(100, world.alarm.value + EMP_ALARM);
    sfxEmp(audio);
    showMessage('EMP fired — cameras dark 8s, alarm +10');
  }
  if (input.click && input.click.y > 64) {
    world.thief.moveTarget = { x: input.click.x, y: input.click.y };
  }
}

// ?scene=lobby|gallery|vault|win jumps straight into a composed live frame.
const scene = new URLSearchParams(location.search).get('scene');
if (scene) applyScene(world, scene);

// Tiny test hook for the play-test harness: read state, warp Rook, set the
// alarm, or loot a room. It never plays the game by itself.
window.__rook = {
  world: () => world,
  start: () => {
    ensureAudio(audio);
    world.screen = 'playing';
  },
  warp: (x, y) => {
    world.thief.x = x;
    world.thief.y = y;
    world.thief.moveTarget = null;
  },
  setAlarm: (v) => {
    world.alarm.value = v;
  },
  takeRoom: (roomId) => {
    for (const item of world.loot) {
      if (item.room === roomId && !item.inSafe) item.taken = true;
    }
    world.thief.loot = world.loot.filter((i) => i.taken).length;
  },
  reset: () => {
    world = createWorld();
    world.screen = 'playing';
  },
};

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleInput();
  update(dt);
  drawWorld(ctx, world);
  endFrame(input);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
