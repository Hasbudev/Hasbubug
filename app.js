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
    {
      id: "z1_q1",
      q: "Combien de faiblesses possède le type Insecte en 9ème génération ?",
      choices: ["2", "3", "4", "5"],
      answerIndex: 1
    },
    {
      id: "z1_q2",
      q: "Quelle est la BST maximale que possède un Pokémon de type Insecte ? (hors légendaires et méga-évolutions)",
      choices: ["540", "550", "570", "600"],
      answerIndex: 2
    },
    {
      id: "z1_q3",
      q: "Combien de Pokémon de type Insecte sont affublés du sigle OU en 9ème génération ?",
      choices: ["0", "1", "2", "3"],
      answerIndex: 0
    },
    {
      id: "z1_q4",
      q: "Combien de Pokémon de type Insecte sont affublés du signe UU en 9ème génération ? (Hors RUBL)",
      choices: ["1", "2", "3", "4"],
      answerIndex: 2
    },
    {
      id: "z1_q5",
      q: "Combien de Pokémon de type Insecte sont affublés du signe RU en 9ème génération ? (Hors NUBL)",
      choices: ["2", "3", "4", "5"],
      answerIndex: 1
    },
    {
      id: "z1_q6",
      q: "Combien de Pokémon de type Insecte sont affublés du signe NU en 9ème génération ? (Hors PUBL)",
      choices: ["1", "2", "3", "4"],
      answerIndex: 1
    },
    {
      id: "z1_q7",
      q: "Quel est le double type qu’il faudrait que possède un type Insecte, afin qu’il n’ait plus qu’une seule faiblesse (double) ?",
      choices: ["Acier", "Roche", "Vol", "Dragon"],
      answerIndex: 0
    },
    {
      id: "z1_q8",
      q: "Quelle est la seule capacité de type Insecte pouvant empoisonner ?",
      choices: ["Dard-Nuée", "Double Dard", "Piqûre", "Plaie-Croix"],
      answerIndex: 1
    },
    {
      id: "z1_q9",
      q: "Combien de faiblesses possédait le type Insecte en 1ère génération ?",
      choices: ["2", "3", "4", "5"],
      answerIndex: 2
    },
    {
      id: "z1_q10",
      q: "Sur combien de types les capacités de type Insecte sont-elles peu efficaces, en 9ème génération ?",
      choices: ["5", "6", "7", "8"],
      answerIndex: 2
    },
    {
      id: "z1_q11",
      q: "Si on faisait la moyenne des BST totales de tous les types Insecte, quelle serait la statistique qui aurait la plus grande valeur ?",
      choices: ["Les PV", "L’attaque", "La défense", "La vitesse"],
      answerIndex: 1
    },
    {
      id: "z1_q12",
      q: "Comment sont appelés les PNJs adultes fan du type Insecte ?",
      choices: ["Les Dresseurs Bug", "Les Entomaniacs", "Les Scouts", "Les Collectionneurs"],
      answerIndex: 1
    },
    {
      id: "z1_q13",
      q: "Comment sont appelés les PNJs enfants fans du type Insecte ?",
      choices: ["Les Écoliers", "Les Rangers", "Les Scouts", "Les Entomaniacs"],
      answerIndex: 2
    },
    {
      id: "z1_q14",
      q: "Dans quelle région n’y a-t-il ni champion d’arène ni membre du conseil 4 ni Maître de la Ligue ayant le type Insecte comme type fétiche ?",
      choices: ["Sinnoh", "Unys", "Hoenn", "Kalos"],
      answerIndex: 2
    },

    {
      id: "z2_q1",
      q: "Combien y a-t-il de capacités de type Insecte ?",
      choices: ["28", "31", "34", "37"],
      answerIndex: 1
    },
    {
      id: "z2_q2",
      q: "Comment est appelé le type Insecte dans les pays anglophones ?",
      choices: ["Insect", "Beetle", "Bug", "Crawler"],
      answerIndex: 2
    },
    {
      id: "z2_q3",
      q: "Comment s’appelle le talent boostant les attaques Insecte quand son utilisateur possède moins d’un tiers de ses PVs ?",
      choices: ["Essaim", "Agitation", "Turbo", "Adaptabilité"],
      answerIndex: 0
    },
    {
      id: "z2_q4",
      q: "Quel est le nom de l’item (hors Plaque) boostant de 20% les dégâts des capacités de type Insecte ?",
      choices: ["Poudre Argentée", "Vive Griffe", "Bandeau Choix", "Roche Royale"],
      answerIndex: 0
    },
    {
      id: "z2_q5",
      q: "Quel est le talent, seulement possédé par des Pokémon de type Insecte, qui augmente la précision des capacités de son utilisateur ?",
      choices: ["Annule Garde", "Œil Composé", "Sniper", "Lentiteintée"],
      answerIndex: 1
    },
    {
      id: "z2_q6",
      q: "Quel est le nom de l’attaque Z du type Insecte ?",
      choices: ["Cocon Fatal", "Dard Mortel", "Essaim Suprême", "Toile Explosive"],
      answerIndex: 0
    },
    {
      id: "z2_q7",
      q: "Quel est le Pokémon qui a officieusement été banni de l’OverUsed 9G à cause, en partie, de sa possibilité de téracristalliser en type Insecte ?",
      choices: ["Rugit-Lune", "Fort-Ivoire", "Feu-Perçant", "Mite-de-Fer"],
      answerIndex: 2
    },
    {
      id: "z2_q8",
      q: "Quel est le nom de la capacité d’Entry Hazard du type Insecte ?",
      choices: ["Pics Toxik", "Picots", "Toile Gluante", "Danse-Lames"],
      answerIndex: 2
    },
    {
      id: "z2_q9",
      q: "Quelle puissance possède la capacité Taillade, lancée 6 fois d’affilée, en 9ème génération ?",
      choices: ["120", "140", "160", "180"],
      answerIndex: 2
    },
    {
      id: "z2_q10",
      q: "Quelle est la capacité que Nosférapti possédait dès le départ en 3ème génération, qu’il ne peut avoir dorénavant qu’au niveau 55 en 8ème génération ?",
      choices: ["Cru-Ailes", "Vampirisme", "Morsure", "Acrobatie"],
      answerIndex: 1
    },
    {
      id: "z2_q11",
      q: "Comment s’appelle la capacité de type Insecte pouvant booster de 3 niveaux une statistique ?",
      choices: ["Lumi-Queue", "Papillodanse", "Danse-Lames", "Repli"],
      answerIndex: 0
    },
    {
      id: "z2_q12",
      q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique de PV la plus élevée ?",
      choices: ["Mouscoto", "Pyrax", "Cancrelove", "Scolocendre"],
      answerIndex: 0
    },
    {
      id: "z2_q13",
      q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique d’attaque la plus élevée ?",
      choices: ["Cizayox", "Mouscoto", "Scarhino", "Fermite"],
      answerIndex: 1
    },
    {
      id: "z2_q14",
      q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique de défense la plus élevée ?",
      choices: ["Foretress", "Chrysapile", "Caratroc", "Crabaraque"],
      answerIndex: 2
    },

    {
      id: "z3_q1",
      q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique d’attaque spéciale la plus élevée ?",
      choices: ["Pyrax", "Yanmega", "Lucanon", "Aéromite"],
      answerIndex: 2
    },
    {
      id: "z3_q2",
      q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique de défense spéciale la plus élevée ?",
      choices: ["Caratroc", "Foretress", "Tarenbulle", "Blindépique"],
      answerIndex: 0
    },
    {
      id: "z3_q3",
      q: "Hors légendaires et méga-évolutions, quel est le Pokémon Insecte avec la statistique de vitesse la plus élevée ?",
      choices: ["Ninjask", "Limaspeed", "Papinox", "Yanmega"],
      answerIndex: 0
    },
    {
      id: "z3_q4",
      q: "Hors Little Cup et NFE, quel est le Pokémon Insecte avec la statistique de PV la plus faible ?",
      choices: ["Munja", "Larvadar", "Apitrini", "Crikzik"],
      answerIndex: 0
    },
    {
      id: "z3_q5",
      q: "Hors Little Cup et NFE, quel est le Pokémon Insecte avec la statistique d’attaque la plus faible ?",
      choices: ["Munja", "Caratroc", "Cancrelove", "Cheniselle"],
      answerIndex: 1
    },
    {
      id: "z3_q6",
      q: "Hors Little Cup et NFE, quel est le Pokémon Insecte avec la statistique de défense la plus faible ?",
      choices: ["Cancrelove", "Munja", "Apireine", "Maskadra"],
      answerIndex: 0
    },
    {
      id: "z3_q7",
      q: "Hors Little Cup et NFE, quel est le Pokémon Insecte avec la statistique d’attaque spéciale la plus faible ?",
      choices: ["Caratroc", "Munja", "Mélokrik", "Parasect"],
      answerIndex: 0
    },
    {
      id: "z3_q8",
      q: "Hors Little Cup et NFE, quel est le Pokémon Insecte avec la statistique de défense spéciale la plus faible ?",
      choices: ["Caratroc", "Munja", "Cancrelove", "Mimigal"],
      answerIndex: 1
    },
    {
      id: "z3_q9",
      q: "Hors Little Cup et NFE, quel est le Pokémon Insecte avec la statistique de vitesse la plus faible ?",
      choices: ["Caratroc", "Crabaraque", "Foretress", "Parasect"],
      answerIndex: 0
    },
    {
      id: "z3_q10",
      q: "Hors Little Cup et NFE, quel est le Pokémon Insecte avec la Base de Statistiques Totale la plus faible ?",
      choices: ["Munja", "Larvadar", "Apitrini", "Crikzik"],
      answerIndex: 0
    },
    {
      id: "z3_q11",
      q: "Quel est le Pokémon Insecte avec la Base de Statistiques Totale la plus faible ?",
      choices: ["Munja", "Larvadar", "Crikzik", "Cheniselle"],
      answerIndex: 1
    },
    {
      id: "z3_q12",
      q: "Hors légendaires et méga-évolutions, cite un des Pokémon Insecte avec la Base de Statistiques Totale la plus élevée.",
      choices: ["Mouscoto", "Cizayox", "Scarhino", "Ninjask"],
      answerIndex: 0
    },
    {
      id: "z3_q13",
      q: "Quelle est la statistique la plus élevée de Fermite ?",
      choices: ["Attaque", "Défense", "Vitesse", "Défense Spéciale"],
      answerIndex: 1
    },
    {
      id: "z3_q14",
      q: "Quelle est la statistique la plus élevée de Yanmega ?",
      choices: ["Vitesse", "Attaque", "Attaque Spéciale", "Défense Spéciale"],
      answerIndex: 2
    },

    {
      id: "z4_q1",
      q: "Quelle est la statistique la plus élevée de Manternel ?",
      choices: ["Attaque", "Défense", "PV", "Vitesse"],
      answerIndex: 0
    },
    {
      id: "z4_q2",
      q: "Quelle est la statistique la plus faible de Dardargnan ?",
      choices: ["PV", "Défense", "Attaque Spéciale", "Défense Spéciale"],
      answerIndex: 1
    },
    {
      id: "z4_q3",
      q: "Comment Léboulérou évolue-t-il ?",
      choices: [
        "Avec une Pierre Nuit",
        "En montant de niveau la nuit",
        "En marchant 1000 pas avec En Avant ! puis en gagnant un niveau",
        "En échange"
      ],
      answerIndex: 2
    },
    {
      id: "z4_q4",
      q: "Quel Pokémon de type Insecte possède une forme Gigamax ?",
      choices: ["Papilusion", "Cizayox", "Yanmega", "Mouscoto"],
      answerIndex: 0
    },
    {
      id: "z4_q5",
      q: "Combien de formes différentes Prismillon a-t-il ?",
      choices: ["18", "19", "20", "21"],
      answerIndex: 2
    },
    {
      id: "z4_q6",
      q: "Combien de formes différentes Cheniselle a-t-elle ?",
      choices: ["2", "3", "4", "5"],
      answerIndex: 1
    },
    {
      id: "z4_q7",
      q: "Qui a la meilleure Base de Statistiques Totale entre Caratroc et Scolocendre ?",
      choices: ["Caratroc", "Scolocendre", "Égalité", "Cela dépend du talent"],
      answerIndex: 1
    },
    {
      id: "z4_q8",
      q: "Qui a la meilleure Base de Statistiques Totale entre Foretress et Mélokrik ?",
      choices: ["Foretress", "Mélokrik", "Égalité", "Aucun des deux"],
      answerIndex: 0
    },
    {
      id: "z4_q9",
      q: "Qui a la meilleure Base de Statistiques Totale entre Munja et Apitrini ?",
      choices: ["Munja", "Apitrini", "Égalité", "Les deux ont 236"],
      answerIndex: 1
    },
    {
      id: "z4_q10",
      q: "Qui a la meilleure Base de Statistiques Totale entre Cizayox et Astronelle ?",
      choices: ["Cizayox", "Astronelle", "Égalité", "Cela dépend de la génération"],
      answerIndex: 1
    },
    {
      id: "z4_q11",
      q: "Qui a la meilleure Base de Statistiques Totale entre Astronelle et Ninjask ?",
      choices: ["Astronelle", "Ninjask", "Égalité", "Impossible à départager"],
      answerIndex: 0
    },
    {
      id: "z4_q12",
      q: "Qui a la meilleure Base de Statistiques Totale entre Chrysapile et Filentrappe ?",
      choices: ["Chrysapile", "Filentrappe", "Égalité", "Aucun des deux"],
      answerIndex: 1
    },
    {
      id: "z4_q13",
      q: "Qui a la meilleure Base de Statistiques Totale entre Insécateur et Caratroc ?",
      choices: ["Insécateur", "Caratroc", "Égalité", "Cela dépend de la nature"],
      answerIndex: 1
    },
    {
      id: "z4_q14",
      q: "Qui a la meilleure Base de Statistiques Totale entre Aéromite et Parasect ?",
      choices: ["Aéromite", "Parasect", "Égalité", "Aucun des deux"],
      answerIndex: 0
    },
    {
      id: "z4_q15",
      q: "À cause de quelle capacité vaut-il mieux capturer un Aspicot niveau 7 qu’un Coconfort du même niveau dans les 3 premières générations ?",
      choices: ["Mue", "Armure", "Essaim", "Fuite"],
      answerIndex: 1
    }
  ]
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

