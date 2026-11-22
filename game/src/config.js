// The Amber Museum — Rook's Last Job.
// Tuning constants for the whole heist: one place to balance speeds, cones,
// suspicion, alarm and tool timers. All numbers are in canvas pixels / seconds.

export const VIEW_W = 1280;
export const VIEW_H = 860;
export const HUD_H = 64;

export const THIEF_RADIUS = 14;
export const GUARD_RADIUS = 15;
export const LOOT_RADIUS = 16;
export const INTERACT_RADIUS = 84;

export const BASE_SPEED = 152;
export const RUN_MULT = 1.55;
export const SNEAK_MULT = 0.55;
export const LOOT_WEIGHT = 0.06; // -6% speed per loot piece carried

export const CONE_RANGE = 185; // guard vision cone reach
export const CONE_HALF = 0.62; // guard cone half-angle (radians)
export const CAM_RANGE = 215; // camera cone reach
export const CAM_HALF = 0.5; // camera cone half-angle

export const SUSPICION_GAIN = 62; // per second while the thief is seen
export const SUSPICION_DECAY = 22; // per second while hidden
export const SNEAK_GAIN_MULT = 0.5; // sneaking is harder to spot
export const RUN_GAIN_MULT = 1.4; // running draws the eye
export const CHASE_SPEED_MULT = 2.1;

export const ALARM_DECAY = 2.5; // per second with no source
export const CAM_ALARM_RATE = 24; // per second per camera that sees the thief
export const CHASE_ALARM_RATE = 10; // per second per guard in pursuit
export const EMP_ALARM = 10; // instant alarm for firing the EMP
export const LOCKDOWN_TIME = 6; // seconds of lockdown at alarm 100
export const LOCKDOWN_RESET = 55; // alarm after a lockdown ends

export const SMOKE_TIME = 6; // seconds a smoke cloud lasts
export const SMOKE_RADIUS = 95;
export const EMP_TIME = 8; // seconds cameras stay dark

export const LOCKPICK_TIME = 3; // seconds holding E on the vault door
export const SAFE_TIME = 5; // seconds holding E on the amber safe

export const CAUGHT_DISTANCE = 30; // guard touch distance
