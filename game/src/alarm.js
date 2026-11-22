// The alarm meter: 0..100, fed by cameras and pursuits, decaying slowly.
// At 100 the museum locks down — doors seal, every guard hunts — then the
// meter drops back and the hunt cools off.

import { ALARM_DECAY, LOCKDOWN_TIME, LOCKDOWN_RESET } from './config.js';

export function makeAlarm() {
  return { value: 0, lockdown: 0, lockdowns: 0 };
}

export function updateAlarm(a, dt, sourceRate) {
  if (a.lockdown > 0) {
    a.lockdown -= dt;
    a.value = 100;
    if (a.lockdown <= 0) a.value = LOCKDOWN_RESET;
    return;
  }
  a.value += (sourceRate - ALARM_DECAY) * dt;
  if (a.value >= 100) {
    a.value = 100;
    a.lockdown = LOCKDOWN_TIME;
    a.lockdowns += 1;
  }
  if (a.value < 0) a.value = 0;
}
