// All sound is synthesized with WebAudio: no audio files, no network.
// A tiny tone helper plus one named effect per game moment.

export function makeAudio() {
  return { ctx: null, master: null, muted: false };
}

export function ensureAudio(a) {
  if (!a.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      a.ctx = new AC();
      a.master = a.ctx.createGain();
      a.master.gain.value = 0.45;
      a.master.connect(a.ctx.destination);
    } catch (e) {
      a.ctx = null;
    }
  }
  if (a.ctx && a.ctx.state === 'suspended') a.ctx.resume();
}

function tone(a, freq, dur, type, vol, delay, slideTo) {
  if (!a.ctx || a.muted) return;
  const t0 = a.ctx.currentTime + (delay || 0);
  const o = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(a.master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export function sfxPickup(a) {
  tone(a, 880, 0.12, 'sine', 0.25);
  tone(a, 1318, 0.18, 'sine', 0.22, 0.07);
}
export function sfxStep(a) {
  tone(a, 140, 0.05, 'triangle', 0.05);
}
export function sfxTick(a) {
  tone(a, 1200, 0.04, 'square', 0.07);
}
export function sfxUnlock(a) {
  tone(a, 520, 0.1, 'square', 0.14);
  tone(a, 780, 0.12, 'square', 0.14, 0.09);
  tone(a, 1040, 0.16, 'square', 0.14, 0.18);
}
export function sfxSpotted(a) {
  tone(a, 220, 0.5, 'sawtooth', 0.18, 0, 440);
}
export function sfxCaught(a) {
  tone(a, 330, 0.7, 'sawtooth', 0.22, 0, 110);
  tone(a, 165, 0.7, 'sawtooth', 0.18, 0.1, 55);
}
export function sfxWin(a) {
  [523, 659, 784, 1046].forEach((f, i) => tone(a, f, 0.22, 'sine', 0.22, i * 0.12));
}
export function sfxSmoke(a) {
  tone(a, 300, 0.4, 'sine', 0.1, 0, 90);
}
export function sfxEmp(a) {
  tone(a, 900, 0.25, 'square', 0.1, 0, 120);
}
export function sfxAlarm(a) {
  tone(a, 660, 0.14, 'square', 0.08);
  tone(a, 520, 0.14, 'square', 0.08, 0.16);
}
export function sfxDoor(a) {
  tone(a, 180, 0.25, 'triangle', 0.15, 0, 320);
}
