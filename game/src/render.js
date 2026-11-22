// Everything the player sees: the museum floor, vision cones, cameras,
// guards, Rook, loot, the HUD with its alarm meter, and the title / caught /
// win / pause screens. All art is drawn in canvas code — no images.

import { VIEW_W, VIEW_H, CONE_RANGE, CAM_RANGE } from './config.js';
import { WALLS, PILLARS, DOOR_A, DOOR_B, EXIT_DOOR, SAFE, ROOMS } from './rooms.js';

const GOLD = '#ffd76a';
const INK = '#14101d';

function cone(ctx, x, y, angle, range, half, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Marble checker.
  for (let y = 72; y < 844; y += 40) {
    for (let x = 8; x < 1264; x += 40) {
      const odd = ((x - 8) / 40 + (y - 72) / 40) % 2 === 0;
      ctx.fillStyle = odd ? '#262033' : '#2d2740';
      ctx.fillRect(x, y, 40, 40);
    }
  }
  // Red carpet runner down the middle of the museum.
  ctx.fillStyle = '#7a1f2b';
  ctx.fillRect(8, 420, 1256, 40);
  ctx.fillStyle = '#a87c2a';
  ctx.fillRect(8, 420, 1256, 3);
  ctx.fillRect(8, 457, 1256, 3);
  // Room names stencilled on the floor.
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,215,106,0.16)';
  ctx.fillText('MARBLE LOBBY', 223, 130);
  ctx.fillText('PORTRAIT GALLERY', 645, 130);
  ctx.fillText('VAULT CHAMBER', 1066, 130);
  // Framed paintings along the top wall.
  const paintings = [60, 180, 300, 500, 620, 740, 940, 1060, 1180];
  for (const px of paintings) {
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(px, 78, 52, 34);
    ctx.fillStyle = ['#3f6b4f', '#7a4a3f', '#4f5a7a', '#6b4f7a'][(px / 60) % 4 | 0];
    ctx.fillRect(px + 4, 82, 44, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(px + 4, 82, 44, 6);
  }
}

function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = '#4a3f5e';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#c9a227';
    if (w.h <= 8) ctx.fillRect(w.x, w.y + w.h - 2, w.w, 2);
    else ctx.fillRect(w.x + w.w - 2, w.y, 2, w.h);
  }
  for (const p of PILLARS) {
    ctx.fillStyle = '#6b5a8a';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(p.x, p.y, p.w, 3);
    ctx.fillRect(p.x, p.y + p.h - 3, p.w, 3);
  }
}

function drawDoor(ctx, door, open, label, lockedLabel) {
  const cx = door.x + door.w / 2;
  const cy = door.y + door.h / 2;
  if (open) {
    ctx.fillStyle = '#1f7a3d';
    ctx.fillRect(door.x - 2, door.y, door.w + 4, door.h);
    ctx.fillStyle = '#a7f3c0';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OPEN', cx, cy - 52);
  } else {
    ctx.fillStyle = '#8a2430';
    ctx.fillRect(door.x - 2, door.y, door.w + 4, door.h);
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2c14';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
    ctx.fillStyle = '#ffb3ba';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(lockedLabel, cx, cy - 52);
  }
  ctx.fillStyle = 'rgba(255,215,106,0.8)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, cy + 68);
}

function drawDoors(ctx, world) {
  drawDoor(ctx, DOOR_A, !world.doors.A.locked, 'GALLERY DOOR', 'LOCKED');
  drawDoor(ctx, DOOR_B, world.doors.B.picked, 'VAULT DOOR', world.doors.B.pickable ? 'PICK ME (E)' : 'LOCKED');
  drawDoor(ctx, EXIT_DOOR, !world.doors.exit.locked, 'GETAWAY', 'LOCKED');
}

function drawSafe(ctx, world) {
  const s = SAFE;
  ctx.fillStyle = '#3c4450';
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = '#5a6675';
  ctx.fillRect(s.x + 4, s.y + 4, s.w - 8, s.h - 8);
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(s.x + 32, s.y + 32, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(s.x + 32, s.y + 32, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s.x + 32, s.y + 32);
  ctx.lineTo(s.x + 32 + 11, s.y + 32 - 8);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,215,106,0.9)';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.safe.cracked ? 'SAFE OPEN' : 'SAFE — HOLD E', s.x + 32, s.y + s.h + 14);
  if (world.safe.cracked) {
    ctx.fillStyle = 'rgba(255,180,60,0.35)';
    ctx.beginPath();
    ctx.arc(s.x + 32, s.y + 32, 30 + Math.sin(world.time * 4) * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLootIcon(ctx, item, world) {
  const pulse = 1 + Math.sin(world.time * 3 + item.x) * 0.08;
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.scale(pulse, pulse);
  // Glow so loot reads at a glance.
  ctx.fillStyle = 'rgba(255,200,80,0.28)';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.strokeStyle = '#8a6d1f';
  ctx.lineWidth = 1.5;
  if (item.kind === 'vase') {
    ctx.beginPath();
    ctx.ellipse(0, 4, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-3, -12, 6, 8);
  } else if (item.kind === 'coins') {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-6 + i * 6, 6 - i * 3, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (item.kind === 'painting') {
    ctx.fillRect(-11, -9, 22, 18);
    ctx.strokeRect(-11, -9, 22, 18);
    ctx.fillStyle = '#3f6b4f';
    ctx.fillRect(-8, -6, 16, 12);
  } else if (item.kind === 'idol') {
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(9, 8);
    ctx.lineTo(-9, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -13, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'gem') {
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fillStyle = '#ff5a7a';
    ctx.fill();
    ctx.stroke();
  } else if (item.kind === 'opal') {
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(13, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(-13, 0);
    ctx.closePath();
    ctx.fillStyle = '#ffb347';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(-4, -5, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,215,106,0.95)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(item.name, item.x, item.y + 34);
}

function drawLoot(ctx, world) {
  for (const item of world.loot) {
    if (item.taken || item.inSafe) continue;
    drawLootIcon(ctx, item, world);
  }
}

function drawSmoke(ctx, world) {
  for (const c of world.smoke) {
    const grad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.r);
    grad.addColorStop(0, 'rgba(200,200,210,0.55)');
    grad.addColorStop(1, 'rgba(200,200,210,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCameras(ctx, world) {
  for (const cam of world.cameras) {
    const dark = cam.offTimer > 0;
    const fill = dark ? 'rgba(120,120,130,0.10)' : cam.spotted ? 'rgba(255,60,200,0.38)' : 'rgba(255,60,200,0.16)';
    const edge = dark ? 'rgba(120,120,130,0.4)' : 'rgba(255,60,200,0.55)';
    if (!dark) cone(ctx, cam.x, cam.y, cam.angle, CAM_RANGE, 0.5, fill, edge);
    // Wall mount + lens.
    ctx.fillStyle = dark ? '#555' : '#e0e0e8';
    ctx.fillRect(cam.x - 7, cam.y - 7, 14, 14);
    ctx.fillStyle = dark ? '#222' : cam.spotted ? '#ff3c8c' : '#c2185b';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (dark) {
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cam.x - 9, cam.y - 9);
      ctx.lineTo(cam.x + 9, cam.y + 9);
      ctx.moveTo(cam.x + 9, cam.y - 9);
      ctx.lineTo(cam.x - 9, cam.y + 9);
      ctx.stroke();
    }
  }
}

function drawGuards(ctx, world) {
  for (const g of world.guards) {
    const hot = g.state === 'chase';
    const fill = hot
      ? 'rgba(255,60,60,0.30)'
      : g.suspicion > 50
        ? 'rgba(255,140,40,0.22)'
        : 'rgba(255,210,90,0.18)';
    const edge = hot ? 'rgba(255,60,60,0.7)' : 'rgba(255,210,90,0.5)';
    cone(ctx, g.x, g.y, g.angle, CONE_RANGE, 0.62, fill, edge);
  }
  for (const g of world.guards) {
    // Body: navy suit, cap, facing tick.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(g.x + 3, g.y + 5, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e4a7a';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d2f52';
    ctx.beginPath();
    ctx.arc(g.x, g.y - 2, 8, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 19, g.y + Math.sin(g.angle) * 19);
    ctx.stroke();
    // Suspicion bar above the head.
    if (g.suspicion > 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(g.x - 16, g.y - 28, 32, 6);
      ctx.fillStyle = g.suspicion >= 100 ? '#ff4d4d' : g.suspicion > 50 ? '#ff9a2a' : '#ffd75e';
      ctx.fillRect(g.x - 16, g.y - 28, 32 * (g.suspicion / 100), 6);
    }
    if (g.state === 'chase') {
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 34);
    }
  }
}

function drawThief(ctx, world) {
  const t = world.thief;
  ctx.save();
  if (t.sneaking) ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(t.x + 3, t.y + 5, 14, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Amber cloak + hood, ringed in gold so Rook pops out of the cones.
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff2c0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3a2c14';
  ctx.beginPath();
  ctx.arc(t.x, t.y - 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(t.x + Math.cos(t.dir) * 4, t.y - 2 + Math.sin(t.dir) * 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // "ROOK" tag under the thief, clear of the hold-E progress text above.
  ctx.fillStyle = 'rgba(255,215,106,0.95)';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ROOK', t.x, t.y + 32);
  // Hold-E progress ring.
  if (t.interactTarget && t.interact > 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, -Math.PI / 2, -Math.PI / 2 + t.interact * Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.interactTarget === 'doorB' ? 'PICKING…' : 'CRACKING…', t.x, t.y - 30);
  }
}

function alarmColor(v) {
  if (v >= 75) return '#ff4d4d';
  if (v >= 40) return '#ffb020';
  return '#57d977';
}

function drawHud(ctx, world) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(0, 62, VIEW_W, 2);

  const room = ROOMS[world.room];
  ctx.textAlign = 'left';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(room.name.toUpperCase(), 16, 26);
  ctx.fillStyle = '#b8aed0';
  ctx.font = '13px sans-serif';
  ctx.fillText(room.tip, 16, 48);

  // Alarm meter, centre.
  const bx = 470;
  const by = 18;
  ctx.fillStyle = '#b8aed0';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', bx, by + 13);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(bx + 62, by, 300, 18);
  ctx.fillStyle = alarmColor(world.alarm.value);
  ctx.fillRect(bx + 62, by, 300 * (world.alarm.value / 100), 18);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 62, by, 300, 18);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(String(Math.round(world.alarm.value)), bx + 370, by + 14);
  if (world.alarm.lockdown > 0) {
    ctx.fillStyle = Math.sin(world.time * 10) > 0 ? '#ff4d4d' : '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOCKDOWN!', bx + 212, by + 38);
  }

  // Loot + tools, right.
  const taken = world.loot.filter((i) => i.taken).length;
  ctx.textAlign = 'right';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`LOOT ${taken}/${world.loot.length}`, 1264, 26);
  ctx.fillStyle = '#b8aed0';
  ctx.font = '13px sans-serif';
  const smoke = `SMOKE x${world.thief.smoke} [Q]`;
  const emp = `EMP x${world.thief.emp} [F]`;
  ctx.fillText(`${smoke}   ${emp}`, 1264, 48);

  // Room loot tally under the meter.
  const roomLoot = world.loot.filter((i) => i.room === world.room);
  const roomTaken = roomLoot.filter((i) => i.taken).length;
  ctx.fillStyle = '#b8aed0';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Room loot ${roomTaken}/${roomLoot.length}`, bx + 212, by + 38);

  // Spotted banner.
  if (world.guards.some((g) => g.state === 'chase')) {
    ctx.fillStyle = 'rgba(255,40,40,0.9)';
    ctx.fillRect(440, 72, 400, 26);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED — break line of sight!', 640, 90);
  }

  // Toast message.
  if (world.messageTimer > 0) {
    ctx.fillStyle = 'rgba(20,16,29,0.85)';
    const w = ctx.measureText(world.message).width + 28;
    ctx.fillRect(640 - w / 2, 104, w, 26);
    ctx.strokeStyle = GOLD;
    ctx.strokeRect(640 - w / 2, 104, w, 26);
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.message, 640, 122);
  }

  // Controls hint along the bottom.
  if (world.screen === 'playing') {
    ctx.fillStyle = 'rgba(184,174,208,0.75)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WASD / arrows move · click to walk · Shift sneak · Space run · E hold to interact · Q smoke · F EMP · P pause · M mute', 640, 838);
  }
}

function drawPanel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10,8,16,0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = INK;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  const pw = 640;
  const ph = 120 + lines.length * 30;
  ctx.fillRect(640 - pw / 2, 430 - ph / 2, pw, ph);
  ctx.strokeRect(640 - pw / 2, 430 - ph / 2, pw, ph);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 640, 430 - ph / 2 + 66);
  ctx.fillStyle = '#e8e2f2';
  ctx.font = '17px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, 640, 430 - ph / 2 + 116 + i * 30);
  });
}

function drawOverlays(ctx, world) {
  if (world.screen === 'title') {
    drawPanel(ctx, 'THE AMBER MUSEUM', [
      "Rook's Last Job — steal the Sun Opal and walk out clean.",
      'Dodge guard cones and camera sweeps. Loot each room to open its door.',
      'Hold E to pick the Vault Door and crack the safe. Q smoke, F EMP.',
      'GHOST if nobody ever spots you. LOUD if the alarm hits 100.',
      '',
      'Press ENTER or click to begin',
    ], GOLD);
    return;
  }
  if (world.screen === 'paused') {
    drawPanel(ctx, 'PAUSED', ['Press P to keep sneaking.'], GOLD);
    return;
  }
  if (world.screen === 'caught') {
    drawPanel(ctx, 'CAUGHT!', [
      `The guards dragged Rook out of the ${ROOMS[world.room].name}.`,
      `Loot pocketed: ${world.stats.lootTaken} · Times spotted: ${world.stats.seen}`,
      '',
      'Press R to try again',
    ], '#ff4d4d');
    return;
  }
  if (world.screen === 'win') {
    const color = world.rating === 'GHOST' ? '#57d977' : world.rating === 'SHADOW' ? GOLD : '#ff9a2a';
    drawPanel(ctx, 'CLEAN GETAWAY', [
      `Rating: ${world.rating} — the Sun Opal is yours.`,
      `Time: ${world.stats.time.toFixed(1)}s · Loot ${world.stats.lootTaken}/${world.loot.length} · Spotted ${world.stats.seen}x · Lockdowns ${world.alarm.lockdowns}`,
      '',
      'Press R to run it again',
    ], color);
  }
}

export function drawWorld(ctx, world) {
  drawFloor(ctx);
  drawLoot(ctx, world);
  drawSafe(ctx, world);
  drawDoors(ctx, world);
  drawWalls(ctx);
  drawSmoke(ctx, world);
  drawCameras(ctx, world);
  drawGuards(ctx, world);
  drawThief(ctx, world);
  drawHud(ctx, world);
  drawOverlays(ctx, world);
}
