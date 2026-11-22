// Guard patrols: walk waypoints, watch a vision cone, and chase the thief
// once suspicion hits 100. A guard that loses sight for 3 seconds gives up
// and goes back to patrol, suspicion half spent.

import {
  CONE_RANGE,
  CONE_HALF,
  SUSPICION_GAIN,
  SUSPICION_DECAY,
  SNEAK_GAIN_MULT,
  RUN_GAIN_MULT,
  CHASE_SPEED_MULT,
  CAUGHT_DISTANCE,
  GUARD_RADIUS,
} from './config.js';
import { inCone, losClear, hiddenBySmoke, angleTo, angleDiff, moveCircle } from './sight.js';

export function makeGuard(def) {
  return {
    x: def.x,
    y: def.y,
    speed: def.speed,
    waypoints: def.waypoints,
    wp: 0,
    angle: 0,
    suspicion: 0,
    state: 'patrol', // patrol | chase
    loseTimer: 0,
    seen: false, // has this guard ever fully spotted the thief?
  };
}

// Can this guard see the thief right now? Cone + clear sight line + no smoke.
export function guardSeesThief(g, world) {
  const t = world.thief;
  if (hiddenBySmoke(g.x, g.y, t.x, t.y, world.smoke)) return false;
  if (!inCone(g.x, g.y, g.angle, CONE_RANGE, CONE_HALF, t.x, t.y)) return false;
  return losClear(g.x, g.y, t.x, t.y, world.blockers);
}

export function updateGuard(g, dt, world) {
  const t = world.thief;
  const sees = guardSeesThief(g, world);

  if (sees) {
    let rate = SUSPICION_GAIN;
    if (t.sneaking) rate *= SNEAK_GAIN_MULT;
    if (t.running) rate *= RUN_GAIN_MULT;
    g.suspicion = Math.min(100, g.suspicion + rate * dt);
    if (g.suspicion >= 100 && g.state !== 'chase') {
      g.state = 'chase';
      g.loseTimer = 0;
      if (!g.seen) {
        g.seen = true;
        world.stats.seen += 1;
        world.events.push({ type: 'spotted' });
      }
    }
  } else {
    g.suspicion = Math.max(0, g.suspicion - SUSPICION_DECAY * dt);
  }

  if (g.state === 'chase') {
    if (sees) g.loseTimer = 0;
    else g.loseTimer += dt;
    if (g.loseTimer > 3) {
      g.state = 'patrol';
      g.suspicion = 55;
      g.loseTimer = 0;
      return;
    }
    const a = angleTo(g.x, g.y, t.x, t.y);
    g.angle = a;
    const sp = g.speed * CHASE_SPEED_MULT;
    moveCircle(g, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, GUARD_RADIUS, world.solids);
    const dx = t.x - g.x;
    const dy = t.y - g.y;
    if (dx * dx + dy * dy < CAUGHT_DISTANCE * CAUGHT_DISTANCE) world.caught = true;
    return;
  }

  // Patrol: walk to the next waypoint, facing the direction of travel.
  const wp = g.waypoints[g.wp % g.waypoints.length];
  const dx = wp[0] - g.x;
  const dy = wp[1] - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 6) {
    g.wp = (g.wp + 1) % g.waypoints.length;
    return;
  }
  const a = Math.atan2(dy, dx);
  g.angle += angleDiff(a, g.angle) * Math.min(1, dt * 8);
  moveCircle(g, Math.cos(a) * g.speed * dt, Math.sin(a) * g.speed * dt, GUARD_RADIUS, world.solids);
}
