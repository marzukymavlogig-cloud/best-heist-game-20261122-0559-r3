// Wall cameras: sweep a magenta cone back and forth. A camera that sees the
// thief feeds the alarm fast. An EMP blacks every camera out for a while.

import { CAM_RANGE, CAM_HALF, CAM_ALARM_RATE, EMP_TIME } from './config.js';
import { inCone, losClear, hiddenBySmoke } from './sight.js';

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    center: def.angle,
    sweep: def.sweep,
    speed: def.speed,
    phase: (def.x + def.y) % 6, // deterministic so screenshots compose the same
    angle: def.angle,
    offTimer: 0,
    spotted: false,
  };
}

// Advance the sweep, check the thief, return this camera's alarm rate.
export function updateCamera(cam, dt, world) {
  cam.angle = cam.center + Math.sin(world.time * cam.speed + cam.phase) * cam.sweep;
  cam.spotted = false;
  if (cam.offTimer > 0) {
    cam.offTimer -= dt;
    return 0;
  }
  const t = world.thief;
  if (hiddenBySmoke(cam.x, cam.y, t.x, t.y, world.smoke)) return 0;
  if (!inCone(cam.x, cam.y, cam.angle, CAM_RANGE, CAM_HALF, t.x, t.y)) return 0;
  if (!losClear(cam.x, cam.y, t.x, t.y, world.blockers)) return 0;
  cam.spotted = true;
  return CAM_ALARM_RATE;
}

export function empAllCameras(cameras) {
  for (const cam of cameras) cam.offTimer = EMP_TIME;
}
