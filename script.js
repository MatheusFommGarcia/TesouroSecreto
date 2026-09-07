/* ============================================================
   O MAPA DA GRAND LINE — MOTOR DA AVENTURA
   Organizado em módulos lógicos (mesmo em um único arquivo):
   1. Tempo / céu          5. Minijogos
   2. Estado do jogo       6. Cartas / Easter eggs
   3. Mapa / navio         7. Final / tesouro
   4. Ilhas                8. Boot
   ============================================================ */

'use strict';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   1. TEMPO REAL (BRASÍLIA) E CÉU DINÂMICO
   ============================================================ */

function getBrasiliaTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

function getPhase(date) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 6 && h < 12) return 'manha';
  if (h >= 12 && h < 18) return 'tarde';
  if (h >= 18 && h < 19.5) return 'porsol';
  return 'noite';
}

const PHASE_LABELS = {
  manha: '🌅 Manhã',
  tarde: '☀️ Tarde',
  porsol: '🌅 Pôr do sol',
  noite: '🌙 Noite'
};

const PHASE_MESSAGES = {
  manha: 'O sol nasceu sobre a Grand Line. Uma nova aventura começa.',
  tarde: 'O sol está alto. Talvez o próximo tesouro esteja mais perto do que você imagina.',
  porsol: 'O sol está se despedindo do horizonte... talvez a noite esconda segredos que o dia não consegue revelar.',
  noite: 'A noite caiu sobre a Grand Line. Mas algumas aventuras ficam ainda mais bonitas sob as estrelas.'
};

let lastPhase = null;
let lastPhaseMessageAt = 0;

function updateClock() {
  const now = getBrasiliaTime();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('hud-time').textContent = `${hh}:${mm}`;
  const phase = getPhase(now);
  document.getElementById('hud-phase').textContent = PHASE_LABELS[phase];
  updateTimeOfDay(phase);
  checkMidnightEasterEgg(now);
  return now;
}

function updateTimeOfDay(phase) {
  if (phase !== lastPhase) {
    document.body.classList.remove('phase-manha', 'phase-tarde', 'phase-porsol', 'phase-noite');
    document.body.classList.add(`phase-${phase}`);
    lastPhase = phase;
    maybeShowPhaseToast(phase);
  }
}

function maybeShowPhaseToast(phase) {
  const now = Date.now();
  if (now - lastPhaseMessageAt < 5000) return;
  lastPhaseMessageAt = now;
  if (document.getElementById('screen-map').classList.contains('hidden')) return;
  showToast(PHASE_MESSAGES[phase]);
}

let toastTimer = null;
function showToast(text) {
  let toast = document.getElementById('phase-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'phase-toast';
    toast.style.cssText = `
      position:fixed; left:50%; bottom:24px; transform:translateX(-50%) translateY(20px);
      background:rgba(7,28,44,0.9); border:1px solid rgba(214,168,79,0.5); color:#fff4d6;
      padding:12px 20px; border-radius:12px; font-family:'IM Fell English',Georgia,serif;
      font-style:italic; max-width:88vw; text-align:center; z-index:60; opacity:0;
      transition:opacity .6s ease, transform .6s ease; pointer-events:none;`;
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 4200);
}

function createStars() {
  const container = document.getElementById('stars');
  container.innerHTML = '';
  const total = window.innerWidth < 640 ? 60 : 110;
  const clickableIndexes = new Set();
  while (clickableIndexes.size < 5) clickableIndexes.add(Math.floor(Math.random() * total));

  for (let i = 0; i < total; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 62 + '%';
    star.style.animationDelay = (Math.random() * 3.5) + 's';
    if (clickableIndexes.has(i)) {
      star.classList.add('star-clickable');
      star.dataset.constellation = 'true';
      star.setAttribute('role', 'button');
      star.setAttribute('tabindex', '0');
      star.setAttribute('aria-label', 'Estrela brilhante');
      star.addEventListener('click', onConstellationStarClick);
      star.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') onConstellationStarClick.call(star); });
    }
    container.appendChild(star);
  }
}

function createClouds() {
  const container = document.getElementById('clouds');
  container.innerHTML = '';
  const count = window.innerWidth < 640 ? 4 : 7;
  for (let i = 0; i < count; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    const w = 80 + Math.random() * 120;
    cloud.style.width = w + 'px';
    cloud.style.height = w * 0.36 + 'px';
    cloud.style.top = (5 + Math.random() * 30) + '%';
    cloud.style.left = (Math.random() * 100) + '%';
    if (!REDUCED_MOTION) {
      cloud.style.animation = `drift ${40 + Math.random() * 30}s linear infinite`;
      cloud.style.animationDelay = -Math.random() * 40 + 's';
    }
    container.appendChild(cloud);
  }
}

/* Partículas ambientes discretas (poeira dourada / vagalumes) */
let particleCtx, particleList = [];
function createParticles() {
  const canvas = document.getElementById('particles');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  particleCtx = canvas.getContext('2d');
  particleList = [];
  const count = REDUCED_MOTION ? 0 : (window.innerWidth < 640 ? 18 : 34);
  for (let i = 0; i < count; i++) {
    particleList.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.6 + Math.random() * 1.6,
      speedY: -0.15 - Math.random() * 0.25,
      speedX: (Math.random() - 0.5) * 0.15,
      alpha: 0.15 + Math.random() * 0.35
    });
  }
  if (!REDUCED_MOTION) requestAnimationFrame(animateParticles);
}

function animateParticles() {
  if (!particleCtx) return;
  const canvas = particleCtx.canvas;
  particleCtx.clearRect(0, 0, canvas.width, canvas.height);
  const isNight = document.body.classList.contains('phase-noite') || document.body.classList.contains('phase-porsol');
  particleCtx.fillStyle = isNight ? 'rgba(255,244,214,0.8)' : 'rgba(255,255,255,0.7)';
  particleList.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    if (p.y < -10) p.y = canvas.height + 10;
    if (p.x < -10) p.x = canvas.width + 10;
    if (p.x > canvas.width + 10) p.x = -10;
    particleCtx.globalAlpha = p.alpha;
    particleCtx.beginPath();
    particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    particleCtx.fill();
  });
  particleCtx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

function checkMidnightEasterEgg(now) {
  const h = now.getHours();
  if (h === 0 && !gameState.easterEggs.includes('midnight')) {
    if (!document.getElementById('screen-map').classList.contains('hidden')) {
      gameState.easterEggs.push('midnight');
      saveProgress();
      showToast('Você ainda está aqui?');
      setTimeout(() => showToast('Então talvez você realmente queira encontrar esse tesouro.'), 4600);
    }
  }
}

/* ============================================================
   2. ESTADO DO JOGO
   ============================================================ */

const STORAGE_KEY = 'grandline_tesouro_v1';

let gameState = {
  currentIsland: 0,
  memoriesFound: 0,
  riddlesSolved: 0,
  fragmentsFound: 0,
  heartsCollected: 0,
  berries: 0,
  hintsUsed: 0,
  choices: [],
  easterEggs: [],
  completedIslands: [],
  unlockedLetters: [],
  cartasUnlocked: [],
  photosUnlocked: [],
  attributes: { coracao: 0, coragem: 0, curiosidade: 0, aventura: 0, lealdade: 0 },
  mapLied: false,
  screen: 'opening',
  moonClicks: 0,
  compassClicks: [],
  constellationFound: []
};

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) { /* localStorage indisponível — a aventura continua, apenas sem salvar */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      gameState = Object.assign({}, gameState, loaded);
      gameState.attributes = Object.assign({ coracao: 0, coragem: 0, curiosidade: 0, aventura: 0, lealdade: 0 }, loaded.attributes || {});
      return true;
    }
  } catch (e) { /* progresso corrompido — recomeça silenciosamente */ }
  return false;
}

function resetGame() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  location.reload();
}

/* ============================================================
   3. ILHAS — DADOS
   ============================================================ */

const ISLANDS = [
  { id: 'curiosidade', name: 'Ilha da Curiosidade', icon: '🏝️', x: 300, y: 700, chapter: 'Capítulo 03 — O Código Misterioso', type: 'riddle' },
  { id: 'memorias', name: 'Ilha das Memórias', icon: '💌', x: 560, y: 560, chapter: 'Capítulo 04 — Memórias Perdidas', type: 'memory', unlocksCarta: 0 },
  { id: 'enigmas', name: 'Ilha dos Enigmas', icon: '🧩', x: 480, y: 340, chapter: 'Capítulo 05 — Código do Pirata', type: 'enigmas', unlocksCarta: 1 },
  { id: 'tempestade', name: 'Mar da Tempestade', icon: '🌊', x: 780, y: 250, chapter: 'Capítulo 06 — Mar da Tempestade', type: 'storm' },
  { id: 'coracao', name: 'Ilha do Coração', icon: '❤️', x: 1000, y: 420, chapter: 'Capítulo 07 — A Ilha do Coração', type: 'heart', unlocksCarta: 2 },
  { id: 'sonhos', name: 'Arquipélago dos Sonhos', icon: '⭐', x: 1190, y: 610, chapter: 'Capítulo 08 — Arquipélago dos Sonhos', type: 'dreams', unlocksCarta: 3 },
  { id: 'secreta', name: 'Ilha Secreta', icon: '🌙', x: 1010, y: 790, chapter: 'Capítulo 09 — A Ilha que Não Existe', type: 'secret', hidden: true },
  { id: 'laughtale-gate', name: 'Rumo a Laugh Tale', icon: '🌅', x: 1380, y: 860, chapter: 'Capítulo 13 — Laugh Tale', type: 'gate' }
];

const PORT = { x: 110, y: 850 };
const TINY_ISLAND = { x: 660, y: 880 };

function islandById(id) { return ISLANDS.find(i => i.id === id); }
function islandIndex(id) { return ISLANDS.findIndex(i => i.id === id); }

function isIslandVisible(island) {
  if (!island.hidden) return true;
  return gameState.mapLied;
}

function isIslandUnlocked(island) {
  const idx = islandIndex(island.id);
  if (idx === 0) return true;
  if (island.id === 'secreta') return gameState.mapLied;
  const prev = ISLANDS[idx - 1];
  return gameState.completedIslands.includes(prev.id);
}

function isIslandComplete(island) {
  return gameState.completedIslands.includes(island.id);
}

/* ============================================================
   3b. MAPA / NAVIO / NÉVOA / ARRASTAR
   ============================================================ */

let mapOffset = { x: 0, y: 0 };
let dragState = null;

function updateMap() {
  renderIslands();
  drawRoutes();
  updateFog();
  updateHUDStats();
  updateBondMeter();
}

function renderIslands() {
  const layer = document.getElementById('islands-layer');
  layer.innerHTML = '';

  ISLANDS.forEach(island => {
    if (!isIslandVisible(island)) return;
    const unlocked = isIslandUnlocked(island);
    const complete = isIslandComplete(island);

    const btn = document.createElement('button');
    btn.className = 'island' + (unlocked ? '' : ' is-locked') + (complete ? ' is-complete' : '');
    btn.style.left = island.x + 'px';
    btn.style.top = island.y + 'px';
    btn.setAttribute('aria-label', `${island.name} — ${complete ? 'concluída' : unlocked ? 'disponível' : 'bloqueada'}`);
    if (!unlocked) btn.disabled = true;

    const status = complete ? '✅' : unlocked ? '✨' : '🔒';
    btn.innerHTML = `
      <span class="island-shape">${island.icon}<span class="island-status">${status}</span></span>
      <span class="island-name">${island.name}</span>`;

    btn.addEventListener('click', () => showIsland(island.id));
    layer.appendChild(btn);
  });

  // ilhota decorativa (easter egg)
  const tiny = document.createElement('button');
  tiny.className = 'island';
  tiny.style.left = TINY_ISLAND.x + 'px';
  tiny.style.top = TINY_ISLAND.y + 'px';
  tiny.setAttribute('aria-label', 'Uma pequena ilha sem nome');
  tiny.innerHTML = `<span class="island-shape" style="width:34px;height:24px;font-size:0.9rem;">🌴</span>`;
  tiny.addEventListener('click', () => {
    showToast('Nem todo tesouro precisa ser encontrado.');
    if (!gameState.easterEggs.includes('tiny-island')) {
      gameState.easterEggs.push('tiny-island');
      saveProgress();
    }
  });
  layer.appendChild(tiny);
}

function drawRoutes() {
  const visible = ISLANDS.filter(isIslandVisible);
  const points = [PORT, ...visible.map(i => ({ x: i.x, y: i.y }))];
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  document.getElementById('route-path').setAttribute('d', d);
}

function currentFocusPoint() {
  const lastCompleted = [...ISLANDS].reverse().find(i => isIslandComplete(i));
  const nextIsland = ISLANDS.find(i => isIslandVisible(i) && isIslandUnlocked(i) && !isIslandComplete(i));
  const focus = nextIsland || lastCompleted || ISLANDS[0];
  return { x: focus.x, y: focus.y };
}

function updateFog() {
  const fog = document.getElementById('map-fog');
  const viewport = document.getElementById('map-viewport');
  const focus = currentFocusPoint();
  const vRect = viewport.getBoundingClientRect();
  const screenX = focus.x + mapOffset.x;
  const screenY = focus.y + mapOffset.y;
  const pctX = (screenX / 1600) * 100;
  const pctY = (screenY / 1000) * 100;
  fog.style.setProperty('--fog-x', pctX + '%');
  fog.style.setProperty('--fog-y', pctY + '%');
}

function clampOffset() {
  const viewport = document.getElementById('map-viewport');
  const vw = viewport.clientWidth, vh = viewport.clientHeight;
  const minX = Math.min(0, vw - 1600);
  const minY = Math.min(0, vh - 1000);
  mapOffset.x = Math.max(minX, Math.min(0, mapOffset.x));
  mapOffset.y = Math.max(minY, Math.min(0, mapOffset.y));
}

function applyMapOffset(animated) {
  const canvas = document.getElementById('map-canvas');
  canvas.style.transition = animated ? 'transform 1.1s ease' : 'none';
  canvas.style.transform = `translate(${mapOffset.x}px, ${mapOffset.y}px)`;
}

function centerOn(point, animated = true) {
  const viewport = document.getElementById('map-viewport');
  mapOffset.x = viewport.clientWidth / 2 - point.x;
  mapOffset.y = viewport.clientHeight / 2 - point.y;
  clampOffset();
  applyMapOffset(animated);
  updateFog();
}

function setupMapDrag() {
  const viewport = document.getElementById('map-viewport');
  const DRAG_THRESHOLD = 6; // px — abaixo disso, é considerado clique/toque, não arraste

  viewport.addEventListener('pointerdown', (e) => {
    // Se o toque/clique começou em cima de uma ilha, da bússola ou de
    // qualquer botão, não inicia o arraste — deixa o clique acontecer normalmente.
    if (e.target.closest('button, .island, .compass, [role="button"]')) return;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      origX: mapOffset.x,
      origY: mapOffset.y,
      moved: false,
      pointerId: e.pointerId
    };
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (!dragState.moved) {
      // Só assume que é um arraste de verdade depois de passar do limiar.
      // Isso evita "roubar" o clique de uma ilha por causa de um tremor mínimo do mouse/dedo.
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      dragState.moved = true;
      viewport.setPointerCapture(dragState.pointerId);
    }

    mapOffset.x = dragState.origX + dx;
    mapOffset.y = dragState.origY + dy;
    clampOffset();
    applyMapOffset(false);
    updateFog();
  });
  const endDrag = () => { dragState = null; };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointerleave', endDrag);
}

function moveShip(toPoint, callback) {
  const ship = document.getElementById('ship');
  ship.style.left = toPoint.x - 45 + 'px';
  ship.style.top = toPoint.y - 60 + 'px';
  if (callback) setTimeout(callback, REDUCED_MOTION ? 0 : 3100);
}

function placeShipInitial() {
  const ship = document.getElementById('ship');
  const target = currentFocusPoint();
  ship.style.transition = 'none';
  ship.style.left = target.x - 45 + 'px';
  ship.style.top = target.y - 60 + 'px';
  requestAnimationFrame(() => { ship.style.transition = ''; });
}

/* ============================================================
   4. ABRIR / COMPLETAR ILHAS
   ============================================================ */

function showIsland(islandId) {
  const island = islandById(islandId);
  if (!island || !isIslandUnlocked(island)) return;

  const modal = document.getElementById('modal-island');
  document.getElementById('modal-island-title').textContent = `${island.icon} ${island.name}`;
  const body = document.getElementById('modal-island-body');
  body.innerHTML = '';

  if (isIslandComplete(island)) {
    body.innerHTML = `<p>Você já explorou esta ilha por completo. As memórias dela continuam com você.</p>`;
  } else {
    renderIslandChallenge(island, body);
  }

  modal.showModal();
}

function unlockIsland(islandId) {
  updateMap();
}

function completeIsland(islandId, opts = {}) {
  const island = islandById(islandId);
  if (!island || isIslandComplete(island)) return;

  gameState.completedIslands.push(islandId);
  gameState.fragmentsFound = Math.min(8, gameState.fragmentsFound + 1);
  gameState.berries += opts.berries || 20;
  if (opts.attribute) {
    gameState.attributes[opts.attribute] = (gameState.attributes[opts.attribute] || 0) + 1;
  }
  if (typeof island.unlocksCarta === 'number' && !gameState.cartasUnlocked.includes(island.unlocksCarta)) {
    gameState.cartasUnlocked.push(island.unlocksCarta);
  }
  if (gameState.photosUnlocked.length < CONFIG.fotos.length && gameState.completedIslands.length % 2 === 0) {
    gameState.photosUnlocked.push(gameState.photosUnlocked.length);
  }

  // revela mais uma letra da senha final
  const word = (CONFIG.palavraSecreta || '').toUpperCase();
  if (gameState.unlockedLetters.length < word.length) {
    gameState.unlockedLetters.push(word[gameState.unlockedLetters.length]);
  }

  saveProgress();
  updateMap();

  // Evento especial: "o mapa está mentindo" após completar Arquipélago dos Sonhos
  if (islandId === 'sonhos' && !gameState.mapLied) {
    setTimeout(showMapLiedEvent, 700);
  }

  const idx = islandIndex(islandId);
  const next = ISLANDS[idx + 1];
  const nextPoint = next && isIslandVisible(next) ? { x: next.x, y: next.y } : island;
  moveShip(nextPoint, () => centerOn(nextPoint));

  if (islandId === 'laughtale-gate') {
    setTimeout(startLaughTale, 1400);
  }
}

function showMapLiedEvent() {
  gameState.mapLied = true;
  saveProgress();
  const modal = document.getElementById('modal-letter');
  document.getElementById('modal-letter-title').textContent = '⚠️ Aviso do Logpose';
  document.getElementById('modal-letter-body').innerHTML =
    `<p><strong>O mapa está mentindo.</strong></p>
     <p>Existe uma ilha que nenhum mapa jamais marcou.</p>
     <p>Ela só aparece para quem já provou que chegaria até aqui.</p>`;
  modal.showModal();
  modal.addEventListener('close', () => updateMap(), { once: true });
}

/* ============================================================
   5. DESAFIOS DE CADA ILHA
   ============================================================ */

function renderIslandChallenge(island, body) {
  switch (island.type) {
    case 'riddle': return renderRiddleIsland(island, body);
    case 'memory': return startMemoryGame(island, body);
    case 'enigmas': return renderEnigmasIsland(island, body);
    case 'storm': return startStormGame(island, body);
    case 'heart': return renderHeartIsland(island, body);
    case 'dreams': return renderDreamsIsland(island, body);
    case 'secret': return renderSecretIsland(island, body);
    case 'gate': return renderGateIsland(island, body);
    default: return;
  }
}

function dialogueBox(title, lines, continueLabel, onContinue) {
  const box = document.createElement('div');
  box.className = 'dialogue-box';
  box.innerHTML = `<p class="dialogue-title">⚓ ${title}</p>` + lines.map(l => `<p>"${l}"</p>`).join('');
  const cont = document.createElement('div');
  cont.className = 'dialogue-continue';
  const btn = document.createElement('button');
  btn.className = 'btn-gold';
  btn.textContent = continueLabel || 'Continuar →';
  btn.addEventListener('click', onContinue);
  cont.appendChild(btn);
  box.appendChild(cont);
  return box;
}

/* --- Ilha da Curiosidade: enigma inicial --- */
function renderRiddleIsland(island, body) {
  body.appendChild(dialogueBox('Diário da Capitã', [
    'O vento mudou assim que pisamos aqui...',
    'Dizem que esta ilha só deixa passar quem souber ouvir.'
  ], 'Ver o enigma →', () => {
    body.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <p class="riddle-text">Não tenho pernas, mas viajo com você.
Não tenho voz, mas guardo milhares de histórias.
Não sou um tesouro, mas posso valer mais que ouro.

O que sou?</p>
      <input type="text" class="riddle-input" id="riddle-answer" placeholder="Sua resposta..." aria-label="Resposta do enigma">
      <div class="riddle-actions">
        <button class="btn-gold" id="riddle-submit">Responder</button>
        <button class="btn-ghost" id="riddle-hint">Pedir pista (−5 berries)</button>
      </div>
      <p class="riddle-feedback" id="riddle-feedback"></p>`;
    body.appendChild(wrap);

    document.getElementById('riddle-hint').addEventListener('click', () => {
      gameState.hintsUsed++;
      gameState.berries = Math.max(0, gameState.berries - 5);
      saveProgress();
      document.getElementById('riddle-feedback').textContent = 'Pista: pense em algo guardado em uma prateleira, cheio de páginas...';
    });

    document.getElementById('riddle-submit').addEventListener('click', () => {
      solveRiddle('curiosidade-1', document.getElementById('riddle-answer').value, ['livro', 'um livro'], () => {
        gameState.riddlesSolved++;
        completeIsland('curiosidade', { attribute: 'curiosidade' });
        showChallengeSuccess(body, 'Você decifrou o vento desta ilha.', 'A curiosidade abriu o primeiro caminho.');
      });
    });
  }));
}

function solveRiddle(id, rawAnswer, validAnswers, onSuccess) {
  const feedback = document.getElementById('riddle-feedback');
  const normalized = (rawAnswer || '').trim().toLowerCase();
  const ok = validAnswers.some(v => normalized === v.toLowerCase() || (normalized.length > 2 && normalized.includes(v.toLowerCase())));
  if (ok) {
    feedback.textContent = 'Isso mesmo. O caminho se abre.';
    feedback.className = 'riddle-feedback is-success';
    onSuccess();
  } else {
    feedback.textContent = 'Até o melhor pirata erra algumas rotas.';
    feedback.className = 'riddle-feedback is-error';
  }
}

function showChallengeSuccess(body, title, sub) {
  body.innerHTML = `<div class="dialogue-box"><p class="dialogue-title">✅ ${title}</p><p>${sub}</p>
    <div class="dialogue-continue"><button class="btn-gold" id="close-after-success">Fechar</button></div></div>`;
  document.getElementById('close-after-success').addEventListener('click', () => document.getElementById('modal-island').close());
}

/* --- Ilha das Memórias: jogo da memória --- */
function startMemoryGame(island, body) {
  const symbols = ['❤️', '🌊', '⭐', '☀️', '🏴‍☠️', '💎'];
  let deck = [...symbols, ...symbols]
    .map((s, i) => ({ s, id: i }))
    .sort(() => Math.random() - 0.5);

  body.innerHTML = `<p>Vire as cartas e encontre os pares. Cada par revela uma memória.</p>
    <div class="memory-grid" id="memory-grid"></div>
    <p class="riddle-feedback" id="memory-feedback"></p>`;

  const grid = document.getElementById('memory-grid');
  let flipped = [];
  let matchedCount = 0;
  let lock = false;

  deck.forEach((card, i) => {
    const el = document.createElement('button');
    el.className = 'memory-card';
    el.dataset.symbol = card.s;
    el.dataset.index = i;
    el.setAttribute('aria-label', 'Carta virada para baixo');
    el.addEventListener('click', () => {
      if (lock || el.classList.contains('is-flipped') || el.classList.contains('is-matched')) return;
      el.classList.add('is-flipped');
      el.textContent = card.s;
      flipped.push({ el, symbol: card.s });
      if (flipped.length === 2) {
        lock = true;
        setTimeout(() => {
          if (flipped[0].symbol === flipped[1].symbol) {
            flipped.forEach(f => f.el.classList.add('is-matched'));
            matchedCount++;
            gameState.memoriesFound = Math.min(CONFIG.memorias.length, gameState.memoriesFound + 1);
            const memText = CONFIG.memorias[(matchedCount - 1) % CONFIG.memorias.length];
            document.getElementById('memory-feedback').textContent = `💭 "${memText}"`;
            saveProgress();
            if (matchedCount === symbols.length) {
              setTimeout(() => {
                completeIsland('memorias', { attribute: 'lealdade' });
                showChallengeSuccess(body, 'Você encontrou todas as memórias perdidas.', 'Elas continuam guardadas com você.');
              }, 900);
            }
          } else {
            flipped.forEach(f => { f.el.classList.remove('is-flipped'); f.el.textContent = ''; });
          }
          flipped = [];
          lock = false;
        }, 800);
      }
    });
    grid.appendChild(el);
  });
}

/* --- Ilha dos Enigmas: 3 desafios --- */
function renderEnigmasIsland(island, body) {
  const solved = { cipher: false, compass: false, lock: false };

  function renderAll() {
    body.innerHTML = `
      <p>Três segredos guardam a passagem. Resolva todos para seguir.</p>
      <div class="dialogue-box">
        <p class="dialogue-title">🔤 Código do Pirata ${solved.cipher ? '✅' : ''}</p>
        <p class="riddle-text">T-E-S-O-U-R-O, embaralhado: OTRUSEO</p>
        <p>Desembaralhe a palavra:</p>
        <input type="text" class="riddle-input" id="cipher-answer" placeholder="Sua resposta..." ${solved.cipher ? 'disabled' : ''}>
        <button class="btn-gold" id="cipher-submit" ${solved.cipher ? 'disabled' : ''}>Responder</button>
        <p class="riddle-feedback" id="cipher-feedback"></p>
      </div>
      <div class="dialogue-box">
        <p class="dialogue-title">🧭 Bússola ${solved.compass ? '✅' : ''}</p>
        <p>"O sol nasce de um lado e se despede do outro. Para chegar à próxima ilha, siga para onde ele acorda."</p>
        <div class="direction-grid">
          <span></span><button class="direction-btn" data-dir="N" ${solved.compass ? 'disabled' : ''}>N</button><span></span>
          <button class="direction-btn" data-dir="O" ${solved.compass ? 'disabled' : ''}>O</button><span>🧭</span><button class="direction-btn" data-dir="E" ${solved.compass ? 'disabled' : ''}>E</button>
          <span></span><button class="direction-btn" data-dir="S" ${solved.compass ? 'disabled' : ''}>S</button><span></span>
        </div>
        <p class="riddle-feedback" id="compass-feedback"></p>
      </div>
      <div class="dialogue-box">
        <p class="dialogue-title">🔒 Baú Trancado ${solved.lock ? '✅' : ''}</p>
        <p>"Quatro números abrem este baú — não marcam um dia, marcam o ano em que o mundo teve a sorte de te ganhar."</p>
        <div class="lock-grid">
          <input class="lock-digit" maxlength="1" inputmode="numeric" ${solved.lock ? 'disabled' : ''}>
          <input class="lock-digit" maxlength="1" inputmode="numeric" ${solved.lock ? 'disabled' : ''}>
          <input class="lock-digit" maxlength="1" inputmode="numeric" ${solved.lock ? 'disabled' : ''}>
          <input class="lock-digit" maxlength="1" inputmode="numeric" ${solved.lock ? 'disabled' : ''}>
        </div>
        <button class="btn-gold" id="lock-submit" ${solved.lock ? 'disabled' : ''}>Abrir baú</button>
        <p class="riddle-feedback" id="lock-feedback"></p>
      </div>
      <p style="opacity:.75; font-size:.85rem;">${Object.values(solved).filter(Boolean).length}/3 segredos resolvidos.</p>`;

    document.getElementById('cipher-submit').addEventListener('click', () => {
      const val = document.getElementById('cipher-answer').value.trim().toLowerCase();
      const fb = document.getElementById('cipher-feedback');
      if (val === 'tesouro') {
        solved.cipher = true; fb.textContent = 'Isso mesmo.'; fb.className = 'riddle-feedback is-success';
        checkEnigmasDone();
      } else {
        fb.textContent = 'Até o melhor pirata erra algumas rotas.'; fb.className = 'riddle-feedback is-error';
      }
    });

    document.querySelectorAll('.direction-btn').forEach(b => b.addEventListener('click', () => {
      const fb = document.getElementById('compass-feedback');
      if (b.dataset.dir === 'E') {
        solved.compass = true; fb.textContent = 'A bússola concorda com você.'; fb.className = 'riddle-feedback is-success';
        checkEnigmasDone();
      } else {
        fb.textContent = 'Até o melhor pirata erra algumas rotas.'; fb.className = 'riddle-feedback is-error';
      }
    }));

    const digits = document.querySelectorAll('.lock-digit');
    digits.forEach((d, i) => d.addEventListener('input', () => {
      d.value = d.value.replace(/\D/g, '');
      if (d.value && digits[i + 1]) digits[i + 1].focus();
    }));

    document.getElementById('lock-submit').addEventListener('click', () => {
      const entered = Array.from(digits).map(d => d.value).join('');
      const expected = (CONFIG.anoNascimento || '2008').trim();
      const fb = document.getElementById('lock-feedback');
      if (entered === expected) {
        solved.lock = true; fb.textContent = 'O baú se abre com um estalo.'; fb.className = 'riddle-feedback is-success';
        checkEnigmasDone();
      } else {
        fb.textContent = 'Até o melhor pirata erra algumas rotas.'; fb.className = 'riddle-feedback is-error';
      }
    });

    function checkEnigmasDone() {
      if (solved.cipher && solved.compass && solved.lock) {
        setTimeout(() => {
          completeIsland('enigmas', { attribute: 'coragem' });
          showChallengeSuccess(body, 'Você está chegando perto...', 'Os três segredos se abriram diante de você.');
        }, 700);
      } else {
        renderAll();
      }
    }
  }

  renderAll();
}

function parseConfigDate(str) {
  if (!str) return null;
  const parts = String(str).split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/* --- Mar da Tempestade: minijogo de clique --- */
function startStormGame(island, body) {
  body.innerHTML = `
    <p>Uma tempestade se forma. Clique nos destroços antes que o navio balance demais!</p>
    <div class="storm-hud"><span>⏱️ <span id="storm-time">10</span>s</span><span>🎯 <span id="storm-score">0</span></span></div>
    <div class="storm-field" id="storm-field"></div>`;

  const field = document.getElementById('storm-field');
  const symbols = ['🌊', '⚡', '🪵', '💨'];
  let score = 0, timeLeft = 10, spawnTimer, tickTimer;

  function spawn() {
    const item = document.createElement('button');
    item.className = 'storm-item';
    item.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    item.style.left = (Math.random() * 85) + '%';
    const duration = 1.6 + Math.random() * 1;
    item.style.animationDuration = duration + 's';
    item.setAttribute('aria-label', 'Destroço da tempestade');
    item.addEventListener('click', () => {
      score++;
      document.getElementById('storm-score').textContent = score;
      item.remove();
    });
    field.appendChild(item);
    setTimeout(() => { if (item.parentNode) item.remove(); }, duration * 1000);
  }

  spawnTimer = setInterval(spawn, 450);
  tickTimer = setInterval(() => {
    timeLeft--;
    document.getElementById('storm-time').textContent = Math.max(0, timeLeft);
    if (timeLeft <= 0) {
      clearInterval(spawnTimer);
      clearInterval(tickTimer);
      field.innerHTML = '';
      const success = score >= 8;
      gameState.berries += success ? 15 : 0;
      saveProgress();
      setTimeout(() => {
        completeIsland('tempestade', { attribute: 'aventura' });
        showChallengeSuccess(body,
          success ? 'Você salvou o navio!' : 'O mar venceu essa batalha...',
          success ? 'A tripulação respira aliviada.' : 'Mas a aventura continua — o navio segue à tona.');
      }, 400);
    }
  }, 1000);
}

/* --- Ilha do Coração: escolha + coletar corações --- */
function renderHeartIsland(island, body) {
  body.innerHTML = `
    <p>"A ilha que não aparece em nenhum mapa."</p>
    <p>Existem lugares que podem ser encontrados usando uma bússola. Existem outros que só podem ser encontrados seguindo o coração.</p>
    <p><strong>Se você pudesse escolher apenas uma coisa para levar para o fim do mundo, o que levaria?</strong></p>
    <div class="choice-list" id="heart-choices">
      <button class="choice-btn" data-choice="ouro">💰 Ouro</button>
      <button class="choice-btn" data-choice="navio">🚢 Navio</button>
      <button class="choice-btn" data-choice="aventura">🌊 Aventura</button>
      <button class="choice-btn" data-choice="pessoa">❤️ Uma pessoa especial</button>
    </div>
    <p class="riddle-feedback" id="heart-choice-feedback"></p>`;

  const RESPONSES = {
    ouro: 'O ouro brilha, mas some rápido nas mãos. Você sente que faltaria algo.',
    navio: 'Um bom navio leva você a qualquer lugar — menos ao que você mais procura.',
    aventura: 'A aventura enche os dias, mas as melhores sempre têm alguém para dividir.',
    pessoa: 'Você sorri. Talvez essa resposta já diga tudo sobre esta jornada.'
  };

  document.querySelectorAll('#heart-choices .choice-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#heart-choices .choice-btn').forEach(x => x.classList.remove('is-selected'));
      b.classList.add('is-selected');
      gameState.choices.push('heart:' + b.dataset.choice);
      const attrMap = { ouro: 'lealdade', navio: 'aventura', aventura: 'curiosidade', pessoa: 'coracao' };
      gameState.attributes[attrMap[b.dataset.choice]]++;
      saveProgress();
      document.getElementById('heart-choice-feedback').textContent = RESPONSES[b.dataset.choice];
      setTimeout(() => startHeartsMinigame(island, body), 1600);
    }, { once: true });
  });
}

function startHeartsMinigame(island, body) {
  body.innerHTML = `
    <p>Corações começam a aparecer sobre a água. Colete 10 antes que a maré os leve.</p>
    <p>❤️ <span id="hearts-count">0</span>/10</p>
    <div class="hearts-field" id="hearts-field"></div>`;

  const field = document.getElementById('hearts-field');
  let collected = 0;
  let spawnTimer;

  function spawn() {
    const heart = document.createElement('button');
    heart.className = 'floating-heart';
    heart.textContent = '❤️';
    heart.style.left = (Math.random() * 88) + '%';
    heart.style.bottom = '0px';
    const duration = 2.4 + Math.random() * 1.2;
    heart.style.animationDuration = duration + 's';
    heart.setAttribute('aria-label', 'Coração flutuante');
    heart.addEventListener('click', () => { collectHeart(heart); });
    field.appendChild(heart);
    setTimeout(() => { if (heart.parentNode) heart.remove(); }, duration * 1000);
  }

  function collectHeart(el) {
    if (!el.parentNode) return;
    el.remove();
    collected++;
    gameState.heartsCollected++;
    document.getElementById('hearts-count').textContent = collected;
    if (collected >= 10) {
      clearInterval(spawnTimer);
      field.innerHTML = '';
      saveProgress();
      completeIsland('coracao', { attribute: 'coracao', berries: 30 });
      showChallengeSuccess(body, 'Você coletou todas as partes do mapa.', 'O coração da ilha reconhece o seu.');
    }
  }

  spawnTimer = setInterval(spawn, 550);
}

/* --- Arquipélago dos Sonhos: escolha de caminho + pergunta pessoal --- */
function renderDreamsIsland(island, body) {
  body.innerHTML = `
    <p>Três caminhos se abrem entre as estrelas caídas no mar.</p>
    <p><strong>Qual caminho você escolheria?</strong></p>
    <div class="choice-list" id="dream-choices">
      <button class="choice-btn" data-choice="heart">❤️ Caminho do Coração</button>
      <button class="choice-btn" data-choice="adventure">🌊 Caminho da Aventura</button>
      <button class="choice-btn" data-choice="memory">⭐ Caminho das Memórias</button>
    </div>`;

  document.querySelectorAll('#dream-choices .choice-btn').forEach(b => {
    b.addEventListener('click', () => {
      gameState.choices.push('dream:' + b.dataset.choice);
      const attrMap = { heart: 'coracao', adventure: 'aventura', memory: 'lealdade' };
      gameState.attributes[attrMap[b.dataset.choice]]++;
      saveProgress();
      renderDreamsRiddle(island, body);
    }, { once: true });
  });
}

function renderDreamsRiddle(island, body) {
  body.innerHTML = `
    <p>Uma última pergunta ecoa antes do caminho se revelar por completo:</p>
    <p class="riddle-text">Qual é a coisa mais linda em você?</p>
    <input type="text" class="riddle-input" id="dream-answer" placeholder="Sua resposta...">
    <div class="riddle-actions">
      <button class="btn-gold" id="dream-submit">Responder</button>
      <button class="btn-ghost" id="dream-skip">Pular (sem pista extra)</button>
    </div>
    <p class="riddle-feedback" id="dream-feedback"></p>`;

  function finish() {
    completeIsland('sonhos', { attribute: 'curiosidade' });
    showChallengeSuccess(body, 'O céu se abre diante de você.', 'Os sonhos deste arquipélago são, de alguma forma, seus também.');
  }

  document.getElementById('dream-submit').addEventListener('click', () => {
    const val = document.getElementById('dream-answer').value.trim().toLowerCase();
    const expected = (CONFIG.comidaFavorita || '').trim().toLowerCase();
    const fb = document.getElementById('dream-feedback');
    if (expected && expected !== 'comida_favorita' && val.includes(expected)) {
      fb.textContent = 'Exatamente isso.'; fb.className = 'riddle-feedback is-success';
      setTimeout(finish, 900);
    } else {
      fb.textContent = 'Não importa a resposta certa — o caminho se abre de qualquer forma.'; fb.className = 'riddle-feedback is-success';
      setTimeout(finish, 900);
    }
  });
  document.getElementById('dream-skip').addEventListener('click', finish);
}

/* --- Ilha Secreta --- */
function renderSecretIsland(island, body) {
  body.innerHTML = `
    <p>Esta ilha não está em nenhum mapa conhecido.</p>
    <p class="riddle-text">O que achou do nosso primeiro beijo?</p>
    <input type="text" class="riddle-input" id="secret-answer" placeholder="Sua resposta...">
    <div class="riddle-actions">
      <button class="btn-gold" id="secret-submit">Responder</button>
    </div>
    <p class="riddle-feedback" id="secret-feedback"></p>`;

  document.getElementById('secret-submit').addEventListener('click', () => {
    const val = document.getElementById('secret-answer').value.trim().toLowerCase();
    const expected = (CONFIG.primeiroEncontro || '').trim().toLowerCase();
    const fb = document.getElementById('secret-feedback');
    const ok = expected && expected !== 'lugar_do_primeiro_encontro' ? val.includes(expected) : val.length > 0;
    if (ok) {
      fb.textContent = 'Algumas memórias parecem mais valiosas que ouro.'; fb.className = 'riddle-feedback is-success';
      setTimeout(() => {
        completeIsland('secreta', { attribute: 'lealdade', berries: 25 });
        showChallengeSuccess(body, 'Você encontrou o que ninguém mais encontraria.', 'Nem todo tesouro precisa de um mapa.');
      }, 900);
    } else {
      fb.textContent = 'Até o melhor pirata erra algumas rotas.'; fb.className = 'riddle-feedback is-error';
    }
  });
}

/* --- Portal para Laugh Tale --- */
function renderGateIsland(island, body) {
  body.innerHTML = `
    <p>O vento muda de direção. O ar fica mais pesado — não de medo, mas de expectativa.</p>
    <p>Depois de tudo o que você atravessou, resta apenas um último trecho de mar.</p>
    <div class="dialogue-continue">
      <button class="btn-gold" id="btn-zarpar">Zarpar para Laugh Tale ⚓</button>
    </div>`;
  document.getElementById('btn-zarpar').addEventListener('click', () => {
    document.getElementById('modal-island').close();
    completeIsland('laughtale-gate', { attribute: 'aventura' });
  });
}

/* ============================================================
   6. HUD / DIÁRIO / CARTAS / EASTER EGGS
   ============================================================ */

function updateHUDStats() {
  document.getElementById('stat-berries').textContent = gameState.berries;
  document.getElementById('stat-fragments').textContent = gameState.fragmentsFound;
}

function updateBondMeter() {
  const total = ISLANDS.length;
  const pct = Math.round((gameState.completedIslands.length / total) * 100);
  document.getElementById('bond-fill').style.width = pct + '%';
  document.getElementById('bond-percent').textContent = pct + '%';
  const captions = [
    [0, 'O vento ainda nem começou a soprar.'],
    [20, 'Algo em você quer continuar navegando.'],
    [45, 'Algumas memórias parecem mais valiosas que ouro.'],
    [70, 'O coração já sabe para onde este mapa está indo.'],
    [99, 'Falta muito pouco...'],
    [100, 'Algumas coisas não podem ser medidas por uma barra.']
  ];
  let caption = captions[0][1];
  for (const [threshold, text] of captions) if (pct >= threshold) caption = text;
  document.getElementById('bond-caption').textContent = caption;
}

function updateDiary() {
  const list = document.getElementById('diary-list');
  list.innerHTML = '';

  const chapters = [
    { title: 'Capítulo 01 — O Chamado', status: '✓' },
    { title: 'Capítulo 02 — O Mapa Perdido', status: '✓' },
    ...ISLANDS.filter(isIslandVisible).map(island => ({
      title: island.chapter,
      status: isIslandComplete(island) ? '✓' : isIslandUnlocked(island) ? '✨ disponível' : '🔒'
    }))
  ];

  chapters.forEach(ch => {
    const div = document.createElement('div');
    div.className = 'diary-chapter';
    div.innerHTML = `<p class="diary-chapter-title">${ch.title}</p><p class="diary-chapter-status">${ch.status}</p>`;
    list.appendChild(div);
  });

  if (gameState.cartasUnlocked.length) {
    const cartasHeader = document.createElement('div');
    cartasHeader.className = 'diary-chapter';
    cartasHeader.innerHTML = `<p class="diary-chapter-title">💌 Cartas encontradas</p>`;
    list.appendChild(cartasHeader);
    gameState.cartasUnlocked.forEach(i => {
      const carta = CONFIG.cartas[i];
      if (!carta) return;
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.style.marginBottom = '8px';
      btn.textContent = carta.titulo;
      btn.addEventListener('click', () => openLetterModal(carta.titulo, carta.texto));
      list.appendChild(btn);
    });
  }

  if (gameState.photosUnlocked.length) {
    const photoHeader = document.createElement('div');
    photoHeader.className = 'diary-chapter';
    photoHeader.innerHTML = `<p class="diary-chapter-title">📸 Fotos encontradas</p>`;
    list.appendChild(photoHeader);
    const gallery = document.createElement('div');
    gallery.style.cssText = 'display:flex; gap:8px; flex-wrap:wrap;';
    gameState.photosUnlocked.forEach(i => {
      const foto = CONFIG.fotos[i];
      if (!foto) return;
      const img = document.createElement('img');
      img.src = foto.src;
      img.alt = foto.legenda || 'Foto especial';
      img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:6px;border:2px solid var(--gold);';
      img.onerror = () => img.remove();
      gallery.appendChild(img);
    });
    list.appendChild(gallery);
  }

  const passwordDiv = document.createElement('div');
  passwordDiv.className = 'diary-chapter';
  const word = (CONFIG.palavraSecreta || '').toUpperCase();
  const revealed = gameState.unlockedLetters.join('');
  const display = word.split('').map((_, i) => i < revealed.length ? word[i] : '_').join(' ');
  passwordDiv.innerHTML = `<p class="diary-chapter-title">🔐 Senha do tesouro</p><p class="diary-chapter-status">${display}</p>`;
  list.appendChild(passwordDiv);
}

function openLetterModal(title, text) {
  document.getElementById('modal-letter-title').textContent = title;
  document.getElementById('modal-letter-body').innerHTML = `<p>${text}</p>`;
  document.getElementById('modal-letter').showModal();
}

/* --- Easter eggs --- */
function onConstellationStarClick() {
  const star = this;
  if (star.dataset.found === 'true') return;
  star.dataset.found = 'true';
  star.style.background = 'var(--gold)';
  star.style.boxShadow = '0 0 10px 4px rgba(214,168,79,0.8)';
  if (!gameState.constellationFound.includes(star)) gameState.constellationFound.push(true);
  if (document.querySelectorAll('.star-clickable[data-found="true"]').length === document.querySelectorAll('.star-clickable').length) {
    showToast('Você encontrou uma mensagem entre as estrelas.');
    if (!gameState.easterEggs.includes('constellation')) {
      gameState.easterEggs.push('constellation');
      saveProgress();
    }
  }
}

function setupMoonEasterEgg() {
  document.getElementById('moon').style.pointerEvents = 'auto';
  document.getElementById('moon').style.cursor = 'pointer';
  document.getElementById('moon').addEventListener('click', () => {
    gameState.moonClicks++;
    if (gameState.moonClicks === 5) {
      showToast('Você encontrou uma mensagem escondida na noite.');
      if (!gameState.easterEggs.includes('moon')) {
        gameState.easterEggs.push('moon');
        saveProgress();
      }
    }
  });
}

function setupCompassEasterEgg() {
  const compass = document.getElementById('compass');
  const needle = compass.querySelector('.compass-needle');
  let spinning = false;
  function trigger() {
    const now = Date.now();
    gameState.compassClicks.push(now);
    gameState.compassClicks = gameState.compassClicks.filter(t => now - t < 2500);
    if (gameState.compassClicks.length >= 6 && !spinning) {
      spinning = true;
      needle.style.transition = 'transform 1.4s linear';
      let angle = 0;
      const spin = setInterval(() => {
        angle += 90;
        needle.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      }, 200);
      showToast('Até a bússola se perde quando tenta encontrar você.');
      if (!gameState.easterEggs.includes('compass')) {
        gameState.easterEggs.push('compass');
        saveProgress();
      }
      setTimeout(() => { clearInterval(spin); spinning = false; needle.style.transform = 'translate(-50%, -100%) rotate(0deg)'; }, 3600);
    } else {
      const dirs = [0, 45, -30, 60, -60, 20];
      needle.style.transform = `translate(-50%, -100%) rotate(${dirs[gameState.compassClicks.length % dirs.length]}deg)`;
    }
  }
  compass.addEventListener('click', trigger);
  compass.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') trigger(); });
}

let bottleTimer = null;
function scheduleBottle() {
  clearTimeout(bottleTimer);
  bottleTimer = setTimeout(() => {
    if (!document.getElementById('screen-map').classList.contains('hidden')) showBottle();
    scheduleBottle();
  }, 45000 + Math.random() * 40000);
}

function showBottle() {
  const bottle = document.getElementById('bottle');
  bottle.classList.remove('hidden');
  bottle.style.animation = 'none';
  void bottle.offsetWidth;
  bottle.style.animation = '';
  const onEnd = () => bottle.classList.add('hidden');
  bottle.addEventListener('animationend', onEnd, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bottle').addEventListener('click', () => {
    document.getElementById('bottle').classList.add('hidden');
    openLetterModal('🍾 Uma mensagem no mar', CONFIG.mensagemGarrafa);
  });
});

/* ============================================================
   7. MÚSICA
   ============================================================ */

let musicOn = false;
let currentTrackId = 'audio-menu';

function pickTrackForScreen(screenId) {
  if (screenId === 'screen-chest' || screenId === 'screen-final' || screenId === 'screen-laughtale') return 'audio-romantica';
  if (screenId === 'screen-map') return 'audio-aventura';
  return 'audio-menu';
}

function playTrack(id) {
  if (!musicOn) return;
  if (currentTrackId === id) return;
  ['audio-menu', 'audio-aventura', 'audio-romantica'].forEach(t => {
    const el = document.getElementById(t);
    if (t === id) {
      el.volume = 0;
      el.play().catch(() => {});
      let v = 0;
      const fade = setInterval(() => {
        v += 0.05;
        el.volume = Math.min(0.5, v);
        if (v >= 0.5) clearInterval(fade);
      }, 80);
    } else if (!el.paused) {
      let v = el.volume;
      const fade = setInterval(() => {
        v -= 0.08;
        if (v <= 0) { el.volume = 0; el.pause(); clearInterval(fade); }
        else el.volume = v;
      }, 80);
    }
  });
  currentTrackId = id;
}

function setupMusicToggle() {
  const btn = document.getElementById('btn-music');
  btn.classList.add('is-off');
  btn.addEventListener('click', () => {
    musicOn = !musicOn;
    btn.classList.toggle('is-off', !musicOn);
    btn.textContent = musicOn ? '🎵' : '🔇';
    if (musicOn) playTrack(currentTrackId); else {
      ['audio-menu', 'audio-aventura', 'audio-romantica'].forEach(t => document.getElementById(t).pause());
    }
  });
}

/* ============================================================
   8. NAVEGAÇÃO ENTRE TELAS / INÍCIO DA JORNADA
   ============================================================ */

function goToScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  gameState.screen = id;
  saveProgress();
  playTrack(pickTrackForScreen(id));
}

function startAdventure() {
  goToScreen('screen-map');
  document.getElementById('hud-progress').classList.remove('hud-hidden');
  updateMap();
  placeShipInitial();
  centerOn(currentFocusPoint(), false);
  scheduleBottle();
}

function setupOpening() {
  document.getElementById('btn-accept').addEventListener('click', () => {
    goToScreen('screen-letter');
  });
  document.getElementById('btn-start-journey').addEventListener('click', () => {
    startAdventure();
  });
}

/* ============================================================
   9. LAUGH TALE / BAÚ / FINAL
   ============================================================ */

function startLaughTale() {
  goToScreen('screen-laughtale');
}

function setupChestFlow() {
  document.getElementById('btn-open-x').addEventListener('click', () => {
    goToScreen('screen-chest');
    setTimeout(() => {
      const chest = document.getElementById('chest');
      chest.classList.add('is-shaking');
      setTimeout(() => openTreasure(), 600);
    }, 400);
  });

  document.getElementById('btn-see-summary').addEventListener('click', () => {
    goToScreen('screen-final');
    renderFinalSummary();
    startFireworks();
    startRelationshipCounter();
  });
}

function openTreasure() {
  const chest = document.getElementById('chest');
  chest.classList.remove('is-shaking');
  chest.classList.add('is-open');

  const letter = document.getElementById('final-letter');
  document.getElementById('final-letter-title').textContent = `Querida ${CONFIG.nome !== 'NOME_DA_PESSOA' ? CONFIG.nome : ''},`.trim();
  const body = document.getElementById('final-letter-body');
  body.innerHTML = CONFIG.mensagemFinal.map(l => `<p>${l}</p>`).join('') +
    `<p style="font-family:var(--font-display); font-size:1.3rem; color:var(--wood); margin-top:16px;">${CONFIG.mensagemFinalDestaque}</p>`;

  setTimeout(() => letter.classList.remove('hidden'), 900);
}

const ATTRIBUTE_TITLES = {
  coracao: '❤️ Navegante do Coração',
  coragem: '⚔️ Guardiã da Coragem',
  curiosidade: '🧭 Exploradora de Memórias',
  aventura: '🌊 Capitã da Aventura',
  lealdade: '⭐ Guardiã da Lealdade'
};

function renderFinalSummary() {
  const totalIslands = ISLANDS.length;
  const attrs = gameState.attributes;
  const topAttr = Object.keys(attrs).reduce((a, b) => (attrs[b] > attrs[a] ? b : a), 'coracao');
  const title = ATTRIBUTE_TITLES[topAttr];

  document.getElementById('summary-card').textContent =
`🏴‍☠️ AVENTURA CONCLUÍDA

Ilhas exploradas: ${gameState.completedIslands.length}/${totalIslands}
Memórias encontradas: ${gameState.memoriesFound}/${CONFIG.memorias.length}
Enigmas resolvidos: ${gameState.riddlesSolved}
Easter Eggs: ${gameState.easterEggs.length}/5
Fragmentos: ${gameState.fragmentsFound}/${totalIslands}

❤️ Vínculo: ${Math.round((gameState.completedIslands.length / totalIslands) * 100)}%

Título conquistado:
"${title.toUpperCase()}"`;

  const btnClue = document.getElementById('btn-final-clue');
  if (CONFIG.finalPhysicalClue && CONFIG.finalPhysicalClue.trim()) {
    btnClue.classList.remove('hidden');
    btnClue.addEventListener('click', () => {
      const box = document.getElementById('final-clue-box');
      box.classList.remove('hidden');
      let html = `<p>"O tesouro foi encontrado."</p><p>"Mas existe algo que não cabe dentro de um navegador."</p><p>"Sua última pista está esperando por você."</p><p style="margin-top:10px;"><strong>${CONFIG.finalPhysicalClue}</strong></p>`;
      if (CONFIG.qrCodeUrl && CONFIG.qrCodeUrl.trim()) {
        html += `<p style="margin-top:10px;">📍 <a href="${CONFIG.qrCodeUrl}" target="_blank" rel="noopener" style="color:var(--gold);">Existe uma última pista</a></p>`;
      }
      box.innerHTML = html;
    }, { once: true });
  }
}

function startRelationshipCounter() {
  const start = parseConfigDate(CONFIG.dataInicio);
  const el = document.getElementById('relationship-counter');
  if (!start || isNaN(start.getTime())) { el.textContent = ''; return; }

  function tick() {
    const now = new Date();
    let diffMs = now - start;
    if (diffMs < 0) diffMs = 0;
    const seconds = Math.floor(diffMs / 1000);
    const years = Math.floor(seconds / (365.25 * 24 * 3600));
    const afterYears = seconds - Math.floor(years * 365.25 * 24 * 3600);
    const months = Math.floor(afterYears / (30.44 * 24 * 3600));
    const afterMonths = afterYears - Math.floor(months * 30.44 * 24 * 3600);
    const days = Math.floor(afterMonths / 86400);
    const afterDays = afterMonths - days * 86400;
    const hours = Math.floor(afterDays / 3600);
    const minutes = Math.floor((afterDays % 3600) / 60);
    const secs = Math.floor(afterDays % 60);

    el.innerHTML = `Nossa aventura começou há:<br>
      ${years} anos, ${months} meses, ${days} dias<br>
      ${hours}h ${minutes}m ${secs}s`;
  }
  tick();
  setInterval(tick, 1000);
}

/* --- Fogos de artifício (canvas simples) --- */
function startFireworks() {
  if (REDUCED_MOTION) return;
  const canvas = document.getElementById('fireworks');
  const resize = () => { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; };
  resize();
  window.addEventListener('resize', resize);
  const ctx = canvas.getContext('2d');
  let particles = [];
  const colors = ['#d6a84f', '#d94f70', '#fff4d6', '#d97852'];

  function burst(x, y) {
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const speed = 1.5 + Math.random() * 2.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life--;
      ctx.globalAlpha = Math.max(0, p.life / 80);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(loop);
  }
  loop();

  burst(canvas.width * 0.5, canvas.height * 0.35);
  const interval = setInterval(() => {
    burst(canvas.width * (0.2 + Math.random() * 0.6), canvas.height * (0.2 + Math.random() * 0.4));
  }, 1400);
  setTimeout(() => clearInterval(interval), 14000);
}

/* ============================================================
   10. MODAIS GENÉRICOS / CONFIGURAÇÃO DE UI
   ============================================================ */

function setupModals() {
  document.getElementById('modal-island-close').addEventListener('click', () => document.getElementById('modal-island').close());
  document.getElementById('modal-diary-close').addEventListener('click', () => document.getElementById('modal-diary').close());
  document.getElementById('modal-letter-close').addEventListener('click', () => document.getElementById('modal-letter').close());

  document.getElementById('btn-diary').addEventListener('click', () => {
    updateDiary();
    document.getElementById('modal-diary').showModal();
  });

  const resetModal = document.getElementById('modal-reset');
  document.getElementById('btn-reset-cancel').addEventListener('click', () => resetModal.close());
  document.getElementById('btn-reset-confirm').addEventListener('click', () => resetGame());
  document.getElementById('btn-restart').addEventListener('click', () => resetModal.showModal());

  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  });
}

/* ============================================================
   11. BOOT
   ============================================================ */

function boot() {
  createStars();
  createClouds();
  createParticles();
  updateClock();
  setInterval(updateClock, 15000);

  setupOpening();
  setupChestFlow();
  setupModals();
  setupMapDrag();
  setupMoonEasterEgg();
  setupCompassEasterEgg();
  setupMusicToggle();

  const hadProgress = loadProgress();

  if (hadProgress && gameState.screen && gameState.screen !== 'opening' && gameState.screen !== 'screen-letter') {
    if (gameState.screen === 'screen-map' || gameState.completedIslands.length) {
      goToScreen('screen-map');
      document.getElementById('hud-progress').classList.remove('hud-hidden');
      updateMap();
      placeShipInitial();
      centerOn(currentFocusPoint(), false);
      scheduleBottle();
    } else {
      goToScreen(gameState.screen);
    }
  } else {
    goToScreen('screen-opening');
  }
}

window.addEventListener('resize', () => { if (!document.getElementById('screen-map').classList.contains('hidden')) clampOffset(); });

document.addEventListener('DOMContentLoaded', boot);