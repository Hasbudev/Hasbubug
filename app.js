// app.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, query, where, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth,
  signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


/** =========================
 *  0) Firebase config
 *  ========================= */
const FIREBASE_CONFIG = {
  // TODO: colle ici la config de ton projet Firebase (Settings > SDK setup and configuration)
  apiKey: "AIzaSyBf3yCYdvjmkm1ytl9MAwYTpAJBbAyAC_8",
  authDomain: "hasbubug.firebaseapp.com",
  projectId: "hasbubug",
  appId: "1:444496450425:web:b2c9afd83bb06722c1d5a8",
};

const CURRENT_WEEK = 1; // <-- tu changes à la main chaque semaine

const DISCORD_CLIENT_ID = "1469008258558722183";
const DISCORD_AUTH_ENDPOINT = "https://discordauth-vrky2p236a-uc.a.run.app";
const DISCORD_REDIRECT_URI = "https://hasbudev.github.io/Hasbubug/";

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

/** =========================
 *  1) Data: zones & questions
 *  ========================= */

const ZONES = {
  zone1: [
    { name: "Coconfort",  id: 11,  count: 10 },
    { name: "Chenipan",   id: 10,  count: 5  },
    { name: "Aspicot",    id: 13,  count: 4  },
    { name: "Scarabrute", id: 127, count: 1  },
  ],
  zone2: [
    { name: "Coxyclaque", id: 49,  count: 5 },
    { name: "Yanma",      id: 193, count: 6 },
    { name: "Mimitoss",   id: 48,  count: 3 },
    { name: "Scarabrute", id: 127, count: 2 },
    { name: "Parasect",   id: 47,  count: 3 },
    { name: "Scarinho",   id: 214, count: 1 },
  ],
  zone3: [
    { name: "Parasect",   id: 47,  count: 5 },
    { name: "Scarabrute", id: 127, count: 5 },
    { name: "Mimitoss",   id: 48,  count: 5 },
    { name: "Scarinho",   id: 214, count: 3 },
    { name: "Insécateur", id: 123, count: 2 },
  ],
  zone4: [
    { name: "Insécateur",   id: 123, count: 6 },
    { name: "Scarinho",     id: 214, count: 6 },
    { name: "Caratroc",     id: 213, count: 3 },
    { name: "Pomdepik",     id: 204, count: 3 },
    { name: "Grillepattes", id: 850, count: 1 },
    { name: "Sovkipou",     id: 767, count: 1 },
  ],
};

const QUESTIONS = {
  zone1: [
    { id: "z1_q1", q: "Combien de faiblesses possède le type Insecte en 9ème génération ?", choices: ["2", "3", "4", "5"], answerIndex: 1 },
    { id: "z1_q2", q: "Quelle est la BST maximale que possède un Pokémon de type Insecte ? (hors légendaires et méga-évolutions)", choices: ["540", "550", "570", "600"], answerIndex: 2 },
    { id: "z1_q3", q: "Combien de Pokémon de type Insecte sont affublés du sigle OU en 9ème génération ?", choices: ["0", "1", "2", "3"], answerIndex: 0 },
    { id: "z1_q4", q: "Combien de Pokémon de type Insecte sont affublés du signe UU en 9ème génération ?", choices: ["1", "2", "3", "4"], answerIndex: 2 },
  ],

  zone2: [
    { id: "z2_q1", q: "Quelle est la seule capacité de type Insecte pouvant empoisonner ?", choices: ["Dard-Nuée", "Double Dard", "Piqûre", "Plaie-Croix"], answerIndex: 1 },
    { id: "z2_q2", q: "Comment est appelé le type Insecte dans les pays anglophones ?", choices: ["Insect", "Bug", "Crawler", "Beetle"], answerIndex: 1 },
    { id: "z2_q3", q: "Quel talent booste les attaques Insecte quand le Pokémon a moins d’un tiers de ses PV ?", choices: ["Essaim", "Agitation", "Adaptabilité", "Turbo"], answerIndex: 0 },
    { id: "z2_q4", q: "Quel item booste de 20% les dégâts des capacités de type Insecte ?", choices: ["Poudre Argentée", "Bandeau Choix", "Ceinture Force", "Restes"], answerIndex: 0 },
  ],

  zone3: [
    { id: "z3_q1", q: "Quel est le talent uniquement possédé par des Pokémon Insecte qui augmente la précision des capacités de son utilisateur ?", choices: ["Sniper", "Annule Garde", "Œil Composé", "Technicien"], answerIndex: 2 },
    { id: "z3_q2", q: "Quel est le nom de l’attaque Z de type Insecte ?", choices: ["Cocon Fatal", "Dard Mortel", "Essaim Suprême", "Toile Explosive"], answerIndex: 0 },
    { id: "z3_q3", q: "Quel est le nom de la capacité d’Entry Hazard du type Insecte ?", choices: ["Picots", "Pics Toxik", "Toile Gluante", "Piège de Roc"], answerIndex: 2 },
    { id: "z3_q4", q: "Quelle capacité Nosférapti possédait dès le départ en 3ème génération, mais qu’il ne peut avoir qu’au niveau 55 en 8ème génération ?", choices: ["Cru-Ailes", "Vampirisme", "Morsure", "Acrobatie"], answerIndex: 1 },
  ],

  zone4: [
    { id: "z4_q1", q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique de PV la plus élevée ?", choices: ["Mouscoto", "Cancrelove", "Pyrax", "Scolocendre"], answerIndex: 0 },
    { id: "z4_q2", q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique d’attaque la plus élevée ?", choices: ["Cizayox", "Mouscoto", "Scarhino", "Fermite"], answerIndex: 1 },
    { id: "z4_q3", q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique de défense la plus élevée ?", choices: ["Foretress", "Caratroc", "Chrysapile", "Crabaraque"], answerIndex: 1 },
    { id: "z4_q4", q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique de vitesse la plus élevée ?", choices: ["Ninjask", "Yanmega", "Papinox", "Mimigal"], answerIndex: 0 },
  ],
};

const ZONE_KEYS = ["zone1", "zone2", "zone3", "zone4"];

/** =========================
 *  Rarity & visual config
 *  ========================= */
const ZONE_RARITY = {
  zone1: { label: "Commun",    color: "#a8b3cf", glow: "rgba(168,179,207,0.4)",  particle: false },
  zone2: { label: "Peu commun",color: "#48ff9a", glow: "rgba(72,255,154,0.45)",  particle: false },
  zone3: { label: "Rare",      color: "#6ee7ff", glow: "rgba(110,231,255,0.5)",  particle: true  },
  zone4: { label: "Très rare", color: "#fbbf24", glow: "rgba(251,191,36,0.6)",   particle: true  },
};

const POKEBALL_BY_ZONE = {
  zone1: { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",   alt: "Pokéball"     },
  zone2: { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",  alt: "Super Ball"   },
  zone3: { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png",  alt: "Hyper Ball"   },
  zone4: { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", alt: "Master Ball"  },
};

const SHINY_CHANCE = 50; // 1 in 50

function isShiny(uid, weekNumber, zoneKey, numberPicked) {
  const seed = hashStringToUint32(`shiny|${uid}|W${weekNumber}|${zoneKey}|${numberPicked}`);
  return (seed % SHINY_CHANCE) === 0;
}

function pokemonShinyUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
}

/** =========================
 *  2) UI helpers
 *  ========================= */
const screen = document.getElementById("screen");
const statusEl = document.getElementById("status");

function setStatus(text) {
  statusEl.textContent = text;
}
function render(html) {
  screen.innerHTML = html;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function pokemonImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** =========================
 *  3) Utils: weekId + RNG seed
 *  ========================= */
function getISOWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}

function hashStringToUint32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function makeRng(seedUint32) {
  let x = seedUint32 || 123456789;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}
function shuffleSeeded(arr, seedStr) {
  const rng = makeRng(hashStringToUint32(seedStr));
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSlots(zoneKey) {
  const slots = [];
  for (const p of ZONES[zoneKey]) {
    for (let i = 0; i < p.count; i++) slots.push({ name: p.name, id: p.id });
  }
  if (slots.length !== 20) throw new Error(`Zone ${zoneKey} doit faire 20 slots, actuellement ${slots.length}.`);
  return slots;
}

function drawPokemon({ uid, weekNumber, zoneKey, numberPicked }) {
  const slots = buildSlots(zoneKey);
  const shuffled = shuffleSeeded(slots, `${uid}|W${weekNumber}|${zoneKey}`);
  return shuffled[numberPicked - 1];
}

/** =========================
 *  4) Firestore helpers
 *  ========================= */
async function getOrCreateUser(uid, pseudo) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();

  const base = {
    pseudo,
    createdAt: serverTimestamp(),
    usedQuestionIds: { zone1: [], zone2: [], zone3: [], zone4: [] },
  };
  await setDoc(ref, base);
  return base;
}

async function updatePseudo(uid, pseudo) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { pseudo });
}

async function hasPlayedThisWeek(uid, weekNumber) {
  const playRef = doc(db, "plays", `${uid}_W${weekNumber}`);
  const snap = await getDoc(playRef);
  return snap.exists();
}

async function savePlay({ uid, pseudo, weekNumber, zoneReached, failedAtZone, pokemon, numberPicked, questionsShown, shiny }) {
  const playRef = doc(db, "plays", `${uid}_W${weekNumber}`);
  await setDoc(playRef, {
    uid,
    pseudo,
    weekNumber,
    zoneReached,
    failedAtZone,
    pokemon,
    numberPicked,
    questionsShown,
    shiny: shiny || false,
    createdAt: serverTimestamp(),
  });
}

async function markQuestionUsed(uid, zoneKey, questionId) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const data = snap.data();
  const used = data?.usedQuestionIds?.[zoneKey] || [];
  if (used.includes(questionId)) return;

  const next = used.concat(questionId);
  await updateDoc(userRef, { [`usedQuestionIds.${zoneKey}`]: next });
}

function pickQuestion(zoneKey, usedIds) {
  const pool = QUESTIONS[zoneKey];
  const safeUsedIds = usedIds || [];                              
  const fresh = pool.filter(q => !safeUsedIds.includes(q.id));   
  const choicePool = fresh.length ? fresh : pool;
  return choicePool[Math.floor(Math.random() * choicePool.length)];
}

/** =========================
 *  5) Game state
 *  ========================= */
const state = {
  uid: null,
  pseudo: null,
  weekNumber: CURRENT_WEEK,
  // progression
  currentZoneIndex: 0,
  stopped: false,
  failedAtZoneIndex: null,
  questionsShown: {},
  // question en cours
  currentQuestion: null,
  // user data
  usedQuestionIds: { zone1: [], zone2: [], zone3: [], zone4: [] },
  // shiny flag for current draw
  shiny: false,
};

function zoneKeyAt(i) { return ZONE_KEYS[i]; }

/** =========================
 *  6) Screens
 *  ========================= */
function screenPseudo() {
  render(`
    <h2 class="big">Connexion requise</h2>

    <div class="row" style="justify-content:center">
      <button id="discordBtn" class="primary big-btn">
        🔗 Se connecter avec Discord
      </button>
    </div>

    <p class="muted" style="text-align:center;margin-top:12px">
      Connexion obligatoire pour éviter la triche.
    </p>
  `);

  document.getElementById("discordBtn").onclick = () => {
    const st = crypto.randomUUID();
    localStorage.setItem("discordState", st);

    const authUrl = new URL("https://discord.com/api/oauth2/authorize");
    authUrl.searchParams.set("client_id", DISCORD_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", DISCORD_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "identify");
    authUrl.searchParams.set("state", st);

    window.location.href = authUrl.toString();
  };
}

function screenBlocked() {
  render(`
    <div class="row" style="justify-content: space-between;">
      <div class="badge danger">Déjà joué cette semaine</div>
      <div class="badge">Semaine: ${esc(state.weekNumber)}</div>
    </div>
    <div class="hr"></div>
    <h2 class="big">Tu as déjà fait ton tirage cette semaine.</h2>
    <p class="muted">Reviens la semaine prochaine pour retenter ta chance (avec d'autres questions).</p>
    <div style="margin-top:16px">
      <button id="lbBtn" class="primary">📊 Voir le classement de la semaine</button>
    </div>
  `);
  document.getElementById("lbBtn").onclick = () => screenLeaderboard();
}

let _questionTimer = null;
const QUESTION_TIME = 20;
let _activeQuestion = false; // true only while a question is on screen

function clearQuestionTimer() {
  if (_questionTimer) { clearInterval(_questionTimer); _questionTimer = null; }
}

// ── Anti-cheat: visibility & blur ────────────────────────────────────────────
function _onCheatDetected() {
  if (!_activeQuestion) return;
  _activeQuestion = false;
  clearQuestionTimer();

  // Flash the screen red briefly
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(255,60,60,0.18);z-index:9999;pointer-events:none;transition:opacity 0.6s";
  document.body.appendChild(overlay);
  setTimeout(() => { overlay.style.opacity = "0"; setTimeout(() => overlay.remove(), 700); }, 400);

  // Disable all choice buttons
  screen.querySelectorAll("button.choice").forEach(b => b.classList.add("disabled", "timeout"));

  // Show warning label if still visible
  const secEl = document.getElementById("timerSec");
  const lblEl = document.getElementById("timerLabel");
  if (secEl) secEl.textContent = "Triche détectée !";
  if (lblEl) lblEl.classList.add("urgent");

  setTimeout(() => answerQuestion(-1), 1200);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) _onCheatDetected();
});
window.addEventListener("blur", () => {
  // blur fires when the window loses focus (alt-tab, new window, devtools...)
  _onCheatDetected();
});
// ─────────────────────────────────────────────────────────────────────────────

function screenQuestion() {
  const zoneKey = zoneKeyAt(state.currentZoneIndex);
  const q = state.currentQuestion;
  clearQuestionTimer();
  _activeQuestion = true;

  render(`
    <div class="row" style="justify-content: space-between;">
      <div class="badge">Pseudo: <b>${esc(state.pseudo)}</b></div>
      <div class="badge">Zone: <b>${esc(zoneKey.toUpperCase())}</b></div>
      <div class="badge">Semaine: <b>${esc(state.weekNumber)}</b></div>
    </div>

    <div class="hr"></div>

    <style>
      .timer-bar-wrap {
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.08);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 14px;
      }
      .timer-bar {
        height: 100%;
        width: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #48ff9a, #6ee7ff);
        transition: width 1s linear, background 1s linear;
      }
      .timer-label {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        font-size: 13px;
        font-variant-numeric: tabular-nums;
        margin-bottom: 6px;
        color: var(--muted);
        transition: color 0.4s;
      }
      @keyframes timer-pulse {
        0%,100% { transform: scale(1); }
        50%      { transform: scale(1.2); }
      }
      .timer-label.urgent { color: var(--danger); }
      .timer-label.urgent .timer-icon { animation: timer-pulse 0.5s ease-in-out infinite; }
      .choice.disabled { opacity: 0.45; pointer-events: none; }
      .choice.timeout  { border-color: rgba(255,107,107,0.5) !important; background: rgba(255,107,107,0.08) !important; }
    </style>

    <div class="timer-label" id="timerLabel"><span class="timer-icon">⏱</span><span id="timerSec">${QUESTION_TIME}s</span></div>
    <div class="timer-bar-wrap">
      <div class="timer-bar" id="timerBar"></div>
    </div>

    <h2 class="big">${esc(q.q)}</h2>
    <div class="grid">
      ${q.choices.map((c, idx) => `
        <button class="choice" data-idx="${idx}">
          ${esc(c)}
        </button>
      `).join("")}
    </div>

    <div class="hr"></div>
    <p class="muted">Réponds juste : si c’est bon, tu avances. Si c’est faux… tu t’arrêtes et tu tires ton Pokémon.</p>
  `);

  screen.querySelectorAll("button.choice").forEach(btn => {
    btn.onclick = async () => {
      _activeQuestion = false;
      clearQuestionTimer();
      await answerQuestion(Number(btn.dataset.idx));
    };
  });

  // --- Countdown ---
  let remaining = QUESTION_TIME;
  const barEl  = document.getElementById("timerBar");
  const lblEl  = document.getElementById("timerLabel");
  const secEl  = document.getElementById("timerSec");

  _questionTimer = setInterval(() => {
    remaining--;
    if (!barEl || !secEl) { clearQuestionTimer(); return; }

    const pct = (remaining / QUESTION_TIME) * 100;
    barEl.style.width = pct + "%";

    if (remaining <= 5) {
      barEl.style.background = "linear-gradient(90deg, #ff6b6b, #fbbf24)";
      lblEl.classList.add("urgent");
    } else if (remaining <= 10) {
      barEl.style.background = "linear-gradient(90deg, #fbbf24, #6ee7ff)";
    }
    secEl.textContent = remaining + "s";

    if (remaining <= 0) {
      _activeQuestion = false;
      clearQuestionTimer();
      screen.querySelectorAll("button.choice").forEach(b => b.classList.add("disabled", "timeout"));
      secEl.textContent = "Temps écoulé !";
      setTimeout(() => answerQuestion(-1), 900);
    }
  }, 1000);
}

function screenPickNumber() {
  const zoneKey = zoneKeyAt(state.failedAtZoneIndex ?? state.currentZoneIndex);
  const zoneNum = (state.failedAtZoneIndex ?? state.currentZoneIndex) + 1;

  render(`
    <div class="row" style="justify-content: space-between;">
      <div class="badge danger">Mauvaise réponse</div>
      <div class="badge">Zone finale: <b>${esc(zoneKey.toUpperCase())}</b></div>
      <div class="badge">Semaine: <b>${esc(state.weekNumber)}</b></div>
    </div>

    <div class="hr"></div>

    <h2 class="big">Tu t’arrêtes en Zone ${zoneNum}. Choisis un nombre de 1 à 20.</h2>
    <div class="row">
      <div class="col">
        <input id="numInput" type="number" min="1" max="20" placeholder="Entre un nombre (1 à 20)" />
        <p class="muted">Le tirage respecte les taux de la zone (${esc(zoneKey)}).</p>
      </div>
      <div>
        <button id="drawBtn" class="primary">Tirer mon Pokémon</button>
      </div>
    </div>
  `);

  document.getElementById("drawBtn").onclick = async () => {
    const n = Number(document.getElementById("numInput").value);
    if (!Number.isInteger(n) || n < 1 || n > 20) return alert("Entre un entier entre 1 et 20.");
    await finalizeDraw(n);
  };
}

function screenWinAllZones() {
  render(`
    <div class="row" style="justify-content: space-between;">
      <div class="badge ok">Incroyable</div>
      <div class="badge">Zone: <b>ZONE 4</b></div>
      <div class="badge">Semaine: <b>${esc(state.weekNumber)}</b></div>
    </div>
    <div class="hr"></div>
    <h2 class="big">Tu as réussi toutes les questions ! 🎉</h2>
    <p class="muted">L'heure est venue de capturer un pokémon ! Combien de pas veux-tu effectuer dans les hautes herbes ?</p>
    <div class="row">
      <div class="col">
        <input id="numInput" type="number" min="1" max="20" placeholder="Entre un nombre (1 à 20)" />
      </div>
      <div>
        <button id="drawBtn" class="primary">Tirer mon Pokémon</button>
      </div>
    </div>
  `);

  document.getElementById("drawBtn").onclick = async () => {
    const n = Number(document.getElementById("numInput").value);
    if (!Number.isInteger(n) || n < 1 || n > 20) return alert("Entre un entier entre 1 et 20.");
    await finalizeDraw(n, /*forceZone4*/ true);
  };
}

function screenResult(pokemon, zoneKey, numberPicked, shiny = false) {
  const rarity = ZONE_RARITY[zoneKey];
  const ball   = POKEBALL_BY_ZONE[zoneKey];
  const imgSrc = shiny ? pokemonShinyUrl(pokemon.id) : pokemonImageUrl(pokemon.id);
  const rarityParticles = rarity.particle || shiny;

  render(`
    <div class="row" style="justify-content: space-between;">
      <div class="badge ok">Tirage validé</div>
      <div class="badge">Zone: <b>${esc(zoneKey.toUpperCase())}</b></div>
      <div class="badge">Choix: <b>${esc(numberPicked)}</b></div>
    </div>

    <div class="hr"></div>

    <style>
      @keyframes pokefall {
        0%   { transform: translateY(-80px) rotate(-20deg); opacity: 0; }
        40%  { transform: translateY(0px) rotate(10deg); opacity: 1; }
        55%  { transform: translateY(-18px) rotate(-5deg); }
        70%  { transform: translateY(0px) rotate(3deg); }
        85%  { transform: translateY(-6px) rotate(-2deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
      @keyframes pokesuck {
        0%   { transform: scale(1); opacity: 1; filter: brightness(1); }
        30%  { transform: scale(0.6) translateY(10px); opacity: 0.7; filter: brightness(3) saturate(0); }
        60%  { transform: scale(0.1) translateY(20px); opacity: 0.3; filter: brightness(5) saturate(0); }
        100% { transform: scale(0) translateY(25px); opacity: 0; }
      }
      @keyframes ballshake {
        0%,100% { transform: rotate(0deg); }
        20%  { transform: rotate(-18deg); }
        40%  { transform: rotate(18deg); }
        60%  { transform: rotate(-12deg); }
        80%  { transform: rotate(12deg); }
      }
      @keyframes ballglow {
        0%,100% { filter: drop-shadow(0 0 6px ${rarity.glow}); }
        50%     { filter: drop-shadow(0 0 28px ${rarity.glow}); }
      }
      @keyframes revealname {
        0%   { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes pokeexit {
        0%   { transform: scale(0) translateY(25px); opacity: 0; filter: brightness(5) saturate(0); }
        40%  { transform: scale(1.15) translateY(-8px); opacity: 1; filter: brightness(2) saturate(0.5); }
        100% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1) saturate(1); }
      }
      @keyframes particle-float {
        0%   { transform: translate(0,0) scale(1); opacity: 1; }
        100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
      }
      @keyframes shiny-pulse {
        0%,100% { box-shadow: 0 0 18px 4px ${rarity.glow}; }
        50%     { box-shadow: 0 0 40px 12px ${rarity.glow}; }
      }
      .capture-stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        min-height: 260px;
        position: relative;
        overflow: visible;
      }
      #pokeball-wrap {
        position: relative;
        width: 110px;
        height: 110px;
        animation: pokefall 0.9s cubic-bezier(.22,1,.36,1) forwards;
      }
      #pokeball-img {
        width: 110px;
        height: 110px;
      }
      #poke-img {
        width: 150px;
        height: 150px;
        object-fit: contain;
        margin-top: -10px;
        border-radius: 16px;
        ${shiny ? `animation: shiny-pulse 1.5s ease-in-out infinite; background: rgba(255,255,255,0.04);` : ""}
      }
      #result-name {
        animation: revealname 0.6s ease forwards;
        opacity: 0;
        text-align: center;
        margin-top: 10px;
      }
      .rarity-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        border: 1px solid ${rarity.color};
        color: ${rarity.color};
        background: rgba(0,0,0,0.3);
        ${rarity.particle ? `box-shadow: 0 0 10px ${rarity.glow};` : ""}
      }
      .shiny-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        border: 1px solid #fbbf24;
        color: #fbbf24;
        background: rgba(251,191,36,0.12);
        box-shadow: 0 0 14px rgba(251,191,36,0.5);
      }
      .particle {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        pointer-events: none;
        background: ${shiny ? "#fbbf24" : rarity.color};
        animation: particle-float 1.2s ease-out forwards;
      }
    </style>

    <div class="capture-stage" id="capture-stage">
      <div id="pokeball-wrap">
        <img id="pokeball-img"
          src="${ball.src}"
          alt="${esc(ball.alt)}" style="width:110px;height:110px;image-rendering:pixelated" />
      </div>
      <img id="poke-img"
        src="${imgSrc}"
        alt="${esc(pokemon.name)}"
        style="opacity:0" />
      <div id="result-name" style="opacity:0">
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px">
          <span class="rarity-badge">${rarity.label}</span>
          ${shiny ? `<span class="shiny-badge">✨ Shiny !</span>` : ""}
        </div>
        <h2 class="big">Tu obtiens : <span style="color: ${rarity.color}">${esc(pokemon.name)}</span></h2>
        <p class="muted">Ton résultat a été enregistré. Reviens la semaine prochaine pour retenter.</p>
        <div style="margin-top:14px">
          <button id="lbBtn" class="primary">📊 Voir le classement de la semaine</button>
        </div>
      </div>
    </div>
  `);

  // --- Animation sequence ---
  const pokeImg   = document.getElementById("poke-img");
  const ballWrap  = document.getElementById("pokeball-wrap");
  const ballImg   = document.getElementById("pokeball-img");
  const nameEl    = document.getElementById("result-name");

  // Step 1: ball has landed (0.9s), show pokemon
  setTimeout(() => {
    pokeImg.style.opacity = "1";
  }, 900);

  // Step 2: pokemon gets sucked in (1.6s)
  setTimeout(() => {
    pokeImg.style.animation = "pokesuck 0.7s ease-in forwards";
  }, 1600);

  // Step 3: ball shakes 3 times (2.4s)
  setTimeout(() => {
    ballImg.style.transformOrigin = "center bottom";
    ballImg.style.animation = "ballshake 0.5s ease-in-out 3, ballglow 0.5s ease-in-out 3";
  }, 2400);

  // Step 4: pokemon bursts back out (3.95s)
  setTimeout(() => {
    ballImg.style.animation = "none";
    pokeImg.style.opacity = "1";
    pokeImg.style.animation = "pokeexit 0.7s cubic-bezier(.22,1,.36,1) forwards";
  }, 3950);

  // Step 5: reveal name (4.7s) + particles
  setTimeout(() => {
    nameEl.style.opacity = "1";
    nameEl.style.animation = "revealname 0.6s ease forwards";
    if (rarityParticles) spawnParticles(document.getElementById("capture-stage"), shiny);
    document.getElementById("lbBtn")?.addEventListener("click", () => screenLeaderboard());
  }, 4700);
}

function spawnParticles(container, golden = false) {
  const count = golden ? 28 : 16;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
    const dist = 60 + Math.random() * 80;
    p.style.setProperty("--px", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--py", `${Math.sin(angle) * dist - 40}px`);
    p.style.left = "50%";
    p.style.top  = "45%";
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    p.style.width = p.style.height = (4 + Math.random() * 6) + "px";
    container.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }
}

/** =========================
 *  7) Game logic
 *  ========================= */
async function startSession(pseudo) {
  setStatus("Connexion…");

  if (!auth.currentUser) {
    alert("Pas connecté à Discord. Recharge la page et reconnecte-toi.");
    return screenPseudo();
  }

  state.uid = auth.currentUser.uid;
  state.pseudo = pseudo;

  const userData = await getOrCreateUser(state.uid, pseudo);
  if (userData?.pseudo !== pseudo) await updatePseudo(state.uid, pseudo);

  const freshUserSnap = await getDoc(doc(db, "users", state.uid));
  state.usedQuestionIds = freshUserSnap.data()?.usedQuestionIds || state.usedQuestionIds;

  state.weekNumber = CURRENT_WEEK;

  const played = await hasPlayedThisWeek(state.uid, state.weekNumber);
  if (played) {
    setStatus(`Connecté (${state.pseudo}) • Semaine ${state.weekNumber}`);
    return screenBlocked();
  }

  setStatus(`Connecté (${state.pseudo}) • Semaine ${state.weekNumber}`);

  state.currentZoneIndex = 0;
  state.stopped = false;
  state.failedAtZoneIndex = null;
  state.questionsShown = {};
  await loadNextQuestion();
}

async function loadNextQuestion() {
  const zoneKey = zoneKeyAt(state.currentZoneIndex);
  const used = state.usedQuestionIds?.[zoneKey] || [];  
  const q = pickQuestion(zoneKey, used);
  state.currentQuestion = q;
  state.questionsShown[zoneKey] = q.id;

  // on marque comme utilisée dès l'affichage (comme tu veux)
  await markQuestionUsed(state.uid, zoneKey, q.id);

  // on met à jour local
  if (!state.usedQuestionIds[zoneKey].includes(q.id)) state.usedQuestionIds[zoneKey].push(q.id);

  screenQuestion();
}

async function answerQuestion(chosenIndex) {
  const zoneKey = zoneKeyAt(state.currentZoneIndex);
  const q = state.currentQuestion;

  const correct = (chosenIndex === q.answerIndex);
  if (correct) {
    // avance
    if (state.currentZoneIndex === 3) {
      // terminé zone4
      return screenWinAllZones();
    }
    state.currentZoneIndex++;
    return loadNextQuestion();
  }

  // faux → stop ici
  state.stopped = true;
  state.failedAtZoneIndex = state.currentZoneIndex;
  screenPickNumber();
}

async function finalizeDraw(numberPicked, forceZone4 = false) {
  const zoneIndex = forceZone4 ? 3 : (state.failedAtZoneIndex ?? state.currentZoneIndex);
  const zoneKey = zoneKeyAt(zoneIndex);

  // tirage pondéré seedé (uid + semaine + zone)
  const pokemon = drawPokemon({
    uid: state.uid,
    weekNumber: state.weekNumber,
    zoneKey,
    numberPicked,
  });

  // shiny deterministic
  state.shiny = isShiny(state.uid, state.weekNumber, zoneKey, numberPicked);

  // zoneReached = nombre de zones validées (questions correctes)
  const zoneReached = Math.max(0, (state.failedAtZoneIndex ?? zoneIndex));
  const failedAtZone = forceZone4 ? null : (state.failedAtZoneIndex + 1);

  await savePlay({
    uid: state.uid,
    pseudo: state.pseudo,
    weekNumber: state.weekNumber,
    zoneReached,
    failedAtZone,
    pokemon,
    numberPicked,
    questionsShown: state.questionsShown,
    shiny: state.shiny,
  });

  screenResult(pokemon, zoneKey, numberPicked, state.shiny);
}

/** =========================
 *  Leaderboard screen
 *  ========================= */
async function screenLeaderboard() {
  render(`<p class="muted" style="text-align:center;padding:30px">Chargement du classement…</p>`);

  try {
    const q = query(
      collection(db, "plays"),
      where("weekNumber", "==", CURRENT_WEEK),
      orderBy("zoneReached", "desc")
    );
    const snap = await getDocs(q);
    const rows = [];
    snap.forEach(d => rows.push(d.data()));

    if (rows.length === 0) {
      render(`
        <h2 class="big">📊 Classement — Semaine ${CURRENT_WEEK}</h2>
        <p class="muted">Personne n'a encore joué cette semaine.</p>
        <button id="backBtn" style="margin-top:12px">← Retour</button>
      `);
      document.getElementById("backBtn").onclick = screenPseudo;
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    const tableRows = rows.map((r, i) => {
      const rarity = ZONE_RARITY[`zone${r.zoneReached + 1}`] || ZONE_RARITY.zone1;
      const zoneLabel = r.zoneReached >= 1 ? `Zone ${r.zoneReached}` : "Zone 1";
      const ballKey   = `zone${Math.max(1, r.zoneReached + (r.failedAtZone ? 0 : 1))}`;
      const ball      = POKEBALL_BY_ZONE[ballKey] || POKEBALL_BY_ZONE.zone1;
      const shinyTag  = r.shiny ? `<span style="color:#fbbf24;font-size:12px">✨</span>` : "";
      const medal     = medals[i] || `<span style="color:var(--muted)">${i + 1}</span>`;
      return `
        <tr>
          <td style="padding:8px 6px;text-align:center">${medal}</td>
          <td style="padding:8px 6px;font-weight:600">${esc(r.pseudo)}</td>
          <td style="padding:8px 6px;text-align:center">
            <img src="${ball.src}" style="width:22px;height:22px;image-rendering:pixelated;vertical-align:middle" title="${esc(ball.alt)}" />
            <span style="margin-left:4px;color:${rarity.color}">${zoneLabel}</span>
          </td>
          <td style="padding:8px 6px">
            <span style="display:flex;align-items:center;gap:6px">
              <img src="${r.shiny ? pokemonShinyUrl(r.pokemon?.id) : pokemonImageUrl(r.pokemon?.id)}"
                   style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,0.05)" />
              ${esc(r.pokemon?.name || "?")} ${shinyTag}
            </span>
          </td>
        </tr>
      `;
    }).join("");

    render(`
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <h2 class="big" style="margin:0">📊 Classement — Semaine ${CURRENT_WEEK}</h2>
        <button id="backBtn">← Retour</button>
      </div>
      <div class="hr"></div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="color:var(--muted);font-size:12px;text-transform:uppercase;border-bottom:1px solid var(--border)">
              <th style="padding:6px;text-align:center">#</th>
              <th style="padding:6px;text-align:left">Joueur</th>
              <th style="padding:6px;text-align:center">Zone</th>
              <th style="padding:6px;text-align:left">Pokémon</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `);
    document.getElementById("backBtn").onclick = screenPseudo;
  } catch (e) {
    render(`<p class="muted" style="text-align:center;padding:30px">Erreur de chargement: ${esc(String(e))}</p>`);
  }
}

/** =========================
 *  8) Boot
 *  ========================= */
(async function boot() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");

  if (code) {
    const expected = localStorage.getItem("discordState");
    if (!expected || expected !== stateParam) {
      alert("Erreur Discord (state). Réessaie.");
      return screenPseudo();
    }

    setStatus("Connexion Discord…");

    const resp = await fetch(DISCORD_AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok || !data?.token) {
    console.error("discordAuth error:", resp.status, data);
    alert(
        "Erreur login Discord.\n\n" +
        "Status: " + resp.status + "\n" +
        "Réponse: " + JSON.stringify(data)
    );
    return screenPseudo();
    }


    await signInWithCustomToken(auth, data.token);

    // Nettoie l’URL (?code=...)
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url.toString());

    const pseudo = data.discord?.username || "Joueur";
    localStorage.removeItem("discordState");

    //On garde le flow jeu existant
    return startSession(pseudo);
  }

  setStatus(`Semaine ${CURRENT_WEEK}`);
  screenPseudo();
})();

