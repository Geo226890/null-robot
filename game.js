const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const hud = document.querySelector('#hud');
const startScreen = document.querySelector('#start-screen');
const upgradeScreen = document.querySelector('#upgrade-screen');
const gameOverScreen = document.querySelector('#game-over-screen');
const upgradeCards = document.querySelector('#upgrade-cards');
const toast = document.querySelector('#toast');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TAU = Math.PI * 2;
const keys = new Set();
const upgrades = [
  { id: 'tesla', name: 'Tesla Lattice', icon: 'ϟ', category: 'CHAIN', description: 'Shots arc through nearby enemies, chaining damage.', max: 3, signature: true },
  { id: 'fission', name: 'Fission Cascade', icon: '☼', category: 'BLAST', description: 'Destroyed enemies detonate and damage nearby hostiles.', max: 3, signature: true },
  { id: 'cryo', name: 'Cryostasis Rounds', icon: '❄', category: 'CONTROL', description: 'Shots freeze targets in place, buying room to maneuver.', max: 3, signature: true },
  { id: 'echo', name: 'Phase Echo', icon: '◈', category: 'DECOY', description: 'Phase Shift leaves a decoy that lures enemies before exploding.', max: 1, signature: true },
  { id: 'blades', name: 'Razor Satellites', icon: '✳', category: 'ORBITAL', description: 'Deploy spinning blades that shred enemies at close range.', max: 3, signature: true },
  { id: 'pulse', name: 'Graviton Pulse', icon: '◎', category: 'FIELD', description: 'Periodic gravity waves pull enemies together around you.', max: 3, signature: true },
  { id: 'dynamo', name: 'Kinetic Dynamo', icon: '⟳', category: 'MOMENTUM', description: 'Keep moving to charge a shockwave that blasts enemies away.', max: 3, signature: true },
  { id: 'rail', name: 'Relativistic Rail', icon: '⇢', category: 'PENETRATE', description: 'Every fourth shot becomes a piercing rail round.', max: 1, signature: true },
  { id: 'salvage', name: 'Salvage Symbiosis', icon: '⁙', category: 'SCAVENGE', description: 'Collecting neural data repairs you and shocks nearby enemies.', max: 1, signature: true },
  { id: 'superconductor', name: 'Superconductor', icon: '⌁', category: 'COMBO', description: 'Cryo-frozen targets carry Tesla arcs farther; every arc freezes its next target.', max: 1, requires: ['tesla', 'cryo'] },
  { id: 'thermalshock', name: 'Thermal Shock', icon: '❋', category: 'COMBO', description: 'Killing a frozen target triggers a larger Fission blast that freezes survivors.', max: 1, requires: ['fission', 'cryo'] },
  { id: 'echochamber', name: 'Echo Chamber', icon: '◉', category: 'COMBO', description: 'Phase Echo blasts knock enemies away and instantly charge your next Dynamo shockwave.', max: 1, requires: ['echo', 'dynamo'] },
  { id: 'eventhorizon', name: 'Event Horizon', icon: '⦿', category: 'COMBO', description: 'Graviton Pulse links gathered enemies into a Tesla circuit that arcs through the cluster.', max: 1, requires: ['pulse', 'tesla'] },
  { id: 'brittle', name: 'Brittle Matter', icon: '❅', category: 'COMBO', description: 'Rail rounds shatter frozen targets, damaging and freezing nearby enemies.', max: 1, requires: ['rail', 'cryo'] },
  { id: 'flywheel', name: 'Flywheel Gyro', icon: '⍟', category: 'COMBO', description: 'Dynamo shockwaves launch your Razor Satellites outward in a damaging blade sweep.', max: 1, requires: ['dynamo', 'blades'] },
  { id: 'beacon', name: 'Kepler Beacon', icon: '⌖', category: 'TARGET', description: 'Periodically mark a hostile; marked targets take extra damage and leave a larger Fission blast.', max: 1, signature: true, synergy: ['tesla', 'fission'] },
  { id: 'capacitor', name: 'Capacitor Bloom', icon: '✺', category: 'CHARGE', description: 'Shots charge a blast that knocks back nearby enemies. Rail rounds and Tesla chains charge it faster.', max: 1, signature: true, synergy: ['rail', 'tesla'] },
  { id: 'phasebattery', name: 'Phase Battery', icon: '◇', category: 'MOBILITY', description: 'Phase Shift erupts at your landing point. Dynamo primes a shockwave; Echo adds a second blast at takeoff.', max: 1, signature: true, synergy: ['dynamo', 'echo'] },
  { id: 'tidal', name: 'Tidal Collector', icon: '∿', category: 'SCAVENGE', description: 'Neural data is pulled in from farther away; each pickup draws nearby enemies toward you.', max: 1, signature: true, synergy: ['pulse', 'salvage'] },
  { id: 'quantum', name: 'Quantum Tunneling', icon: '⤳', category: 'MOBILITY', description: 'Phase Shift recovers faster, letting you cross danger more often.', max: 3 },
  { id: 'overclock', name: 'Overclock Servo', icon: '⟳', category: 'FIRE RATE', description: 'Fire more rapidly. Tesla and Rail protocols accelerate into even faster attack cycles.', max: 3, signature: true, synergy: ['tesla', 'rail'] },
  { id: 'deadeye', name: 'Deadeye Array', icon: '⌾', category: 'TARGET', description: 'Acquire targets at longer range and increase weapon damage. Beacon marks and Rail rounds reward precision.', max: 3, signature: true, synergy: ['beacon', 'rail'] },
  { id: 'repulsor', name: 'Repulsor Core', icon: '◎', category: 'DEFENSE', description: 'Periodically blast nearby hostiles back. Graviton Pulse and Kinetic Dynamo recharge the core faster.', max: 2, signature: true, synergy: ['pulse', 'dynamo'] },
  { id: 'overload', name: 'Overload Circuit', icon: 'ϟ', category: 'COMBO', description: 'Overclocked Tesla chains leap to one additional target and deal increased arc damage.', max: 1, requires: ['overclock', 'tesla'] },
  { id: 'phaselance', name: 'Phase Lance', icon: '⇢', category: 'COMBO', description: 'Quantum Tunneling and Rail rounds turn each Phase Shift into a piercing blast at your landing point.', max: 1, requires: ['quantum', 'rail'] },
  { id: 'vector', name: 'Vector Thrusters', icon: '➤', category: 'MOBILITY', description: 'Increase movement speed so you can reposition and evade more quickly.', max: 3, signature: true },
  { id: 'fluxmagazine', name: 'Flux Magazine', icon: '▤', category: 'FIRE RATE', description: 'Reduce the time between auto-targeted shots.', max: 3, signature: true },
  { id: 'magnetar', name: 'Magnetar Core', icon: '⊛', category: 'SCAVENGE', description: 'Collect neural data from farther away. Pairs with Graviton Pulse to strengthen its reach.', max: 3, signature: true, synergy: ['pulse'] },
  { id: 'ricochet', name: 'Ricochet Matrix', icon: '⤿', category: 'PENETRATE', description: 'Shots pass through additional enemies. Tesla arcs amplify this with a longer chain.', max: 3, signature: true, synergy: ['tesla'] },
  { id: 'salvageburst', name: 'Salvage Burst', icon: '✴', category: 'SCAVENGE', description: 'Neural data pickups release a damaging pulse. Salvage Symbiosis and Tidal Collector boost its payoff.', max: 1, signature: true, synergy: ['salvage', 'tidal'] },
  { id: 'bulwark', name: 'Bulwark Protocol', icon: '⬢', category: 'DEFENSE', description: 'Reduce incoming damage. Isotope Plating and Entropy Reversal reinforce the damage buffer.', max: 3, signature: true, synergy: ['isotope', 'entropy'] },
  { id: 'singularity', name: 'Singularity Core', icon: '⦿', category: 'COMBO', description: 'Magnetar Core expands Graviton Pulse and pulls enemies inward more forcefully.', max: 1, requires: ['magnetar', 'pulse'] },
  { id: 'prism', name: 'Prism Cascade', icon: '✧', category: 'COMBO', description: 'Ricochet rounds feed Tesla arcs, adding another jump and extending their reach.', max: 1, requires: ['ricochet', 'tesla'] },
  { id: 'entropy', name: 'Entropy Reversal', icon: '⟳', category: 'REPAIR', description: 'Gradually rebuild integrity while you survive.', max: 3 },
  { id: 'isotope', name: 'Isotope Plating', icon: '⬡', category: 'ARMOR', description: 'Increase maximum integrity and repair damaged plating.', max: 3 },
  { id: 'nanobots', name: 'Nanobot Swarm', icon: '⁙', category: 'REPAIR', description: 'Restore integrity whenever you evolve.', max: 1 }
];
const state = {
  running: false, paused: false, over: false, time: 0, kills: 0, level: 1, xp: 0, nextXp: 5,
  player: null, enemies: [], bullets: [], enemyShots: [], orbs: [], particles: [], arcs: [], rings: [], upgradeLevels: {},
  spawnTimer: 0, shotTimer: 0, phaseCooldown: 0, phaseTime: 0, regenTimer: 0,
  cameraShake: 0, lastFrame: 0, sound: false, toastTimer: 0, shotsFired: 0,
  bladeAngle: 0, pulseTimer: 0, pulseTime: 0, pulseCount: 0, dynamoCharge: 0, echo: null,
  beaconTimer: 0, beaconLastTarget: null, capacitorCharge: 0, repulsorTimer: 0
};

function resetGame() {
  state.running = true;
  state.paused = false;
  state.over = false;
  state.time = 0;
  state.kills = 0;
  state.level = 1;
  state.xp = 0;
  state.nextXp = 5;
  state.enemies = [];
  state.bullets = [];
  state.enemyShots = [];
  state.orbs = [];
  state.particles = [];
  state.arcs = [];
  state.rings = [];
  state.upgradeLevels = {};
  state.spawnTimer = .5;
  state.shotTimer = 0;
  state.phaseCooldown = 0;
  state.phaseTime = 0;
  state.regenTimer = 0;
  state.cameraShake = 0;
  state.shotsFired = 0;
  state.bladeAngle = 0;
  state.pulseTimer = 0;
  state.pulseTime = 0;
  state.pulseCount = 0;
  state.dynamoCharge = 0;
  state.echo = null;
  state.beaconTimer = 0;
  state.beaconLastTarget = null;
  state.capacitorCharge = 0;
  state.repulsorTimer = 0;
  state.player = { x: WIDTH / 2, y: HEIGHT / 2, radius: 13, hp: 100, maxHp: 100, speed: 190, damage: 18, fireRate: .52, range: 390, pickup: 70, invulnerable: 0, facing: 0 };
  startScreen.hidden = true;
  upgradeScreen.hidden = true;
  gameOverScreen.hidden = true;
  hud.hidden = false;
  updateLoadout();
  updateHud();
  state.lastFrame = performance.now();
  requestAnimationFrame(gameLoop);
}

function incomingDamage(damage) {
  return damage * Math.max(.55, 1 - (state.upgradeLevels.bulwark || 0) * .12);
}

function gameLoop(now) {
  if (!state.running) return;
  const dt = Math.min((now - state.lastFrame) / 1000, .04);
  state.lastFrame = now;
  if (!state.paused && !state.over) update(dt);
  draw();
  if (state.running) requestAnimationFrame(gameLoop);
}

function update(dt) {
  state.time += dt;
  const player = state.player;
  let dx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  let dy = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
  const magnitude = Math.hypot(dx, dy) || 1;
  dx /= magnitude;
  dy /= magnitude;
  const moving = magnitude > 0 && (keys.has('d') || keys.has('arrowright') || keys.has('a') || keys.has('arrowleft') || keys.has('s') || keys.has('arrowdown') || keys.has('w') || keys.has('arrowup'));
  if (dx || dy) player.facing = Math.atan2(dy, dx);
  player.x = clamp(player.x + dx * player.speed * dt, player.radius + 12, WIDTH - player.radius - 12);
  player.y = clamp(player.y + dy * player.speed * dt, player.radius + 12, HEIGHT - player.radius - 12);

  state.phaseCooldown = Math.max(0, state.phaseCooldown - dt);
  state.phaseTime = Math.max(0, state.phaseTime - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  updateBeacon(dt);
  updateBuildSystems(dt, moving);
  if (state.upgradeLevels.entropy && player.hp < player.maxHp) {
    state.regenTimer += dt;
    if (state.regenTimer >= 10) {
      state.regenTimer -= 10;
      player.hp = Math.min(player.maxHp, player.hp + state.upgradeLevels.entropy * 2);
    }
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnEnemy();
    state.spawnTimer = Math.max(.28, 1.1 - state.time * .008) * (Math.random() * .35 + .82);
  }

  const target = nearestEnemy();
  state.shotTimer -= dt;
  if (target && state.shotTimer <= 0) {
    fireAt(target);
    state.shotTimer = Math.max(.18, player.fireRate *
      Math.pow(.88, state.upgradeLevels.overclock || 0) *
      Math.pow(.9, state.upgradeLevels.fluxmagazine || 0));
  }

  updateBullets(dt);
  updateEnemies(dt);
  updateEnemyShots(dt);
  updateOrbs(dt);
  updateParticles(dt);
  state.cameraShake = Math.max(0, state.cameraShake - dt * 20);
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) toast.classList.remove('visible');
  }
  updateHud();
}

function updateBuildSystems(dt, moving) {
  const player = state.player;
  let echoPrimedDynamo = false;
  const bladeLevel = state.upgradeLevels.blades || 0;
  if (bladeLevel) {
    state.bladeAngle += dt * (1.8 + bladeLevel * .3);
    const bladeCount = 2 + bladeLevel;
    const orbitRadius = 38 + bladeLevel * 5;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (enemy.bladeHitCooldown > 0) continue;
      let hit = false;
      for (let blade = 0; blade < bladeCount; blade++) {
        const angle = state.bladeAngle + blade / bladeCount * TAU;
        const x = player.x + Math.cos(angle) * orbitRadius;
        const y = player.y + Math.sin(angle) * orbitRadius;
        if (Math.hypot(enemy.x - x, enemy.y - y) < enemy.radius + 7) {
          damageEnemy(enemy, 16 + bladeLevel * 8);
          enemy.bladeHitCooldown = .38;
          burst(x, y, '#f2d17a', 4);
          hit = true;
          break;
        }
      }
      if (hit && enemy.hp <= 0) defeatEnemy(state.enemies.indexOf(enemy));
    }
  }

  const pulseLevel = state.upgradeLevels.pulse || 0;
  if (pulseLevel) {
    const pulseRadius = 200 + (state.upgradeLevels.singularity ? 55 : 0);
    state.pulseTimer += dt;
    if (state.pulseTimer >= 8) {
      state.pulseTimer -= 8;
      state.pulseTime = .85;
      state.pulseCount++;
      emitRing(player.x, player.y, pulseRadius, '#9c8bff');
      if (state.upgradeLevels.eventhorizon) pulseCircuit();
      playTone(190, .2, .035, 'sine');
    }
    if (state.pulseTime > 0) {
      state.pulseTime = Math.max(0, state.pulseTime - dt);
      for (const enemy of [...state.enemies]) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance > pulseRadius) continue;
        if (enemy.pulseCount !== state.pulseCount) {
          enemy.pulseCount = state.pulseCount;
          if (pulseLevel > 1) {
            damageEnemy(enemy, 12 * (pulseLevel - 1));
            if (enemy.hp <= 0) {
              defeatEnemy(state.enemies.indexOf(enemy));
              continue;
            }
          }
        }
        const pullSpeed = 170 + (state.upgradeLevels.singularity ? 80 : 0);
        enemy.x += dx / distance * pullSpeed * dt;
        enemy.y += dy / distance * pullSpeed * dt;
      }
    }
  }

  if (state.echo) {
    state.echo.timer -= dt;
    if (state.echo.timer <= 0) {
      const { x, y } = state.echo;
      state.echo = null;
      const combo = state.upgradeLevels.echochamber > 0;
      const radius = combo ? 108 : 82;
      emitRing(x, y, radius, combo ? '#ffbd70' : '#a98bff');
      damageInRadius(x, y, radius, combo ? 62 : 44, combo ? 105 : 0);
      if (combo) {
        state.dynamoCharge = 1.65;
        echoPrimedDynamo = true;
      }
      burst(x, y, '#a98bff', 20);
    }
  }

  const dynamoLevel = state.upgradeLevels.dynamo || 0;
  if (dynamoLevel) {
    state.dynamoCharge = moving
      ? state.dynamoCharge + dt
      : echoPrimedDynamo
        ? state.dynamoCharge
        : Math.max(0, state.dynamoCharge - dt * 1.5);
    if (state.dynamoCharge >= 1.65) {
      state.dynamoCharge -= 1.65;
      const radius = 78 + dynamoLevel * 16;
      emitRing(player.x, player.y, radius, '#ffbd70');
      damageInRadius(player.x, player.y, radius, 20 + dynamoLevel * 12, 100);
      if (state.upgradeLevels.flywheel) flywheelSweep(dynamoLevel);
      playTone(125, .18, .045, 'triangle');
    }
  }

  const repulsorLevel = state.upgradeLevels.repulsor || 0;
  if (repulsorLevel) {
    const accelerated = state.upgradeLevels.pulse || state.upgradeLevels.dynamo;
    state.repulsorTimer += dt * (accelerated ? 1.35 : 1);
    if (state.repulsorTimer >= 8) {
      state.repulsorTimer -= 8;
      const radius = 100 + repulsorLevel * 18;
      emitRing(player.x, player.y, radius, '#83cfff');
      damageInRadius(player.x, player.y, radius, 18 + repulsorLevel * 8, 115);
      playTone(175, .16, .04, 'triangle');
    }
  }

  for (let i = state.arcs.length - 1; i >= 0; i--) {
    state.arcs[i].life -= dt;
    if (state.arcs[i].life <= 0) state.arcs.splice(i, 1);
  }
  for (let i = state.rings.length - 1; i >= 0; i--) {
    state.rings[i].life -= dt;
    if (state.rings[i].life <= 0) state.rings.splice(i, 1);
  }
}

function updateBeacon(dt) {
  if (!state.upgradeLevels.beacon) return;
  state.beaconTimer += dt;
  if (state.beaconTimer < 7.5) return;
  state.beaconTimer -= 7.5;
  for (const enemy of state.enemies) enemy.markTimer = 0;
  const candidates = state.enemies.filter(enemy => enemy !== state.beaconLastTarget);
  const pool = candidates.length ? candidates : state.enemies;
  const target = pool.reduce((nearest, enemy) =>
    Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) <
      (nearest ? Math.hypot(nearest.x - state.player.x, nearest.y - state.player.y) : state.player.range)
      ? enemy
      : nearest,
  null);
  if (!target) return;
  state.beaconLastTarget = target;
  target.markTimer = 8;
  emitRing(target.x, target.y, 30, '#ffdf75');
}

function damageEnemy(enemy, damage) {
  enemy.hp -= damage * (enemy.markTimer > 0 ? 1.4 : 1);
}

function addCapacitorCharge(amount) {
  if (!state.upgradeLevels.capacitor) return;
  state.capacitorCharge += amount;
  while (state.capacitorCharge >= 8) {
    state.capacitorCharge -= 8;
    const player = state.player;
    emitRing(player.x, player.y, 112, '#ffe27a');
    damageInRadius(player.x, player.y, 112, 30, 75);
    playTone(245, .12, .035, 'triangle');
  }
}

function chainLightning(source, damage) {
  const level = state.upgradeLevels.tesla;
  const conductor = state.upgradeLevels.superconductor || 0;
  const prism = state.upgradeLevels.prism || 0;
  const visited = new Set([source]);
  let origin = source;
  const overload = state.upgradeLevels.overload || 0;
  const chainCount = level + 1 + conductor + overload + prism;
  for (let chain = 0; chain < chainCount; chain++) {
    let target = null;
    let closest = Infinity;
    const range = 125 + level * 18 + conductor * 38 + prism * 35;
    for (const enemy of state.enemies) {
      if (visited.has(enemy)) continue;
      const distance = Math.hypot(enemy.x - origin.x, enemy.y - origin.y);
      if (distance <= range && (!target ||
        (enemy.markTimer > 0 && target.markTimer <= 0) ||
        (Boolean(enemy.markTimer > 0) === Boolean(target.markTimer > 0) && distance < closest))) {
        closest = distance;
        target = enemy;
      }
    }
    if (!target) break;
    visited.add(target);
    state.arcs.push({ x1: origin.x, y1: origin.y, x2: target.x, y2: target.y, life: .16 });
    const wasFrozen = target.slowTimer > 0;
    if (conductor) target.slowTimer = Math.max(target.slowTimer || 0, 1.6 + conductor * .5);
    damageEnemy(target, damage * (.38 + level * .1 + overload * .12 + prism * .1) * (wasFrozen && conductor ? 1.55 : 1));
    addCapacitorCharge(1);
    burst(target.x, target.y, '#81d8ff', 4);
    if (target.hp <= 0 && state.enemies.includes(target)) defeatEnemy(state.enemies.indexOf(target));
    origin = target;
  }
}

function pulseCircuit() {
  const center = state.player;
  const radius = 200 + (state.upgradeLevels.singularity ? 55 : 0);
  const cluster = state.enemies
    .filter(enemy => Math.hypot(enemy.x - center.x, enemy.y - center.y) <= radius)
    .sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));
  if (cluster.length < 2) return;
  const damage = 14 + (state.upgradeLevels.tesla || 0) * 7;
  for (let i = 0; i < cluster.length; i++) {
    const source = cluster[i];
    const target = cluster[(i + 1) % cluster.length];
    state.arcs.push({ x1: source.x, y1: source.y, x2: target.x, y2: target.y, life: .22 });
    damageEnemy(target, damage);
    burst(target.x, target.y, '#a98bff', 3);
    if (target.hp <= 0 && state.enemies.includes(target)) defeatEnemy(state.enemies.indexOf(target));
  }
}

function flywheelSweep(dynamoLevel) {
  const player = state.player;
  const radius = 132 + dynamoLevel * 12;
  emitRing(player.x, player.y, radius, '#f2d17a');
  for (const enemy of [...state.enemies]) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance > radius) continue;
    damageEnemy(enemy, 24 + (state.upgradeLevels.blades || 0) * 12);
    enemy.slowTimer = Math.max(enemy.slowTimer || 0, .65);
    state.arcs.push({ x1: player.x, y1: player.y, x2: enemy.x, y2: enemy.y, life: .14 });
    burst(enemy.x, enemy.y, '#f2d17a', 4);
    if (enemy.hp <= 0 && state.enemies.includes(enemy)) defeatEnemy(state.enemies.indexOf(enemy));
  }
}

function damageInRadius(x, y, radius, damage, knockback = 0) {
  for (const enemy of [...state.enemies]) {
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    const distance = Math.hypot(dx, dy);
    if (distance > radius) continue;
    damageEnemy(enemy, damage * (1 - distance / (radius * 2)));
    if (knockback && distance > 0) {
      enemy.x += dx / distance * knockback;
      enemy.y += dy / distance * knockback;
    }
    if (enemy.hp <= 0) defeatEnemy(state.enemies.indexOf(enemy));
  }
}

function emitRing(x, y, radius, color) {
  state.rings.push({ x, y, radius, color, life: .48, maxLife: .48 });
}

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4);
  const margin = 26;
  let x, y;
  if (edge === 0) { x = Math.random() * WIDTH; y = -margin; }
  else if (edge === 1) { x = WIDTH + margin; y = Math.random() * HEIGHT; }
  else if (edge === 2) { x = Math.random() * WIDTH; y = HEIGHT + margin; }
  else { x = -margin; y = Math.random() * HEIGHT; }
  const roll = Math.random();
  const tankChance = state.time > 18 ? Math.min(.08 + state.time / 260, .24) : 0;
  const runnerChance = state.time > 10 ? Math.min(.12 + state.time / 500, .22) : .08;
  const spitterChance = state.time > 24 ? Math.min(.1 + state.time / 700, .18) : 0;
  const splitterChance = state.time > 38 ? Math.min(.08 + state.time / 900, .14) : 0;
  let kind = 'drone';
  if (roll < tankChance) kind = 'tank';
  else if (roll < tankChance + runnerChance) kind = 'runner';
  else if (roll < tankChance + runnerChance + spitterChance) kind = 'spitter';
  else if (roll < tankChance + runnerChance + spitterChance + splitterChance) kind = 'splitter';
  const tank = kind === 'tank';
  const difficulty = 1 + state.time / 90;
  const stats = {
    drone: { radius: 12, hp: 28, speed: 64, damage: 12, color: '#e96b8a' },
    tank: { radius: 17, hp: 68, speed: 39, damage: 20, color: '#ff9b68' },
    runner: { radius: 9, hp: 19, speed: 105, damage: 9, color: '#ff6fca' },
    spitter: { radius: 13, hp: 38, speed: 39, damage: 10, color: '#c59aff' },
    splitter: { radius: 14, hp: 42, speed: 48, damage: 12, color: '#f1cf71' }
  }[kind];
  state.enemies.push({
    x, y, radius: stats.radius, hp: stats.hp * difficulty, maxHp: stats.hp * difficulty,
    speed: stats.speed * (1 + Math.min(state.time / 500, .32)),
    damage: stats.damage, color: stats.color, tank, kind,
    shotTimer: 1.3 + Math.random() * .8
  });
}

function nearestEnemy() {
  const marked = state.enemies.find(enemy =>
    enemy.markTimer > 0 && Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) < state.player.range
  );
  if (marked) return marked;
  let nearest = null;
  let distance = state.player.range;
  for (const enemy of state.enemies) {
    const d = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (d < distance) { distance = d; nearest = enemy; }
  }
  return nearest;
}

function fireAt(enemy, forceRail = false) {
  const dx = enemy.x - state.player.x;
  const dy = enemy.y - state.player.y;
  const length = Math.hypot(dx, dy) || 1;
  state.player.facing = Math.atan2(dy, dx);
  state.shotsFired++;
  const railInterval = Math.max(2, 4 - (state.upgradeLevels.overclock || 0));
  const railShot = forceRail || (state.upgradeLevels.rail && state.shotsFired % railInterval === 0);
  state.bullets.push({
    x: state.player.x + dx / length * 15, y: state.player.y + dy / length * 15,
    vx: dx / length * (railShot ? 680 : 430), vy: dy / length * (railShot ? 680 : 430),
    radius: railShot ? 5 : 3.5,
    damage: state.player.damage * (1 + (state.upgradeLevels.deadeye || 0) * .12) * (railShot ? 2.2 : 1), life: 1.15,
    rail: Boolean(railShot),
    pierce: (railShot ? 4 : 0) + (state.upgradeLevels.ricochet || 0),
    hitEnemies: []
  });
  addCapacitorCharge(railShot ? 3 : 1);
  playTone(railShot ? 330 : 540, railShot ? .09 : .045, .025, 'triangle');
}

function updateBullets(dt) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    let remove = false;
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const enemy = state.enemies[j];
      if (bullet.hitEnemies.includes(enemy)) continue;
      if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + bullet.radius) {
        bullet.hitEnemies.push(enemy);
        const wasFrozen = enemy.slowTimer > 0;
        damageEnemy(enemy, bullet.damage);
        if (state.upgradeLevels.cryo) {
          enemy.slowTimer = Math.max(enemy.slowTimer || 0, 1.2 + state.upgradeLevels.cryo * .4);
        }
        burst(bullet.x, bullet.y, bullet.rail ? '#ffcf72' : '#6ce6d1', bullet.rail ? 7 : 3);
        if (bullet.rail && wasFrozen && state.upgradeLevels.brittle) {
          const radius = 62;
          emitRing(enemy.x, enemy.y, radius, '#8ddcff');
          for (const nearby of state.enemies) {
            if (nearby === enemy) continue;
            if (Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) <= radius) {
              damageEnemy(nearby, 28);
              nearby.slowTimer = Math.max(nearby.slowTimer || 0, 1.8);
              burst(nearby.x, nearby.y, '#8ddcff', 4);
              if (nearby.hp <= 0 && state.enemies.includes(nearby)) defeatEnemy(state.enemies.indexOf(nearby));
            }
          }
        }
        if (state.upgradeLevels.tesla) chainLightning(enemy, bullet.damage);
        if (enemy.hp <= 0 && state.enemies.includes(enemy)) defeatEnemy(state.enemies.indexOf(enemy));
        if (bullet.pierce > 0) {
          bullet.pierce--;
          if (bullet.pierce === 0) { remove = true; break; }
        } else {
          remove = true;
          break;
        }
      }
    }
    if (remove || bullet.life <= 0 || bullet.x < -20 || bullet.x > WIDTH + 20 || bullet.y < -20 || bullet.y > HEIGHT + 20) state.bullets.splice(i, 1);
  }
}

function defeatEnemy(index) {
  const enemy = state.enemies[index];
  if (!enemy) return;
  const beaconBurst = enemy.markTimer > 0 && state.upgradeLevels.beacon;
  state.enemies.splice(index, 1);
  state.kills++;
  state.orbs.push({ x: enemy.x, y: enemy.y, radius: 5, value: enemy.tank || enemy.kind === 'splitter' ? 3 : 1, phase: Math.random() * TAU });
  burst(enemy.x, enemy.y, enemy.color, enemy.tank ? 14 : 8);
  if (enemy.kind === 'splitter') {
    for (let child = 0; child < 2; child++) {
      const angle = child * Math.PI + Math.random() * .4;
      state.enemies.push({
        x: enemy.x + Math.cos(angle) * 10, y: enemy.y + Math.sin(angle) * 10,
        radius: 7, hp: 12 * (1 + state.time / 90), maxHp: 12 * (1 + state.time / 90),
        speed: 92 * (1 + Math.min(state.time / 500, .32)), damage: 7,
        color: '#f1cf71', tank: false, kind: 'mite', shotTimer: 0
      });
    }
  }
  if (state.upgradeLevels.fission && !enemy.exploded) {
    enemy.exploded = true;
    const level = state.upgradeLevels.fission;
    const thermal = enemy.slowTimer > 0 && state.upgradeLevels.thermalshock;
    const radius = 48 + level * 15 + (thermal ? 36 : 0) + (beaconBurst ? 26 : 0);
    emitRing(enemy.x, enemy.y, radius, thermal ? '#8ddcff' : '#ff9b68');
    damageInRadius(enemy.x, enemy.y, radius, 12 + level * 10 + (thermal ? 20 : 0) + (beaconBurst ? 12 : 0));
    if (thermal) {
      for (const nearby of state.enemies) {
        if (Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) <= radius) {
          nearby.slowTimer = Math.max(nearby.slowTimer || 0, 1.6);
        }
      }
    }
  }
  playTone(enemy.tank ? 150 : 230, .08, .035, 'sawtooth');
}

function updateEnemies(dt) {
  const player = state.player;
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    enemy.slowTimer = Math.max(0, (enemy.slowTimer || 0) - dt);
    enemy.markTimer = Math.max(0, (enemy.markTimer || 0) - dt);
    enemy.bladeHitCooldown = Math.max(0, (enemy.bladeHitCooldown || 0) - dt);
    const targetX = state.echo ? state.echo.x : player.x;
    const targetY = state.echo ? state.echo.y : player.y;
    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;
    const slowFactor = enemy.slowTimer > 0 ? .48 : 1;
    let direction = 1;
    if (enemy.kind === 'spitter') {
      if (distance < 145) direction = -1;
      else if (distance <= 225) direction = 0;
      enemy.shotTimer -= dt;
      if (enemy.shotTimer <= 0 && distance < 420) {
        state.enemyShots.push({
          x: enemy.x, y: enemy.y, vx: dx / distance * 170, vy: dy / distance * 170,
          radius: 5, damage: enemy.damage, life: 2.8
        });
        enemy.shotTimer = 2.4;
      }
    }
    enemy.x += dx / distance * enemy.speed * slowFactor * direction * dt;
    enemy.y += dy / distance * enemy.speed * slowFactor * direction * dt;
    const playerDistance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (playerDistance < player.radius + enemy.radius && player.invulnerable <= 0) {
      player.hp -= incomingDamage(enemy.damage);
      player.invulnerable = .68;
      state.phaseTime = 0;
      state.cameraShake = 6;
      damageEnemy(enemy, 18);
      burst(player.x, player.y, '#ff9b68', 11);
      playTone(100, .16, .06, 'sawtooth');
      if (enemy.hp <= 0) defeatEnemy(i);
      if (player.hp <= 0) endGame();
    }
  }
}

function updateEnemyShots(dt) {
  const player = state.player;
  for (let i = state.enemyShots.length - 1; i >= 0; i--) {
    const shot = state.enemyShots[i];
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
    if (shot.life <= 0 || shot.x < -20 || shot.x > WIDTH + 20 || shot.y < -20 || shot.y > HEIGHT + 20) {
      state.enemyShots.splice(i, 1);
      continue;
    }
    if (Math.hypot(player.x - shot.x, player.y - shot.y) < player.radius + shot.radius && player.invulnerable <= 0) {
      state.enemyShots.splice(i, 1);
      player.hp -= incomingDamage(shot.damage);
      player.invulnerable = .68;
      state.cameraShake = 5;
      burst(player.x, player.y, '#c59aff', 8);
      playTone(100, .12, .05, 'sawtooth');
      if (player.hp <= 0) endGame();
    }
  }
}

function updateOrbs(dt) {
  const p = state.player;
  for (let i = state.orbs.length - 1; i >= 0; i--) {
    const orb = state.orbs[i];
    orb.phase += dt * 3;
    const dx = p.x - orb.x;
    const dy = p.y - orb.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < p.pickup) {
      const speed = 230 + Math.max(0, p.pickup - distance) * 2.2;
      orb.x += dx / distance * speed * dt;
      orb.y += dy / distance * speed * dt;
    }
    if (distance < p.radius + orb.radius + 3) {
      state.orbs.splice(i, 1);
      state.xp += orb.value;
      if (state.upgradeLevels.tidal) {
        const radius = state.upgradeLevels.pulse ? 86 : 58;
        emitRing(p.x, p.y, radius, '#84d9ff');
        for (const enemy of state.enemies) {
          const dx = p.x - enemy.x;
          const dy = p.y - enemy.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance <= radius) {
            enemy.x += dx / distance * (state.upgradeLevels.pulse ? 34 : 22);
            enemy.y += dy / distance * (state.upgradeLevels.pulse ? 34 : 22);
          }
        }
      }
      if (state.upgradeLevels.salvage) {
        p.hp = Math.min(p.maxHp, p.hp + (state.upgradeLevels.tidal ? 5 : 3));
        const radius = state.upgradeLevels.tidal ? 58 : 42;
        emitRing(p.x, p.y, radius, '#6ce6d1');
        damageInRadius(p.x, p.y, radius, 15);
      }
      if (state.upgradeLevels.salvageburst) {
        const bonus = (state.upgradeLevels.salvage ? 10 : 0) + (state.upgradeLevels.tidal ? 10 : 0);
        const radius = 54 + (state.upgradeLevels.tidal ? 14 : 0);
        emitRing(p.x, p.y, radius, '#b8f27c');
        damageInRadius(p.x, p.y, radius, 22 + bonus);
      }
      playTone(780, .045, .025, 'sine');
      while (state.xp >= state.nextXp && !state.paused) levelUp();
    }
  }
}

function levelUp() {
  state.xp -= state.nextXp;
  state.level++;
  state.nextXp = Math.floor(5 + state.level * 2.4);
  state.paused = true;
  showUpgrades();
  if (state.upgradeLevels.nanobots) state.player.hp = Math.min(state.player.maxHp, state.player.hp + 8);
  playTone(660, .13, .06, 'sine');
}

function showUpgrades() {
  const available = upgrades.filter(upgrade => {
    const meetsRequirements = !upgrade.requires || upgrade.requires.every(id => state.upgradeLevels[id] > 0);
    return (state.upgradeLevels[upgrade.id] || 0) < upgrade.max &&
      meetsRequirements &&
      (state.level !== 2 || upgrade.signature);
  });
  const combos = shuffle(available.filter(upgrade => upgrade.requires));
  const standaloneSynergies = shuffle(available.filter(upgrade => upgrade.synergy));
  const regular = shuffle(available.filter(upgrade => !upgrade.requires && !upgrade.synergy));
  const choices = [...combos.slice(0, 1), ...standaloneSynergies.slice(0, 1)];
  choices.push(...regular.slice(0, 3 - choices.length));
  if (choices.length < 3) {
    choices.push(...shuffle([...combos.slice(1), ...standaloneSynergies.slice(1)]).slice(0, 3 - choices.length));
  }
  document.querySelector('#upgrade-subtitle').textContent = state.level === 2
    ? 'Your first evolution defines the build. Choose a protocol to install.'
    : combos.length
      ? 'A compatible combo is available. Pair your protocols to evolve your build.'
      : 'Every protocol works alone; some grow stronger beside a compatible system.';
  upgradeCards.replaceChildren();
  for (const upgrade of choices) {
    const level = state.upgradeLevels[upgrade.id] || 0;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `upgrade-card${upgrade.requires ? ' combo-card' : upgrade.synergy ? ' synergy-card' : ''}`;
    const pair = upgrade.requires
      ? `<span class="combo-pair">PAIR · ${upgrade.requires.map(id => upgrades.find(item => item.id === id).name).join(' + ')}</span>`
      : upgrade.synergy
        ? `<span class="combo-pair">STANDALONE · PAIRS WITH ${upgrade.synergy.map(id => upgrades.find(item => item.id === id).name).join(' + ')}</span>`
      : '';
    card.innerHTML = `<span class="upgrade-index"><span>${upgrade.category}</span><span>LV ${level + 1}/${upgrade.max}</span></span><span class="upgrade-icon">${upgrade.icon}</span><strong>${upgrade.name}</strong>${pair}<p>${upgrade.description}</p>`;
    card.addEventListener('click', () => selectUpgrade(upgrade));
    upgradeCards.append(card);
  }
  upgradeScreen.hidden = false;
  updateHud();
}

function selectUpgrade(upgrade) {
  state.upgradeLevels[upgrade.id] = (state.upgradeLevels[upgrade.id] || 0) + 1;
  const p = state.player;
  switch (upgrade.id) {
    case 'quantum': break;
    case 'entropy': state.regenTimer = 0; break;
    case 'isotope': p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); break;
    case 'pulse': state.pulseTimer = Math.min(state.pulseTimer, 2); break;
    case 'blades': state.bladeAngle = 0; break;
    case 'dynamo': state.dynamoCharge = 0; break;
    case 'tidal': p.pickup = Math.max(p.pickup, 145); break;
    case 'overclock': break;
    case 'deadeye': p.range += 45; p.damage += 3; break;
    case 'repulsor': state.repulsorTimer = Math.max(state.repulsorTimer, 4); break;
    case 'vector': p.speed += 16; break;
    case 'fluxmagazine': break;
    case 'magnetar': p.pickup += 28; break;
    case 'ricochet': break;
    case 'salvageburst': break;
    case 'bulwark': break;
  }
  upgradeScreen.hidden = true;
  state.paused = false;
  showToast(`${upgrade.name.toUpperCase()} INSTALLED`);
  updateLoadout();
  updateHud();
  if (state.xp >= state.nextXp) levelUp();
}

function activatePhase() {
  if (!state.running || state.paused || state.over || state.phaseCooldown > 0) return;
  state.phaseCooldown = Math.max(1.5, 5 * Math.pow(.78, state.upgradeLevels.quantum || 0));
  state.phaseTime = .25;
  state.player.invulnerable = .32;
  const oldX = state.player.x;
  const oldY = state.player.y;
  if (state.upgradeLevels.echo && !state.echo) {
    state.echo = { x: oldX, y: oldY, timer: 2.4 };
    emitRing(oldX, oldY, 68, '#a98bff');
  }
  const dx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  const dy = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
  const length = Math.hypot(dx, dy);
  const angle = length ? Math.atan2(dy, dx) : state.player.facing;
  state.player.x = clamp(state.player.x + Math.cos(angle) * 115, state.player.radius + 12, WIDTH - state.player.radius - 12);
  state.player.y = clamp(state.player.y + Math.sin(angle) * 115, state.player.radius + 12, HEIGHT - state.player.radius - 12);
  if (state.upgradeLevels.phasebattery) {
    emitRing(state.player.x, state.player.y, 86, '#84d9ff');
    damageInRadius(state.player.x, state.player.y, 86, 28, 45);
    if (state.upgradeLevels.dynamo) state.dynamoCharge = 1.65;
    if (state.echo) {
      const echo = state.echo;
      state.echo = null;
      emitRing(echo.x, echo.y, 72, '#84d9ff');
      damageInRadius(echo.x, echo.y, 72, 30, 35);
    }
  }
  if (state.upgradeLevels.phaselance) {
    emitRing(state.player.x, state.player.y, 92, '#ffcf72');
    damageInRadius(state.player.x, state.player.y, 92, 34, 55);
    const target = nearestEnemy();
    if (target) fireAt(target, true);
  }
  burst(state.player.x, state.player.y, '#6ce6d1', 13);
  playTone(320, .16, .055, 'sine');
}

function endGame() {
  if (state.over) return;
  state.over = true;
  state.paused = true;
  state.running = false;
  document.querySelector('#final-time').textContent = formatTime(state.time);
  document.querySelector('#final-kills').textContent = String(state.kills).padStart(3, '0');
  document.querySelector('#final-upgrades').textContent = String(Object.values(state.upgradeLevels).reduce((a, b) => a + b, 0)).padStart(2, '0');
  document.querySelector('#final-build').textContent = upgrades
    .filter(upgrade => state.upgradeLevels[upgrade.id])
    .map(upgrade => `${upgrade.name}${state.upgradeLevels[upgrade.id] > 1 ? ` ${state.upgradeLevels[upgrade.id]}` : ''}`)
    .join(' · ') || 'NO PROTOCOLS INSTALLED';
  gameOverScreen.hidden = false;
}

function updateHud() {
  if (!state.player) return;
  document.querySelector('#health-fill').style.width = `${Math.max(0, state.player.hp / state.player.maxHp * 100)}%`;
  document.querySelector('#health-value').textContent = `${Math.ceil(Math.max(0, state.player.hp))} / ${state.player.maxHp}`;
  document.querySelector('#xp-fill').style.width = `${state.xp / state.nextXp * 100}%`;
  document.querySelector('#level-value').textContent = `LV ${state.level}`;
  document.querySelector('#time-value').textContent = formatTime(state.time);
  document.querySelector('#kill-value').textContent = String(state.kills).padStart(3, '0');
  document.querySelector('#wave-label').innerHTML = `SECTOR ${String(Math.floor(state.time / 30) + 1).padStart(2, '0')} <span>·</span> ${state.enemies.length > 4 ? 'SIGNAL SATURATION' : 'SIGNAL DETECTED'}`;
}

function updateLoadout() {
  const display = document.querySelector('#build-display');
  display.replaceChildren();
  for (const upgrade of upgrades) {
    const level = state.upgradeLevels[upgrade.id] || 0;
    if (!level) continue;
    const chip = document.createElement('span');
    chip.className = `build-chip${upgrade.requires ? ' combo-chip' : upgrade.synergy ? ' synergy-chip' : upgrade.signature ? ' signature-chip' : ''}`;
    chip.title = upgrade.name;
    chip.textContent = `${upgrade.icon} ${upgrade.name}${level > 1 ? ` ${level}` : ''}`;
    display.append(chip);
  }
}

function draw() {
  ctx.save();
  if (state.cameraShake > 0) ctx.translate((Math.random() - .5) * state.cameraShake, (Math.random() - .5) * state.cameraShake);
  ctx.clearRect(-10, -10, WIDTH + 20, HEIGHT + 20);
  drawBackground();
  for (const ring of state.rings) {
    ctx.globalAlpha = ring.life / ring.maxLife * .72;
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * (1.25 - ring.life / ring.maxLife * .25), 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (const orb of state.orbs) drawOrb(orb);
  for (const bullet of state.bullets) {
    ctx.fillStyle = bullet.rail ? '#ffe0a3' : '#b6fff1';
    ctx.shadowColor = bullet.rail ? '#ffbd70' : '#6ce6d1';
    ctx.shadowBlur = bullet.rail ? 18 : 13;
    if (bullet.rail) {
      ctx.strokeStyle = 'rgba(255, 189, 112, .6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bullet.x, bullet.y);
      ctx.lineTo(bullet.x - bullet.vx * .035, bullet.y - bullet.vy * .035);
      ctx.stroke();
    }
    circle(bullet.x, bullet.y, bullet.radius);
    ctx.shadowBlur = 0;
  }
  for (const shot of state.enemyShots) {
    ctx.fillStyle = '#d9b5ff';
    ctx.shadowColor = '#c59aff';
    ctx.shadowBlur = 12;
    circle(shot.x, shot.y, shot.radius);
    ctx.shadowBlur = 0;
  }
  for (const enemy of state.enemies) drawEnemy(enemy);
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    circle(particle.x, particle.y, particle.radius);
  }
  ctx.globalAlpha = 1;
  for (const arc of state.arcs) {
    ctx.globalAlpha = arc.life / .16;
    ctx.strokeStyle = '#81d8ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#81d8ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(arc.x1, arc.y1);
    ctx.lineTo(arc.x2, arc.y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
  if (state.echo) drawEcho();
  if (state.player) drawPlayer();
  ctx.restore();
}

function drawBackground() {
  ctx.fillStyle = '#0a101b';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = 'rgba(113, 147, 179, .075)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(108, 230, 209, .16)';
  ctx.strokeRect(12, 12, WIDTH - 24, HEIGHT - 24);
  const vignette = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 150, WIDTH / 2, HEIGHT / 2, 580);
  vignette.addColorStop(0, 'rgba(5, 10, 18, 0)');
  vignette.addColorStop(1, 'rgba(5, 10, 18, .56)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawPlayer() {
  const p = state.player;
  const blinking = p.invulnerable > 0 && Math.floor(performance.now() / 65) % 2 === 0;
  if (blinking) return;
  const bladeLevel = state.upgradeLevels.blades || 0;
  if (bladeLevel) {
    const bladeCount = 2 + bladeLevel;
    const orbitRadius = 38 + bladeLevel * 5;
    for (let blade = 0; blade < bladeCount; blade++) {
      const angle = state.bladeAngle + blade / bladeCount * TAU;
      const x = p.x + Math.cos(angle) * orbitRadius;
      const y = p.y + Math.sin(angle) * orbitRadius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#f2d17a';
      ctx.shadowColor = '#f2d17a';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -8); ctx.lineTo(4, 0); ctx.lineTo(0, 8); ctx.lineTo(-4, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  if (state.dynamoCharge > 0 && state.upgradeLevels.dynamo) {
    ctx.globalAlpha = .12 + .28 * Math.min(1, state.dynamoCharge / 1.65);
    ctx.strokeStyle = '#ffbd70';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 25 + state.dynamoCharge * 18, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (state.upgradeLevels.capacitor) {
    const charge = state.capacitorCharge / 8;
    ctx.strokeStyle = '#ffe27a';
    ctx.lineWidth = 2;
    ctx.globalAlpha = .25 + charge * .7;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 30, -Math.PI / 2, -Math.PI / 2 + charge * TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.facing);
  ctx.fillStyle = state.phaseTime > 0 ? 'rgba(108, 230, 209, .22)' : 'rgba(108, 230, 209, .10)';
  circle(0, 0, p.radius + 9);
  ctx.strokeStyle = state.phaseTime > 0 ? '#b9fff2' : '#6ce6d1';
  ctx.lineWidth = 1.4;
  ctx.shadowColor = '#6ce6d1';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(15, 0); ctx.lineTo(4, -11); ctx.lineTo(-11, -9); ctx.lineTo(-15, 0); ctx.lineTo(-11, 9); ctx.lineTo(4, 11); ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#122d35';
  ctx.fill();
  ctx.fillStyle = '#a7fff0';
  ctx.fillRect(1, -3, 7, 6);
  ctx.fillStyle = '#6ce6d1';
  ctx.fillRect(-9, -5, 3, 3); ctx.fillRect(-9, 2, 3, 3);
  ctx.restore();
}

function drawEcho() {
  const echo = state.echo;
  ctx.save();
  ctx.globalAlpha = Math.min(1, echo.timer);
  ctx.translate(echo.x, echo.y);
  ctx.strokeStyle = '#a98bff';
  ctx.fillStyle = 'rgba(169, 139, 255, .15)';
  ctx.shadowColor = '#a98bff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(0, -14); ctx.lineTo(13, 0); ctx.lineTo(0, 14); ctx.lineTo(-13, 0); ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  if (enemy.markTimer > 0) {
    ctx.strokeStyle = '#ffdf75';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#ffdf75';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 6, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, -enemy.radius - 11); ctx.lineTo(0, -enemy.radius - 15); ctx.lineTo(4, -enemy.radius - 11);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.rotate(state.time * (enemy.tank ? -.35 : .7));
  ctx.fillStyle = `${enemy.color}28`;
  ctx.strokeStyle = enemy.slowTimer > 0 ? '#8ddcff' : enemy.color;
  ctx.lineWidth = enemy.tank || enemy.kind === 'splitter' ? 2 : 1.5;
  ctx.shadowColor = enemy.color;
  ctx.shadowBlur = 9;
  if (enemy.tank || enemy.kind === 'splitter') {
    ctx.beginPath();
    const points = enemy.kind === 'splitter' ? 6 : 8;
    for (let i = 0; i < points; i++) {
      const a = i / points * TAU;
      const r = enemy.radius * (i % 2 ? .79 : 1);
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (enemy.kind === 'spitter') {
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-enemy.radius * .65, -enemy.radius * .35);
    ctx.lineTo(0, -enemy.radius * .8);
    ctx.lineTo(enemy.radius * .65, -enemy.radius * .35);
    ctx.stroke();
  } else {
    const tip = enemy.kind === 'runner' || enemy.kind === 'mite' ? enemy.radius * 1.5 : enemy.radius;
    ctx.beginPath(); ctx.moveTo(tip, 0); ctx.lineTo(-enemy.radius * .75, -enemy.radius); ctx.lineTo(-enemy.radius * .45, 0); ctx.lineTo(-enemy.radius * .75, enemy.radius); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = enemy.color;
  circle(0, 0, enemy.tank ? 4 : enemy.kind === 'spitter' ? 4 : 2.5);
  ctx.restore();
  if (enemy.hp < enemy.maxHp) {
    ctx.fillStyle = 'rgba(0, 0, 0, .6)'; ctx.fillRect(enemy.x - 12, enemy.y - enemy.radius - 7, 24, 2);
    ctx.fillStyle = enemy.color; ctx.fillRect(enemy.x - 12, enemy.y - enemy.radius - 7, 24 * Math.max(0, enemy.hp / enemy.maxHp), 2);
  }
}

function drawOrb(orb) {
  const pulse = 1 + Math.sin(orb.phase) * .2;
  ctx.fillStyle = 'rgba(108, 230, 209, .12)';
  ctx.shadowColor = '#6ce6d1'; ctx.shadowBlur = 12;
  circle(orb.x, orb.y, orb.radius * 2.2 * pulse);
  ctx.fillStyle = '#8af5df';
  circle(orb.x, orb.y, orb.radius * pulse);
  ctx.shadowBlur = 0;
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * TAU;
    const speed = 25 + Math.random() * 120;
    const life = .2 + Math.random() * .32;
    state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: 1 + Math.random() * 2, color, life, maxLife: life });
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const particle = state.particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
    if (particle.life <= 0) state.particles.splice(i, 1);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  state.toastTimer = 1.5;
}

let audioContext;
function playTone(frequency, duration, volume, type) {
  if (!state.sound) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function circle(x, y, radius) { ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill(); }
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
  keys.add(key);
  if (key === ' ') activatePhase();
  if (key === 'escape' && state.running && !state.over && !upgradeScreen.hidden) return;
});
document.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
document.querySelector('#start-button').addEventListener('click', resetGame);
document.querySelector('#restart-button').addEventListener('click', resetGame);
document.querySelector('#sound-toggle').addEventListener('click', event => {
  state.sound = !state.sound;
  event.currentTarget.textContent = `SOUND: ${state.sound ? 'ON' : 'OFF'}`;
  if (state.sound) playTone(520, .08, .04, 'sine');
});

draw();
