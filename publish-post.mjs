// Post scheda business FR18
// Pubblica un post automatico sulla scheda Google Business Profile di FotoRoma18.
// Selezione foto/didascalia deterministica in base alla data: nessuno stato da salvare.
// Eseguito da .github/workflows/gbp-post.yml due volte a settimana (lunedì e giovedì).

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { notifySuccess, notifyFailure } from "./notify.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, "images");

// Dove sono ospitate le immagini (GitHub Pages di questo stesso repo).
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "https://fr-immobiliare.github.io/post-scheda-business-fr18";
// Il sito vero e proprio, usato solo come link "Scopri di più" nel post.
const BUSINESS_URL = process.env.BUSINESS_URL || "https://www.fotoroma18.it";

const DRY_RUN = process.env.DRY_RUN === "true";

// epoch scelto arbitrariamente: la prima settimana utile per l'automazione.
const EPOCH = Date.UTC(2026, 0, 5); // lunedì 5 gennaio 2026

function categoryForFile(filename) {
  const name = filename.replace(/\.jpg$/i, "");
  if (name.startsWith("specchio_magico")) return "specchio_magico";
  if (name.startsWith("guest_book")) return "guest_book";
  if (name.startsWith("photo_booth")) return "photo_booth";
  if (name.startsWith("sparkular")) return "sparkular";
  if (name.startsWith("drone")) return "drone";
  if (name.startsWith("video")) return "video";
  return "gallery";
}

function loadPhotos() {
  return readdirSync(IMAGES_DIR)
    .filter((f) => f.toLowerCase().endsWith(".jpg"))
    .sort()
    .map((file) => ({ file, category: categoryForFile(file) }));
}

function loadCaptions() {
  const raw = readFileSync(path.join(__dirname, "captions.json"), "utf8");
  return JSON.parse(raw);
}

// Slot crescente e deterministico: 2 per settimana (lunedì=0, giovedì=1).
// Funziona per qualunque data di esecuzione, purché il cron spari solo lunedì/giovedì.
function computeSlot(now = new Date()) {
  const daysSinceEpoch = Math.floor((now.getTime() - EPOCH) / 86_400_000);
  const weeksSinceEpoch = Math.floor(daysSinceEpoch / 7);
  const dayOfWeek = now.getUTCDay(); // 1 = lunedì, 4 = giovedì
  const dayOffset = dayOfWeek === 4 ? 1 : 0;
  return weeksSinceEpoch * 2 + dayOffset;
}

function pickPost(now = new Date()) {
  const photos = loadPhotos();
  const captions = loadCaptions();
  if (photos.length === 0) throw new Error("Nessuna foto trovata in images/");

  const slot = computeSlot(now);
  const photo = photos[((slot % photos.length) + photos.length) % photos.length];
  const pool = captions[photo.category]?.length ? captions[photo.category] : captions.gallery;
  const caption = pool[((slot % pool.length) + pool.length) % pool.length];

  return {
    slot,
    photo,
    caption,
    sourceUrl: `${IMAGE_BASE_URL}/images/${photo.file}`,
  };
}

async function getAccessToken() {
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    throw new Error("Mancano GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GBP_CLIENT_ID,
      client_secret: GBP_CLIENT_SECRET,
      refresh_token: GBP_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Refresh token fallito: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function createLocalPost(accessToken, post) {
  const { GBP_ACCOUNT_ID, GBP_LOCATION_ID } = process.env;
  if (!GBP_ACCOUNT_ID || !GBP_LOCATION_ID) {
    throw new Error("Mancano GBP_ACCOUNT_ID / GBP_LOCATION_ID");
  }

  const url = `https://mybusiness.googleapis.com/v4/${GBP_ACCOUNT_ID}/${GBP_LOCATION_ID}/localPosts`;
  const body = {
    languageCode: "it",
    summary: post.caption,
    callToAction: { actionType: "LEARN_MORE", url: BUSINESS_URL },
    media: [{ mediaFormat: "PHOTO", sourceUrl: post.sourceUrl }],
    topicType: "STANDARD",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Creazione post fallita: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const post = pickPost();
  console.log(`Slot #${post.slot} -> foto: ${post.photo.file} (categoria: ${post.photo.category})`);
  console.log(`Didascalia: ${post.caption}`);
  console.log(`Immagine: ${post.sourceUrl}`);

  if (DRY_RUN) {
    console.log("DRY_RUN attivo: nessuna chiamata a Google eseguita.");
    return;
  }

  const accessToken = await getAccessToken();
  const result = await createLocalPost(accessToken, post);
  console.log("Post pubblicato:", result.name || result);
  await notifySuccess(post, result);
}

main().catch(async (err) => {
  console.error(err);
  await notifyFailure(err);
  process.exit(1);
});
