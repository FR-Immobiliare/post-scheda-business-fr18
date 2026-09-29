// Scarica tutte le recensioni della scheda Google Business Profile di FotoRoma18
// e le salva in reviews/fotoroma18.json, pubblicato da GitHub Pages.
// Il sito fotoroma18.it legge quel file al momento del build: le credenziali
// restano qui, nei secrets di questo repo, e non arrivano mai sul sito.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";

const OUT_DIR = "reviews";
const OUT_FILE = `${OUT_DIR}/fotoroma18.json`;
const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

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
  if (!res.ok) throw new Error(`Refresh token fallito: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

// Google aggiunge la traduzione automatica al testo: teniamo solo l'originale.
function cleanComment(text = "") {
  let t = text;
  const original = t.match(/\(Original\)\s*([\s\S]*)$/i) || t.match(/\(Originale\)\s*([\s\S]*)$/i);
  if (original) t = original[1];
  t = t.replace(/\(Translated by Google\)[\s\S]*$/i, "").replace(/\(Tradotto da Google\)[\s\S]*$/i, "");
  return t.trim();
}

// "Giulia Rossi" -> "Giulia R.": riconoscibile, ma non il nome completo.
function shortName(displayName, isAnonymous) {
  if (isAnonymous || !displayName) return "Cliente Google";
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

async function fetchAllReviews(token) {
  const { GBP_ACCOUNT_ID, GBP_LOCATION_ID } = process.env;
  if (!GBP_ACCOUNT_ID || !GBP_LOCATION_ID) throw new Error("Mancano GBP_ACCOUNT_ID / GBP_LOCATION_ID");

  const base = `https://mybusiness.googleapis.com/v4/${GBP_ACCOUNT_ID}/${GBP_LOCATION_ID}/reviews`;
  let pageToken = "";
  let averageRating = null;
  let totalReviewCount = null;
  const reviews = [];

  for (let page = 0; page < 100; page++) {
    const url = new URL(base);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Lettura recensioni fallita: ${res.status} ${await res.text()}`);
    const data = await res.json();

    averageRating ??= data.averageRating ?? null;
    totalReviewCount ??= data.totalReviewCount ?? null;
    reviews.push(...(data.reviews || []));

    pageToken = data.nextPageToken || "";
    if (!pageToken) break;
  }

  return { averageRating, totalReviewCount, reviews };
}

function normalize({ averageRating, totalReviewCount, reviews }) {
  const items = reviews.map((r) => ({
    id: r.reviewId,
    author: shortName(r.reviewer?.displayName, r.reviewer?.isAnonymous),
    rating: STARS[r.starRating] ?? null,
    text: cleanComment(r.comment),
    date: r.createTime,
    reply: r.reviewReply?.comment ? cleanComment(r.reviewReply.comment) : null,
  }));

  return {
    source: "Google Business Profile",
    placeUrl: "https://maps.app.goo.gl/VWSvbbjGwk254Cz67",
    averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
    totalReviewCount,
    reviews: items,
  };
}

async function main() {
  const token = await getAccessToken();
  const raw = await fetchAllReviews(token);
  const data = normalize(raw);

  const withText = data.reviews.filter((r) => r.text).length;
  console.log(
    `Recensioni: ${data.totalReviewCount} totali, media ${data.averageRating}, ` +
      `${data.reviews.length} scaricate (${withText} con testo).`
  );
  if (!data.reviews.length) throw new Error("Nessuna recensione ricevuta: non sovrascrivo il file.");

  // Scrive solo se il contenuto è cambiato, così niente commit (e niente deploy) inutili.
  const next = JSON.stringify(data, null, 2) + "\n";
  const prev = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : "";
  if (prev === next) {
    console.log("Nessuna novità rispetto all'ultimo file.");
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, next);
  console.log(`Aggiornato ${OUT_FILE}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
