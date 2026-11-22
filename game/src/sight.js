// Sight and collision geometry: line of sight, vision cones, smoke blocking
// and circle-vs-rect movement. Pure functions, no game state of their own.

// Liang-Barsky clipping: does the segment (x1,y1)-(x2,y2) touch rect r?
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

// True when no blocker rect stands between the two points.
export function losClear(x1, y1, x2, y2, blockers) {
  for (const r of blockers) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return false;
  }
  return true;
}

export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

// Shortest signed difference between two angles, in (-PI, PI].
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

// Is (tx,ty) inside the cone from (sx,sy) facing `angle`?
export function inCone(sx, sy, angle, range, half, tx, ty) {
  const dx = tx - sx;
  const dy = ty - sy;
  const d2 = dx * dx + dy * dy;
  if (d2 > range * range) return false;
  if (d2 < 1) return true;
  return Math.abs(angleDiff(Math.atan2(dy, dx), angle)) <= half;
}

// Does the segment pass within r of the circle centre?
export function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + dx * t - cx;
  const py = y1 + dy * t - cy;
  return px * px + py * py <= r * r;
}

// Smoke hides the thief: inside a cloud, or the sight line crossing one.
export function hiddenBySmoke(x1, y1, x2, y2, smoke) {
  for (const c of smoke) {
    const d2 = (x2 - c.x) * (x2 - c.x) + (y2 - c.y) * (y2 - c.y);
    if (d2 <= c.r * c.r) return true;
    if (segmentHitsCircle(x1, y1, x2, y2, c.x, c.y, c.r)) return true;
  }
  return false;
}

export function circleHitsRect(x, y, r, rect) {
  const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < r * r;
}

export function circleHitsRects(x, y, r, rects) {
  for (const rect of rects) {
    if (circleHitsRect(x, y, r, rect)) return true;
  }
  return false;
}

// Move a circle axis by axis so it slides along walls instead of sticking.
export function moveCircle(p, dx, dy, r, rects) {
  const nx = p.x + dx;
  if (!circleHitsRects(nx, p.y, r, rects)) p.x = nx;
  const ny = p.y + dy;
  if (!circleHitsRects(p.x, ny, r, rects)) p.y = ny;
}
