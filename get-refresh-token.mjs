// Post scheda business FR18
// Script da eseguire IN LOCALE, una sola volta, per ottenere il refresh token
// di Google Business Profile. Va eseguito da te (serve il login con il TUO
// account Google, proprietario della scheda FotoRoma18) — non viene eseguito
// dall'automazione su GitHub.
//
// Uso:
//   GBP_CLIENT_ID=xxx GBP_CLIENT_SECRET=yyy node get-refresh-token.mjs
//
// Il Client ID deve essere di tipo "Applicazione desktop" creato nella stessa
// Google Cloud Project in cui hai abilitato le Business Profile API.

import http from "node:http";
import { URL } from "node:url";

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPE = "https://www.googleapis.com/auth/business.manage";

const CLIENT_ID = process.env.GBP_CLIENT_ID;
const CLIENT_SECRET = process.env.GBP_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Imposta GBP_CLIENT_ID e GBP_CLIENT_SECRET come variabili d'ambiente prima di eseguire lo script.");
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

console.log("\nApri questo link nel browser DOVE SEI LOGGATO con l'account Google");
console.log("proprietario della scheda Google Business Profile di FotoRoma18:\n");
console.log(authUrl.toString());
console.log("\nIn attesa dell'autorizzazione...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>Autorizzazione negata o mancante.</h1>");
    server.close();
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Fatto! Puoi chiudere questa finestra e tornare al terminale.</h1>");
  server.close();

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Errore nello scambio del code:", tokens);
      process.exit(1);
    }

    console.log("\n=== REFRESH TOKEN (da salvare come secret GBP_REFRESH_TOKEN su GitHub) ===");
    console.log(tokens.refresh_token);
    console.log("===========================================================================\n");

    if (!tokens.refresh_token) {
      console.warn(
        "Attenzione: nessun refresh_token ricevuto. Probabile causa: avevi già autorizzato " +
          "questa app in precedenza. Vai su https://myaccount.google.com/permissions, revoca " +
          "l'accesso all'app e riesegui questo script."
      );
      return;
    }

    await listAccountsAndLocations(tokens.access_token);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

async function listAccountsAndLocations(accessToken) {
  console.log("Recupero account e location Google Business Profile collegati...\n");

  const accountsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const accountsData = await accountsRes.json();
  if (!accountsRes.ok) {
    console.error("Impossibile leggere gli account:", accountsData);
    return;
  }

  for (const account of accountsData.accounts || []) {
    console.log(`Account: ${account.name}  (${account.accountName || ""})`);

    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title&pageSize=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const locData = await locRes.json();
    if (!locRes.ok) {
      console.log(`  Impossibile leggere le location: ${JSON.stringify(locData)}`);
      continue;
    }

    for (const loc of locData.locations || []) {
      console.log(`  Location: ${loc.name}  (${loc.title || ""})`);
    }
  }

  console.log("\nUsa i valori 'accounts/...' e 'locations/...' qui sopra per i secret");
  console.log("GBP_ACCOUNT_ID e GBP_LOCATION_ID su GitHub.");
}

server.listen(PORT);
