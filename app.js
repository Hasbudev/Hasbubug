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

const CURRENT_WEEK = 2; // <-- tu changes à la main chaque semaine
const PARK_CLOSED = false;

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

function isShiny(uid, weekNumber, zoneKey, drawToken) {
  const seed = hashStringToUint32(`shiny|${uid}|W${weekNumber}|${zoneKey}|${drawToken}`);
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

function drawPokemon({ uid, weekNumber, zoneKey, drawToken }) {
  // drawToken est un token aléatoire généré au moment du tirage — imprévisible,
  // unique par joueur par tirage. Le numéro choisi n'influence plus le résultat.
  const slots = buildSlots(zoneKey);
  const shuffled = shuffleSeeded(slots, `${uid}|W${weekNumber}|${zoneKey}|${drawToken}`);
  return shuffled[0]; // toujours index 0 après shuffle unique
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

  // Token aléatoire unique généré au moment du tirage — impossible à prédire ou partager.
  // Le numéro choisi par le joueur est conservé pour l'affichage mais n'affecte plus le résultat.
  const drawToken = crypto.randomUUID();

  const pokemon = drawPokemon({
    uid: state.uid,
    weekNumber: state.weekNumber,
    zoneKey,
    drawToken,
  });

  // shiny basé sur le même token imprévisible
  state.shiny = isShiny(state.uid, state.weekNumber, zoneKey, drawToken);

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
 *  Parc fermé — mini-jeu Safari
 *  ========================= */
function screenParkClosed() {
  setStatus(`Semaine ${CURRENT_WEEK}`);

  const TRAINER_FRAMES_B64 = [
  "data:image/png;base64,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",
  "data:image/png;base64,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",
  "data:image/png;base64,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",
  "data:image/png;base64,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",
  "data:image/png;base64,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",
];

  const trainerFrameImgs = TRAINER_FRAMES_B64.map(src => {
    const img = new Image(); img.src = src; return img;
  });

  const ALL_POKEMON = [
    { id: 193, name: "Yanma",      spd: 2.2, flyer: true,  yFrac: 0.57 },
    { id: 127, name: "Scarabrute", spd: 1.8, flyer: false },
    { id: 214, name: "Scarinho",   spd: 2.0, flyer: false },
    { id: 47,  name: "Parasect",   spd: 1.2, flyer: false },
    { id: 123, name: "Insécateur", spd: 2.5, flyer: true,  yFrac: 0.55 },
    { id: 49,  name: "Coxyclaque", spd: 2.1, flyer: true,  yFrac: 0.60 },
    { id: 48,  name: "Mimitoss",   spd: 1.5, flyer: true,  yFrac: 0.62 },
    { id: 205, name: "Forfaiture", spd: 1.3, flyer: false },
    { id: 213, name: "Caratroc",   spd: 1.0, flyer: false },
    { id: 283, name: "Crallombré", spd: 1.6, flyer: false },
    { id: 284, name: "Araqua",     spd: 2.3, flyer: true,  yFrac: 0.57 },
  ];
  const shuffled = [...ALL_POKEMON].sort(() => Math.random() - 0.5);
  const runners = shuffled.slice(0, 4).map((p, i) => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
    return { ...p, img, x: 200 + i * 380 + Math.random()*120,
             dir: Math.random()>.5?1:-1, bobPhase: Math.random()*Math.PI*2,
             tick: 0, caught: false, catchAnim: 0 };
  });

  const trainer = { x: 200, y: 0, vy: 0, vx: 0, dir: 1,
    onGround: true, tick: 0, speed: 5, jumpForce: -15, gravity: 0.65,
    score: 0, popups: [] };

  const keys = {};
  const onKeyDown = e => {
    keys[e.key] = true;
    if ((e.key==="ArrowUp"||e.key===" ") && trainer.onGround) {
      trainer.vy = trainer.jumpForce; trainer.onGround = false;
    }
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
  };
  const onKeyUp = e => { keys[e.key] = false; };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup",   onKeyUp);

  // ── DOM ──
  const overlay = document.createElement("div");
  overlay.id = "pco";
  overlay.innerHTML = `<canvas id="pco-cv"></canvas><div id="pco-ui"></div>`;
  const style = document.createElement("style");
  style.id = "pco-st";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    #pco{position:fixed;inset:0;z-index:9999;overflow:hidden;}
    #pco-cv{position:absolute;inset:0;width:100%;height:100%;}
    #pco-ui{position:absolute;inset:0;display:grid;grid-template-rows:auto 1fr auto;pointer-events:none;z-index:10;}
    #pco-header{display:flex;flex-direction:column;align-items:center;padding-top:clamp(16px,3vh,40px);gap:5px;animation:pco-dn 1.2s cubic-bezier(.16,1,.3,1) forwards;opacity:0;}
    @keyframes pco-dn{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
    .pco-eye{font-family:'Cinzel',serif;font-size:clamp(8px,1vw,11px);letter-spacing:7px;text-transform:uppercase;color:rgba(200,168,75,0.5);}
    .pco-title{font-family:'Cinzel',serif;font-size:clamp(26px,5vw,62px);font-weight:900;letter-spacing:3px;color:#e8d070;margin:0;line-height:1;text-shadow:0 0 55px rgba(200,168,75,0.5),0 4px 14px rgba(0,0,0,0.95);}
    .pco-badge{display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(200,168,75,0.48);background:rgba(4,9,3,0.7);backdrop-filter:blur(8px);border-radius:4px;padding:7px 24px;}
    .pco-dot{width:5px;height:5px;background:rgba(200,168,75,0.7);border-radius:50%;}
    .pco-badge-txt{font-family:'Cinzel',serif;font-size:clamp(10px,1.2vw,14px);font-weight:600;letter-spacing:7px;text-transform:uppercase;color:#e8dfc0;}
    #pco-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(5px,1vh,11px);padding:0 20px;pointer-events:all;animation:pco-up 1.3s cubic-bezier(.16,1,.3,1) forwards .25s;opacity:0;}
    @keyframes pco-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .pco-orn{display:flex;align-items:center;gap:12px;width:clamp(100px,15vw,200px);}
    .pco-orn-l{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(200,168,75,0.4),transparent);}
    .pco-orn-d{width:5px;height:5px;background:rgba(200,168,75,0.6);transform:rotate(45deg);flex-shrink:0;}
    .pco-msg-h{font-family:'Cinzel',serif;font-size:clamp(11px,1.4vw,16px);font-weight:600;color:#e6c96a;margin:0;}
    .pco-msg-p{font-size:clamp(11px,1.2vw,14px);color:rgba(232,223,192,0.82);line-height:1.7;margin:0;text-align:center;}
    .pco-msg-p em{color:#c8a84b;font-style:normal;font-weight:600;}
    .pco-msg-note{font-size:clamp(10px,.9vw,12px);color:rgba(138,158,106,0.7);margin:0;}
    .pco-clock{font-family:'Cinzel',serif;font-size:clamp(28px,4.5vw,54px);font-weight:700;letter-spacing:6px;color:#c8a84b;line-height:1;text-shadow:0 0 28px rgba(200,168,75,0.5);}
    .pco-clk-lbl{font-family:'Cinzel',serif;font-size:clamp(7px,.8vw,10px);letter-spacing:4px;text-transform:uppercase;color:rgba(138,158,106,0.65);margin-top:2px;}
    .pco-btn{pointer-events:all;cursor:pointer;font-family:'Cinzel',serif;font-size:clamp(10px,1.1vw,13px);font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#e8d070;background:rgba(6,12,4,0.78);border:1px solid rgba(200,168,75,0.48);border-radius:6px;padding:clamp(8px,1.3vh,12px) clamp(18px,2.5vw,30px);backdrop-filter:blur(6px);transition:all .22s ease;}
    .pco-btn:hover{background:rgba(200,168,75,0.11);border-color:rgba(200,168,75,0.72);color:#f0dc88;}
    #pco-score{position:absolute;top:16px;left:20px;z-index:20;font-family:'Cinzel',serif;font-size:clamp(13px,1.8vw,20px);font-weight:700;color:#e8d070;text-shadow:0 0 14px rgba(200,168,75,0.6),0 2px 6px rgba(0,0,0,0.9);pointer-events:none;}
    #pco-hint{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:20;font-family:'Cinzel',serif;font-size:clamp(8px,.9vw,11px);letter-spacing:3px;text-transform:uppercase;color:rgba(200,168,75,0.4);pointer-events:none;white-space:nowrap;}
    #pco-spacer{height:28vh;flex-shrink:0;}
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  document.getElementById("pco-ui").innerHTML = `
    <div id="pco-header">
      <div class="pco-eye">Safari Zone · Johto</div>
      <h1 class="pco-title">Parc des Insectes</h1>
      <div class="pco-badge"><span class="pco-dot"></span><span class="pco-badge-txt">Fermé</span><span class="pco-dot"></span></div>
    </div>
    <div id="pco-mid">
      <div class="pco-orn"><div class="pco-orn-l"></div><div class="pco-orn-d"></div><div class="pco-orn-l"></div></div>
      <p class="pco-msg-h">Merci d'être passé, Dresseur.</p>
      <p class="pco-msg-p">Le parc ferme ses portes pour ce soir.<br><em>Reviens la semaine prochaine</em> pour de nouvelles aventures<br>dans les herbes hautes de Johto.</p>
      <p class="pco-msg-note">🌿 Les Pokémon se reposent jusqu'à la prochaine session.</p>
      <div><div class="pco-clock" id="pco-clock">--:--:--</div><div class="pco-clk-lbl">Heure locale</div></div>
      <button class="pco-btn" id="pco-lb">📊 Voir le classement</button>
    </div>
    <div id="pco-spacer"></div>
  `;
  const scoreEl = document.createElement("div"); scoreEl.id="pco-score"; scoreEl.textContent="🏆 0"; overlay.appendChild(scoreEl);
  const hintEl  = document.createElement("div"); hintEl.id="pco-hint";
  hintEl.innerHTML="← → Courir &nbsp;·&nbsp; ↑ / Espace Sauter &nbsp;·&nbsp; Attrape les Pokémon !";
  overlay.appendChild(hintEl);

  // ═══════ CANVAS ═══════
  const cv=document.getElementById("pco-cv"), ctx=cv.getContext("2d");
  let W,H,GY;
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;GY=H*.722;if(trainer.onGround)trainer.y=GY;}
  resize(); window.addEventListener("resize",resize);

  const STARS=Array.from({length:240},()=>({x:Math.random(),y:Math.random()*.62,r:.4+Math.random()*2,phase:Math.random()*Math.PI*2,spd:.004+Math.random()*.009,base:.06+Math.random()*.38}));
  function mkS(){return{active:false,cd:100+Math.random()*260,t:0,maxT:0,x:0,y:0,vx:0,vy:0};}
  const SHOOTS=[mkS(),mkS(),mkS()];
  function fireS(s){s.x=Math.random()*.6;s.y=Math.random()*.25;const a=(12+Math.random()*14)*Math.PI/180,sp=3.5+Math.random()*3;s.vx=Math.cos(a)*sp;s.vy=Math.sin(a)*sp;s.maxT=50+Math.random()*35;s.t=0;s.active=true;}
  function drawMoon(t){const mx=W*.84,my=H*.11,mr=Math.min(W,H)*.055,p=(Math.sin(t*.008)+1)/2;const h1=ctx.createRadialGradient(mx,my,mr*.5,mx,my,mr*5.5);h1.addColorStop(0,`rgba(253,230,138,${.16+p*.08})`);h1.addColorStop(.4,`rgba(220,170,30,${.05+p*.03})`);h1.addColorStop(1,"rgba(180,130,10,0)");ctx.fillStyle=h1;ctx.beginPath();ctx.arc(mx,my,mr*5.5,0,Math.PI*2);ctx.fill();const mg=ctx.createRadialGradient(mx-mr*.2,my-mr*.2,0,mx,my,mr);mg.addColorStop(0,"#fefce8");mg.addColorStop(.5,"#fde68a");mg.addColorStop(1,"#c8920e");ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,mr,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(0,0,0,0.07)";[[-.22,.2,.18],[.3,-.1,.11],[-.05,.4,.13],[.18,.28,.08]].forEach(([dx,dy,rs])=>{ctx.beginPath();ctx.arc(mx+mr*dx,my+mr*dy,mr*rs,0,Math.PI*2);ctx.fill();});}
  function makeRow(seed,count){const t=[];let x=0;for(let i=0;i<count;i++){const r=Math.abs(Math.sin(seed*9301+i*49297+233));x+=28+r*55;t.push({rx:x/900,sc:.55+r*.55});}return t;}
  const ROWS=[{trees:makeRow(1,24),yF:.60,col:"#020703",al:.70,sb:.062},{trees:makeRow(2,21),yF:.65,col:"#030904",al:.84,sb:.078},{trees:makeRow(3,19),yF:.70,col:"#040b04",al:.95,sb:.095}];
  function drawRow(row){const yB=H*row.yF;ctx.fillStyle=row.col;ctx.globalAlpha=row.al;for(const t of row.trees){const tx=(t.rx*W*1.1)%(W+80)-40,sc=t.sc*Math.min(W,H)*row.sb;ctx.fillRect(tx-sc*.2,yB,sc*.4,sc*.85);ctx.beginPath();ctx.ellipse(tx,yB-sc*.65,sc*.88,sc*.68,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(tx-sc*.28,yB-sc*.42,sc*.62,sc*.48,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(tx+sc*.28,yB-sc*.42,sc*.62,sc*.48,.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(tx,yB-sc*1.25,sc*.48,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
  function drawGround(){const gy=GY;const g=ctx.createLinearGradient(0,gy,0,H);g.addColorStop(0,"#1c3e10");g.addColorStop(.3,"#112a09");g.addColorStop(1,"#07100506");ctx.fillStyle=g;ctx.fillRect(0,gy,W,H-gy);const gH=H*.048;ctx.fillStyle="#245214";for(let x=0;x<W;x+=10){const h=gH*(.6+Math.sin(x*.18)*.4);ctx.beginPath();ctx.moveTo(x,gy+2);ctx.quadraticCurveTo(x+3,gy-h*.6,x+5,gy-h);ctx.quadraticCurveTo(x+7,gy-h*.6,x+10,gy+2);ctx.fill();}ctx.fillStyle="#2e6a1a";for(let x=5;x<W;x+=8){const h=gH*(.7+Math.sin(x*.22+1)*.3);ctx.beginPath();ctx.moveTo(x,gy+2);ctx.quadraticCurveTo(x+2,gy-h*.5,x+4,gy-h);ctx.quadraticCurveTo(x+6,gy-h*.5,x+8,gy+2);ctx.fill();}}
  function drawFog(t){const gy=GY,dr=Math.sin(t*.003)*W*.02;const f=ctx.createLinearGradient(0,gy-20,0,gy+40);f.addColorStop(0,"rgba(100,160,60,0)");f.addColorStop(.4,`rgba(80,140,45,${.07+Math.sin(t*.004)*.025})`);f.addColorStop(1,"rgba(60,110,35,0)");ctx.fillStyle=f;ctx.fillRect(dr-20,gy-20,W+40,60);}
  const FLIES=Array.from({length:22},()=>({x:Math.random(),y:.62+Math.random()*.3,vx:(Math.random()-.5)*.00018,vy:(Math.random()-.5)*.00012,dp:Math.random()*Math.PI*2,ds:.003+Math.random()*.005,da:.0012+Math.random()*.003,bs:.012+Math.random()*.016,ph:Math.random()*Math.PI*2,r:1.5+Math.random()*1.8,hue:72+Math.random()*22}));
  function drawFlies(t){for(const f of FLIES){f.x+=f.vx+Math.sin(t*f.ds+f.dp)*f.da;f.y+=f.vy+Math.cos(t*f.ds*.7+f.dp)*f.da*.6;if(f.x<0)f.x=1;if(f.x>1)f.x=0;if(f.y<.58)f.y=.58;if(f.y>.95)f.y=.95;const blink=(Math.sin(t*f.bs+f.ph)+1)/2,glow=blink*.82+.06;const fx=f.x*W,fy=f.y*H;const fg=ctx.createRadialGradient(fx,fy,0,fx,fy,f.r*11);fg.addColorStop(0,`hsla(${f.hue},100%,82%,${glow*.5})`);fg.addColorStop(.35,`hsla(${f.hue},90%,65%,${glow*.18})`);fg.addColorStop(1,"hsla(0,0%,0%,0)");ctx.fillStyle=fg;ctx.beginPath();ctx.arc(fx,fy,f.r*11,0,Math.PI*2);ctx.fill();ctx.fillStyle=`hsla(${f.hue},100%,96%,${glow})`;ctx.beginPath();ctx.arc(fx,fy,f.r,0,Math.PI*2);ctx.fill();}}

  const POKE_SZ = () => Math.min(W,H) * 0.082;
  const WALK_SEQ = [0,1,2,3,4,3,2,1];

  function drawRunners(tick){
    const sorted=[...runners].sort((a,b)=>(a.flyer?1:-1)-(b.flyer?1:-1));
    for(const r of sorted){
      if(!r.img.complete||!r.img.naturalWidth)continue;
      if(r.caught&&r.catchAnim<=0)continue;
      r.tick++;
      const sz=POKE_SZ();
      const py=r.flyer?H*r.yFrac:GY-sz*.92;
      if(!r.caught){r.x+=r.spd*r.dir;if(r.x>W+sz){r.x=W+sz;r.dir=-1;}if(r.x<-sz){r.x=-sz;r.dir=1;}}
      else{r.catchAnim--;r.x+=r.dir*1.5;}
      const bob=r.flyer?Math.sin(r.tick*.07+r.bobPhase)*sz*.12:-Math.abs(Math.sin(r.tick*.28+r.bobPhase))*sz*.06;
      const alpha=r.caught?r.catchAnim/30:1;
      const rise=r.caught?(30-r.catchAnim)*3:0;
      ctx.save();ctx.globalAlpha=alpha;
      ctx.translate(r.x+sz*.5,py+bob-rise);ctx.scale(-r.dir,1);
      if(!r.flyer&&!r.caught){ctx.fillStyle="rgba(0,0,0,0.18)";ctx.beginPath();ctx.ellipse(0,sz*.5,sz*.3,sz*.07,0,0,Math.PI*2);ctx.fill();}
      ctx.drawImage(r.img,-sz*.5,0,sz,sz);
      ctx.restore();ctx.globalAlpha=1;
      if(!r.caught&&(r.tick+r.id*31)%200<110){ctx.save();ctx.font=`bold ${Math.round(sz*.4)}px 'Cinzel',serif`;ctx.textAlign="center";ctx.fillStyle="#fde68a";ctx.shadowColor="rgba(253,230,138,0.95)";ctx.shadowBlur=14;ctx.fillText("!",r.x+sz*.5,py+bob-sz*.12);ctx.restore();}
      if(!r.flyer&&!r.caught){for(let i=0;i<3;i++){const age=((r.tick+i*7)%16)/16,ds=sz*.055*(1+age*1.8),da=(1-age)*.25;ctx.fillStyle=`rgba(160,200,100,${da})`;const dustX=r.dir>0?r.x+sz*.75+i*sz*.07:r.x-i*sz*.07;ctx.beginPath();ctx.ellipse(dustX,GY-age*sz*.09,ds,ds*.4,0,0,Math.PI*2);ctx.fill();}}
    }
  }

  function updateTrainer(){
    if(keys["ArrowLeft"]||keys["a"]||keys["A"]){trainer.vx=-trainer.speed;trainer.dir=-1;}
    else if(keys["ArrowRight"]||keys["d"]||keys["D"]){trainer.vx=trainer.speed;trainer.dir=1;}
    else trainer.vx*=0.72;
    trainer.x=Math.max(30,Math.min(W-30,trainer.x+trainer.vx));
    trainer.vy+=trainer.gravity;trainer.y+=trainer.vy;
    if(trainer.y>=GY){trainer.y=GY;trainer.vy=0;trainer.onGround=true;}
    trainer.tick++;
  }

  function drawTrainer(){
    // Sprite Red : 68x136px (17x34 original × 4)
    // On affiche à une hauteur relative à l'écran
    const th = Math.min(W,H) * 0.11;   // hauteur affichée
    const tw = th * (68/136);           // ratio exact du sprite
    const tx = trainer.x, ty = trainer.y;
    const moving  = Math.abs(trainer.vx) > 0.8;
    const jumping = !trainer.onGround;

    // Ombre
    ctx.fillStyle="rgba(0,0,0,0.22)";
    ctx.beginPath();ctx.ellipse(tx,ty,tw*.6,tw*.15,0,0,Math.PI*2);ctx.fill();

    // Frame selection
    let fi = 0;
    if      (jumping) fi = 2;
    else if (moving)  fi = WALK_SEQ[Math.floor(trainer.tick/6) % WALK_SEQ.length];

    const frameImg = trainerFrameImgs[fi];
    if(!frameImg.complete||!frameImg.naturalWidth) return;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(trainer.dir, 1);             // flip si gauche
    ctx.drawImage(frameImg, -tw*.5, -th, tw, th);  // pieds = ty
    ctx.restore();

    // Pop-ups capture
    for(const p of trainer.popups){
      p.life--;
      const a=Math.min(1,p.life/15), rise=(45-p.life)*2.2;
      ctx.save();ctx.font=`bold ${Math.round(th*.26)}px 'Cinzel',serif`;
      ctx.textAlign="center";ctx.globalAlpha=a;ctx.fillStyle="#fde68a";
      ctx.shadowColor="rgba(253,230,138,0.9)";ctx.shadowBlur=12;
      ctx.fillText(`✨ ${p.name}!`,tx,ty-th-rise);ctx.restore();
    }
    trainer.popups=trainer.popups.filter(p=>p.life>0);
  }

  function checkCaptures(){
    const th=Math.min(W,H)*.11, sz=POKE_SZ();
    for(const r of runners){
      if(r.caught)continue;
      const pkx=r.x+sz*.5, pky=r.flyer?H*r.yFrac+sz*.5:GY-sz*.5;
      const dist=Math.hypot(trainer.x-pkx, trainer.y-th*.5-pky);
      if(dist<(th+sz)*.32){
        r.caught=true;r.catchAnim=30;trainer.score++;
        scoreEl.textContent=`🏆 ${trainer.score}`;
        trainer.popups.push({name:r.name,life:45});
        setTimeout(()=>{r.caught=false;r.x=Math.random()>.5?W+sz:-sz;r.dir=r.x<0?1:-1;},3500);
      }
    }
  }

  let tick=0,rafId;
  function loop(){
    if(!document.getElementById("pco-cv"))return;
    tick++;ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,H*.72);sky.addColorStop(0,"#030804");sky.addColorStop(.3,"#050e05");sky.addColorStop(.65,"#091508");sky.addColorStop(1,"#0e1f0a");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*.72);
    for(const s of STARS){const a=s.base+Math.sin(tick*s.spd+s.phase)*(1-s.base)*.7;ctx.fillStyle=`rgba(255,255,245,${a})`;ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();}
    for(const s of SHOOTS){if(!s.active){s.cd--;if(s.cd<=0){fireS(s);s.cd=200+Math.random()*300;}}else{s.t++;const p=s.t/s.maxT,a=p<.12?p/.12:p>.65?1-(p-.65)/.35:1;const ex=s.x*W+s.vx*s.t,ey=s.y*H+s.vy*s.t,len=65+s.vx*5;const sg=ctx.createLinearGradient(ex-len,ey-len*.25,ex,ey);sg.addColorStop(0,"rgba(255,242,200,0)");sg.addColorStop(1,`rgba(255,242,200,${a*.85})`);ctx.strokeStyle=sg;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(ex-len,ey-len*.25);ctx.lineTo(ex,ey);ctx.stroke();if(s.t>=s.maxT)s.active=false;}}
    drawMoon(tick);for(const r of ROWS)drawRow(r);drawFog(tick);drawGround();drawFlies(tick);
    updateTrainer();checkCaptures();drawRunners(tick);drawTrainer();
    rafId=requestAnimationFrame(loop);
  }
  loop();

  const tickClock=()=>{const el=document.getElementById("pco-clock");if(!el){clearInterval(clkIv);return;}const n=new Date(),pv=v=>String(v).padStart(2,"0");el.textContent=pv(n.getHours())+":"+pv(n.getMinutes())+":"+pv(n.getSeconds());};
  tickClock();const clkIv=setInterval(tickClock,1000);

  document.getElementById("pco-lb")?.addEventListener("click",()=>{
    cancelAnimationFrame(rafId);clearInterval(clkIv);
    window.removeEventListener("resize",resize);
    window.removeEventListener("keydown",onKeyDown);
    window.removeEventListener("keyup",onKeyUp);
    overlay.remove();document.getElementById("pco-st")?.remove();
    screenLeaderboard();
  });
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
  if (PARK_CLOSED) return screenParkClosed();
  screenPseudo();
})();

