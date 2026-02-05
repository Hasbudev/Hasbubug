// app.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp
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
const DISCORD_REDIRECT_URI = window.location.origin + window.location.pathname;


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
    { id: "z1_q1", q: "Zone 1 — Placeholder: 2 + 2 = ?", choices: ["3", "4", "5", "22"], answerIndex: 1 },
    { id: "z1_q2", q: "Zone 1 — Placeholder: Couleur du ciel (temps clair) ?", choices: ["Vert", "Bleu", "Rouge", "Noir"], answerIndex: 1 },
    { id: "z1_q3", q: "Zone 1 — Placeholder: 10 / 2 = ?", choices: ["3", "4", "5", "6"], answerIndex: 2 },
    { id: "z1_q4", q: "Zone 1 — Placeholder: Pokémon type Insecte = ?", choices: ["Pikachu", "Chenipan", "Salamèche", "Rondoudou"], answerIndex: 1 },
  ],
  zone2: [
    { id: "z2_q1", q: "Zone 2 — Placeholder: 12 × 3 = ?", choices: ["36", "24", "18", "48"], answerIndex: 0 },
    { id: "z2_q2", q: "Zone 2 — Placeholder: Capitale de la France ?", choices: ["Lyon", "Marseille", "Paris", "Nice"], answerIndex: 2 },
    { id: "z2_q3", q: "Zone 2 — Placeholder: 81 / 9 = ?", choices: ["7", "8", "9", "10"], answerIndex: 2 },
    { id: "z2_q4", q: "Zone 2 — Placeholder: Un hexagone a combien de côtés ?", choices: ["5", "6", "7", "8"], answerIndex: 1 },
  ],
  zone3: [
    { id: "z3_q1", q: "Zone 3 — Placeholder: 2^5 = ?", choices: ["16", "24", "32", "64"], answerIndex: 2 },
    { id: "z3_q2", q: "Zone 3 — Placeholder: Racine carrée de 144 ?", choices: ["10", "11", "12", "13"], answerIndex: 2 },
    { id: "z3_q3", q: "Zone 3 — Placeholder: 7 × 8 = ?", choices: ["54", "56", "58", "64"], answerIndex: 1 },
    { id: "z3_q4", q: "Zone 3 — Placeholder: 15% de 200 = ?", choices: ["15", "20", "25", "30"], answerIndex: 3 },
  ],
  zone4: [
    { id: "z4_q1", q: "Zone 4 — Placeholder: 3.5 × 8 = ?", choices: ["24", "26", "28", "30"], answerIndex: 2 },
    { id: "z4_q2", q: "Zone 4 — Placeholder: 1/4 de 360 = ?", choices: ["60", "80", "90", "120"], answerIndex: 2 },
    { id: "z4_q3", q: "Zone 4 — Placeholder: 2^10 = ?", choices: ["512", "1024", "2048", "4096"], answerIndex: 1 },
    { id: "z4_q4", q: "Zone 4 — Placeholder: 999 - 456 = ?", choices: ["533", "543", "553", "563"], answerIndex: 1 },
  ],
};

const ZONE_KEYS = ["zone1", "zone2", "zone3", "zone4"];

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

async function savePlay({ uid, pseudo, weekNumber, zoneReached, failedAtZone, pokemon, numberPicked, questionsShown }) {
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
  const fresh = pool.filter(q => !usedIds.includes(q.id));
  // si épuisé, on recycle (tu peux changer ça si tu veux forcer "jamais")
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
  `);
}

function screenQuestion() {
  const zoneKey = zoneKeyAt(state.currentZoneIndex);
  const q = state.currentQuestion;

  render(`
    <div class="row" style="justify-content: space-between;">
      <div class="badge">Pseudo: <b>${esc(state.pseudo)}</b></div>
      <div class="badge">Zone: <b>${esc(zoneKey.toUpperCase())}</b></div>
      <div class="badge">Semaine: <b>${esc(state.weekNumber)}</b></div>
    </div>

    <div class="hr"></div>

    <h2 class="big">${esc(q.q)}</h2>
    <div class="grid">
      ${q.choices.map((c, idx) => `
        <button class="choice" data-idx="${idx}">
          ${esc(c)}
        </button>
      `).join("")}
    </div>

    <div class="hr"></div>
    <p class="muted">Réponds juste : si c’est bon, tu avances. Si c’est faux… tu t’arrêtes et tu tires ton Pokémon.</p>
  `);

  screen.querySelectorAll("button.choice").forEach(btn => {
    btn.onclick = async () => {
      const idx = Number(btn.dataset.idx);
      await answerQuestion(idx);
    };
  });
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
    <p class="muted">Choisis maintenant ton nombre 1–20 pour le tirage Zone 4.</p>
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

function screenResult(pokemon, zoneKey, numberPicked) {
  render(`
    <div class="row" style="justify-content: space-between;">
      <div class="badge ok">Tirage validé</div>
      <div class="badge">Zone: <b>${esc(zoneKey.toUpperCase())}</b></div>
      <div class="badge">Choix: <b>${esc(numberPicked)}</b></div>
    </div>

    <div class="hr"></div>

    <div class="poke">
      <img alt="${esc(pokemon.name)}" src="${pokemonImageUrl(pokemon.id)}" />
      <div>
        <h2 class="big">Tu obtiens : <span style="color: var(--accent)">${esc(pokemon.name)}</span></h2>
        <p class="muted">Ton résultat a été enregistré. Reviens la semaine prochaine pour retenter.</p>
      </div>
    </div>
  `);
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
  const used = state.usedQuestionIds[zoneKey] || [];
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
  });

  screenResult(pokemon, zoneKey, numberPicked);
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

