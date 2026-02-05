const { onRequest } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_ME_URL = "https://discord.com/api/users/@me";

// ✅ Params (nouvelle méthode, remplace functions.config())
const DISCORD_CLIENT_ID = defineString("DISCORD_CLIENT_ID");
const DISCORD_CLIENT_SECRET = defineString("DISCORD_CLIENT_SECRET");
const DISCORD_REDIRECT_URI = defineString("DISCORD_REDIRECT_URI");

exports.discordAuth = onRequest(
  {
    region: "us-central1",
    cors: true,
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") return res.status(405).send("Use POST");

      const { code } = req.body || {};
      if (!code) return res.status(400).json({ error: "Missing code" });

      const clientId = DISCORD_CLIENT_ID.value();
      const clientSecret = DISCORD_CLIENT_SECRET.value();
      const redirectUri = DISCORD_REDIRECT_URI.value();

      // 1) Exchange code -> access_token
      console.log("ENV redirect:", DISCORD_REDIRECT_URI.value());
      const params = new URLSearchParams();
      params.set("client_id", clientId);
      params.set("client_secret", clientSecret);
      params.set("grant_type", "authorization_code");
      params.set("code", code);
      params.set("redirect_uri", redirectUri);

      const tokenResp = await fetch(DISCORD_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const tokenData = await tokenResp.json();
      if (!tokenResp.ok) {
        return res.status(400).json({ error: "Token exchange failed", details: tokenData });
      }

      const accessToken = tokenData.access_token;

      // 2) Get Discord user
      const meResp = await fetch(DISCORD_ME_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const me = await meResp.json();
      if (!meResp.ok) {
        return res.status(400).json({ error: "Discord /@me failed", details: me });
      }

      const discordId = me.id;
      const username = me.username;

      // 3) Firebase custom token
      const uid = `discord:${discordId}`;
      const customToken = await admin.auth().createCustomToken(uid, {
        provider: "discord",
        discordId,
        username,
      });

      return res.json({ token: customToken, discord: { id: discordId, username } });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: String(e?.message || e) });
    }
  }
);

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { google } = require("googleapis");

const SHEET_ID = "1104vT2kRD4ITj7USk9GmtTJePPiiwqSeGxj3Y6HUD8Y";
const TAB_NAME = "Plays"; // crée un onglet "Plays" dans le sheet

async function appendToSheet(row) {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // On écrit A:F (F = playId, utile si tu veux filtrer/dédoublonner plus tard)
  const range = `${TAB_NAME}!A:F`;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

exports.exportPlayToSheets = onDocumentCreated(
  {
    document: "plays/{playId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const play = snap.data();
    const playId = event.params.playId;

    const createdAtISO = snap.createTime?.toDate
      ? snap.createTime.toDate().toISOString()
      : new Date().toISOString();

    const pseudo = play.pseudo || "";
    const pokemonName = play?.pokemon?.name || "";
    const weekNumber = play.weekNumber ?? "";
    const zoneFinale = play.failedAtZone ? `Zone ${play.failedAtZone}` : "Zone 4";

    // Colonnes: createdAt | pseudo | pokemonName | week | zone | playId
    await appendToSheet([createdAtISO, pseudo, pokemonName, weekNumber, zoneFinale, playId]);
  }
);
