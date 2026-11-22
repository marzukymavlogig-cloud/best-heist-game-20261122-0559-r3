// Deterministic scene presets for screenshots (?scene=lobby|gallery|vault|win).
// Each one arranges the live game — thief, guards, cones, cameras, loot and
// the alarm meter — into a frame that shows the heist at its best, then the
// normal loop keeps running from there. Nothing here is a mock render.

export function applyScene(world, name) {
  world.screen = 'playing';
  world.messageTimer = 3;
  if (name === 'lobby') {
    world.time = 3.2;
    world.thief.x = 300;
    world.thief.y = 520;
    world.thief.dir = 0;
    world.guards[0].x = 200;
    world.guards[0].y = 470;
    world.guards[0].angle = 0;
    world.guards[0].suspicion = 45;
    world.guards[1].x = 300;
    world.guards[1].y = 180;
    world.guards[1].angle = 1.9;
    world.guards[1].suspicion = 0;
    world.loot[0].taken = true; // Marble Vase pocketed: 1/3
    world.thief.loot = 1;
    world.stats.lootTaken = 1;
    world.alarm.value = 18;
    world.message = 'Marble Vase pocketed — 1/3';
  } else if (name === 'gallery') {
    world.time = 1.0;
    world.thief.x = 800;
    world.thief.y = 440;
    world.thief.dir = 0;
    world.thief.interactTarget = 'doorB';
    world.thief.interact = 0.6;
    world.guards[2].x = 700;
    world.guards[2].y = 500;
    world.guards[2].angle = 0.6;
    world.guards[2].suspicion = 62;
    world.guards[3].x = 600;
    world.guards[3].y = 300;
    world.guards[3].angle = 0.5;
    world.guards[3].suspicion = 0;
    world.guards[4].x = 700;
    world.guards[4].y = 460;
    world.guards[4].angle = 0;
    world.guards[4].suspicion = 30;
    world.loot[3].taken = true; // Jade Idol
    world.loot[4].taken = true; // Duchess Portrait
    world.loot[5].taken = true; // Porcelain Vase
    world.loot[6].taken = true; // Coin Hoard — 4/4, so the door is pickable
    world.doors.B.pickable = true;
    world.thief.loot = 4;
    world.stats.lootTaken = 4;
    world.alarm.value = 34;
    world.message = 'Hold E — picking the Vault Door lock…';
  } else if (name === 'vault') {
    world.time = 2.0;
    world.thief.x = 990;
    world.thief.y = 470;
    world.thief.dir = 0.4;
    world.thief.interactTarget = 'safe';
    world.thief.interact = 0.7;
    world.guards[5].x = 950;
    world.guards[5].y = 350;
    world.guards[5].angle = 1.2;
    world.guards[5].suspicion = 88;
    world.guards[6].x = 1150;
    world.guards[6].y = 300;
    world.guards[6].angle = 2.6;
    world.guards[6].suspicion = 0;
    world.guards[7].x = 1100;
    world.guards[7].y = 460;
    world.guards[7].angle = Math.PI;
    world.guards[7].suspicion = 20;
    world.guards[8].x = 1150;
    world.guards[8].y = 620;
    world.guards[8].angle = -1.5;
    world.guards[8].suspicion = 0;
    world.cameras[3].offTimer = 4; // EMP blackout on one vault camera
    world.smoke.push({ x: 1150, y: 520, r: 95, ttl: 5 });
    world.thief.smoke = 1;
    world.loot[7].taken = true; // Star Ruby
    world.thief.loot = 1;
    world.stats.lootTaken = 1;
    world.alarm.value = 47;
    world.message = 'Hold E — cracking the Amber Safe…';
  } else if (name === 'win') {
    world.time = 214.3;
    world.stats.time = 214.3;
    world.stats.lootTaken = 10;
    world.stats.seen = 0;
    for (const item of world.loot) item.taken = true;
    world.thief.loot = 10;
    world.thief.x = 1252;
    world.thief.y = 440;
    world.thief.dir = 0;
    world.room = 2; // HUD names the Vault Chamber on the win screen
    world.doors.A.locked = false;
    world.doors.B.picked = true;
    world.doors.B.pickable = true;
    world.doors.exit.locked = false;
    world.safe.cracked = true;
    world.alarm.value = 12;
    world.rating = 'GHOST';
    world.screen = 'win';
  }
}
