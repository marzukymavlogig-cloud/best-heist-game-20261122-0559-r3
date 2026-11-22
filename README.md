# The Amber Museum — Rook's Last Job

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/marzukymavlogig-cloud/best-heist-game-20261122-0559-r3/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/marzukymavlogig-cloud/best-heist-game-20261122-0559-r3/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559). Rook breaks into the Amber Museum to steal the Sun Opal: three rooms (Marble Lobby, Portrait Gallery, Vault Chamber), guards with vision cones and suspicion, sweeping cameras, an alarm meter with lockdown, loot that weighs you down, smoke and an EMP, a lockpick door and a safe to crack — and a getaway that only opens when the room is fully looted. GHOST if nobody ever spots you.

## Play

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: plain static files under `game/`, all art drawn in canvas code, all sound synthesized with WebAudio.

## Controls

| Key | Action |
| --- | --- |
| WASD / arrows | Move (or click to walk) |
| Shift | Sneak — slower, harder to spot |
| Space | Run — faster, easier to spot |
| E (hold) | Pick the Vault Door lock / crack the safe |
| Q | Smoke bomb ×2 — guards and cameras can't see through it |
| F | EMP ×1 — cameras dark 8s, alarm +10 |
| P | Pause · M mute · R restart after caught / win |

## Structure

- `game/index.html` — canvas + module entry
- `game/src/main.js` — bootstrap, loop, state machine (title/playing/paused/caught/win)
- `game/src/rooms.js` — the museum: walls, doors, safe, loot, patrols, cameras
- `game/src/guards.js` — patrol, vision cone, suspicion, chase
- `game/src/cameras.js` — sweeping magenta cones, EMP blackout
- `game/src/thief.js` — movement, loot weight, tools, hold-E interactions
- `game/src/alarm.js` — alarm meter and lockdown
- `game/src/sight.js` — line of sight, cones, smoke, collision geometry
- `game/src/render.js` — all canvas drawing + HUD + screens
- `game/src/audio.js` — WebAudio synth effects
- `game/src/input.js` — keyboard + click-to-move
- `game/src/shots.js` — deterministic scene presets for screenshots (`?scene=`)
- `main.ts` — hands the entry in (copies `game/` + `screenshots/`, writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
