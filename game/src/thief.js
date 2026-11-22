// Rook, the thief: keyboard + click-to-move, sneak/run, loot weight, tools
// (smoke, EMP) and the hold-E interactions — picking the vault door's lock
// and cracking the amber safe. An interaction is interrupted when spotted.

import {
  BASE_SPEED,
  RUN_MULT,
  SNEAK_MULT,
  LOOT_WEIGHT,
  THIEF_RADIUS,
  LOOT_RADIUS,
  INTERACT_RADIUS,
  LOCKPICK_TIME,
  SAFE_TIME,
} from './config.js';
import { moveCircle } from './sight.js';
import { DOOR_B, SAFE } from './rooms.js';

export function makeThief(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    r: THIEF_RADIUS,
    dir: -Math.PI / 2,
    sneaking: false,
    running: false,
    moving: false,
    loot: 0,
    smoke: 2,
    emp: 1,
    moveTarget: null,
    interact: 0, // 0..1 progress on the current hold-E target
    interactTarget: null, // 'doorB' | 'safe' | null
    stepTimer: 0,
  };
}

export function thiefSpeed(t) {
  let s = BASE_SPEED * (1 - LOOT_WEIGHT * t.loot);
  if (t.sneaking) s *= SNEAK_MULT;
  else if (t.running) s *= RUN_MULT;
  return s;
}

function nearestInteractable(t, world) {
  const dxB = DOOR_B.x + 4 - t.x;
  const dyB = DOOR_B.y + 40 - t.y;
  if (!world.doors.B.picked && world.doors.B.pickable && dxB * dxB + dyB * dyB < INTERACT_RADIUS * INTERACT_RADIUS) {
    return 'doorB';
  }
  const dxS = SAFE.x + 32 - t.x;
  const dyS = SAFE.y + 32 - t.y;
  if (!world.safe.cracked && dxS * dxS + dyS * dyS < INTERACT_RADIUS * INTERACT_RADIUS) {
    return 'safe';
  }
  return null;
}

function updateInteract(t, dt, input, world) {
  const target = nearestInteractable(t, world);
  t.interactTarget = target;
  const chasing = world.guards.some((g) => g.state === 'chase');
  if (!target || !input.down.has('KeyE')) {
    if (t.interact > 0 && !target) t.interact = 0;
    return;
  }
  if (chasing) {
    if (t.interact > 0) {
      t.interact = 0;
      world.events.push({ type: 'interrupted' });
    }
    return;
  }
  const need = target === 'doorB' ? LOCKPICK_TIME : SAFE_TIME;
  t.interact += dt / need;
  if (t.interact >= 1) {
    t.interact = 0;
    if (target === 'doorB') {
      world.doors.B.picked = true;
      world.events.push({ type: 'unlock', name: 'Vault Door' });
    } else {
      world.safe.cracked = true;
      const opal = world.loot.find((item) => item.kind === 'opal');
      if (opal) opal.inSafe = false;
      world.events.push({ type: 'unlock', name: 'The Amber Safe' });
    }
  }
}

export function updateThief(t, dt, input, world) {
  let mx = 0;
  let my = 0;
  if (input.down.has('KeyW') || input.down.has('ArrowUp')) my -= 1;
  if (input.down.has('KeyS') || input.down.has('ArrowDown')) my += 1;
  if (input.down.has('KeyA') || input.down.has('ArrowLeft')) mx -= 1;
  if (input.down.has('KeyD') || input.down.has('ArrowRight')) mx += 1;
  t.sneaking = input.down.has('ShiftLeft') || input.down.has('ShiftRight');
  t.running = input.down.has('Space');

  if (mx !== 0 || my !== 0) {
    t.moveTarget = null;
    const len = Math.hypot(mx, my);
    mx /= len;
    my /= len;
  } else if (t.moveTarget) {
    const dx = t.moveTarget.x - t.x;
    const dy = t.moveTarget.y - t.y;
    const d = Math.hypot(dx, dy);
    if (d < 8) t.moveTarget = null;
    else {
      mx = dx / d;
      my = dy / d;
    }
  }

  const sp = thiefSpeed(t);
  t.moving = mx !== 0 || my !== 0;
  if (t.moving) {
    t.dir = Math.atan2(my, mx);
    moveCircle(t, mx * sp * dt, my * sp * dt, t.r, world.solids);
    t.stepTimer += dt;
  }

  // Walk over loot to pocket it; every piece slows Rook down a little.
  for (const item of world.loot) {
    if (item.taken || item.inSafe) continue;
    const dx = item.x - t.x;
    const dy = item.y - t.y;
    const reach = LOOT_RADIUS + t.r;
    if (dx * dx + dy * dy < reach * reach) {
      item.taken = true;
      t.loot += 1;
      world.stats.lootTaken += 1;
      world.events.push({ type: 'loot', name: item.name });
    }
  }

  updateInteract(t, dt, input, world);
}
