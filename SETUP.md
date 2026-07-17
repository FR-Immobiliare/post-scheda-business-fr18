# Setup — Post scheda business FR18

La parte di automazione (workflow GitHub, script di pubblicazione, foto,
didascalie) è già pronta in questo repository.

## Stato attuale

- [x] Progetto Google Cloud creato: **FotoRoma18 Automazione**
      (ID: `fotoroma18-automazione`, numero progetto: `873163525560`)
- [x] API abilitate: My Business Account Management API, My Business Business
      Information API
- [x] Richiesta di accesso alle Business Profile API **inviata** a Google —
      ID richiesta: `5-8305000040987`, tempi di revisione stimati da Google:
      **7-10 giorni lavorativi**
- [x] Schermata di consenso OAuth configurata (tipo Esterno, scope
      `business.manage` aggiunto, `fotoroma18@gmail.com` come utente di prova)
- [x] Credenziali OAuth create — 2 client:
      - `873163525560-a3kalrnh1qvlfrsjl0sjvcs2hb44m8cp.apps.googleusercontent.com`
        (tipo Applicazione desktop, "Post scheda business FR18 - desktop") —
        creato per `get-refresh-token.mjs`, ma il Client secret è andato perso
        (Google mostra i secret in chiaro solo una volta, subito dopo la
        creazione — non riguardato in tempo)
      - **`873163525560-bg052sa3lbc1p7krgntlsr0vqsouct46.apps.googleusercontent.com`**
        (tipo Applicazione web, "Post scheda business FR18 - playground",
        redirect URI `https://developers.google.com/oauthplayground`) — **è
        questo il client da usare**, con [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
        invece dello script locale, per evitare i problemi di quoting del
        terminale col Client secret
- [ ] Refresh token — **quasi fatto**, bloccato da un errore temporaneo
      (vedi nota sotto)
- [x] App Password Gmail per le notifiche email (passo 8 sotto)
- [ ] Secret su GitHub (passo 9 sotto) — **2 di 7 impostati**: `EMAIL_USER` ✅,
      `EMAIL_APP_PASSWORD` ✅. Mancano `GBP_CLIENT_ID`, `GBP_CLIENT_SECRET`,
      `GBP_REFRESH_TOKEN`, `GBP_ACCOUNT_ID`, `GBP_LOCATION_ID`

Quello che segue sono i passaggi rimasti, che **devi completarli tu**
perché richiedono il tuo login Google personale o l'inserimento diretto di
credenziali — Google richiede esplicitamente che sia il proprietario della
scheda a farli, e per policy di sicurezza non gestisco io token/password.

## 1. Verifica di essere Owner (non Manager) della scheda

Già verificato: la scheda FotoRoma18 risulta verificata e associata
all'account `fotoroma18@gmail.com` usato per la richiesta di accesso.

## 2. Progetto Google Cloud — fatto

Progetto **FotoRoma18 Automazione** (`fotoroma18-automazione`, numero
`873163525560`) già creato.

## 3. API abilitate — fatto

- My Business Account Management API ✅
- My Business Business Information API ✅
- L'API che espone `localPosts` (`mybusiness.googleapis.com`) non compare più
  nella libreria API pubblica di Google Cloud: si sblocca automaticamente sul
  progetto una volta che la richiesta di accesso (punto 6) viene approvata,
  senza bisogno di un'attivazione manuale separata.

## 4. Schermata di consenso OAuth — fatto

Configurata su Google Auth Platform, progetto "FotoRoma18 Automazione":

- Tipo: Esterno
- Email di assistenza e di contatto: `fotoroma18@gmail.com`
- Scope aggiunto: `https://www.googleapis.com/auth/business.manage`
- Utente di prova aggiunto: `fotoroma18@gmail.com`

## 5. Credenziali OAuth — fatto

Client OAuth "Post scheda business FR18 - playground" creato (tipo
Applicazione web, redirect URI `https://developers.google.com/oauthplayground`):

- **Client ID**: `873163525560-bg052sa3lbc1p7krgntlsr0vqsouct46.apps.googleusercontent.com`
- **Client secret**: già recuperato e inserito nell'OAuth Playground (punto 7).
  Se ti serve di nuovo: [console.cloud.google.com/auth/clients](https://console.cloud.google.com/auth/clients?project=fotoroma18-automazione)
  → client → icona (i) in alto a destra → "Add secret" → icona di copia
  accanto al nuovo secret (visibile/copiabile solo subito dopo averlo creato)

## 6. Richiesta di accesso alle Business Profile API — inviata

Richiesta inviata il 2026-07-17 tramite il modulo ufficiale Google, con
account `fotoroma18@gmail.com`, scheda **FotoRoma18**, progetto
`873163525560`, sito `https://www.fotoroma18.it`.

- **ID richiesta: `5-8305000040987`**
- Tempi di revisione stimati da Google: **7-10 giorni lavorativi**
- Riceverai un'email di follow-up da Google quando la richiesta sarà stata
  esaminata

Puoi anche verificare lo stato di approvazione dalla console Google Cloud:
vai su "API e servizi → Quote" e cerca le Business Profile API. Quota a 0
QPM = non ancora approvato; quota a 300 QPM = approvato.

## 7. Ottieni il refresh token — quasi fatto, riprendi da qui

Invece dello script locale (il terminale ha dato troppi problemi di
quoting con il Client secret), usiamo l'[OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
di Google — tutto nel browser, nessun terminale:

1. Apri [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground/)
2. Icona ⚙️ in alto a destra → spunta "Use your own OAuth credentials"
3. **OAuth Client ID**: `873163525560-bg052sa3lbc1p7krgntlsr0vqsouct46.apps.googleusercontent.com`
4. **OAuth Client secret**: incollalo (vedi punto 5 se l'hai perso)
5. "Close"
6. Campo "Input your own scopes": `https://www.googleapis.com/auth/business.manage`
7. "Authorize APIs" → accedi/consenti con `fotoroma18@gmail.com`
8. Step 2 → "Exchange authorization code for tokens" → compare il **Refresh token**

**Nota**: al primo tentativo (17 luglio, ore 21 circa) è comparso l'errore
`Errore 401: invalid_client — The OAuth client was not found`. È il ritardo
di propagazione che Google stessa segnala alla creazione del client ("da
cinque minuti a qualche ora"). Riprova semplicemente a rifare il punto 7
(non serve ripetere la configurazione, resta salvata) — dovrebbe funzionare
da solo dopo un po' di tempo.

Una volta ottenuto il Refresh token, impostalo su GitHub (da terminale,
incollando quando richiesto — mai nel comando):

```bash
cd "/Users/antoniopicariello/Documents/Cursor Repo/post-scheda-business-fr18"
gh secret set GBP_REFRESH_TOKEN --repo FR-Immobiliare/post-scheda-business-fr18
gh secret set GBP_CLIENT_SECRET --repo FR-Immobiliare/post-scheda-business-fr18
gh secret set GBP_CLIENT_ID --repo FR-Immobiliare/post-scheda-business-fr18 --body "873163525560-bg052sa3lbc1p7krgntlsr0vqsouct46.apps.googleusercontent.com"
```

Poi, sempre nel Playground, **Step 3** ("Configure request to API"):

- Request URI: `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`
  → "Send the request" → nella risposta JSON, il campo `"name": "accounts/NNNNNNNNN"`
  è il tuo `GBP_ACCOUNT_ID`
- Poi Request URI: `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/NNNNNNNNN/locations`
  → nella risposta, `"name": "locations/NNNNNNNNN"` è il tuo `GBP_LOCATION_ID`

Questi due non sono segreti (sono solo identificativi), quindi puoi anche
scriverli direttamente in chat se vuoi che li imposti io.

## 8. Crea un App Password Gmail per le notifiche email

L'automazione manda una mail a `fotoroma18@gmail.com` ad ogni pubblicazione
(riuscita o fallita). Per farlo usa l'SMTP di Gmail, che richiede un **App
Password** (non la tua password normale):

1. Vai su [myaccount.google.com/security](https://myaccount.google.com/security)
   con l'account `fotoroma18@gmail.com`
2. Attiva la **Verifica in due passaggi** se non è già attiva (obbligatoria
   per generare un App Password)
3. Vai su [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords),
   crea un nuovo App Password (nome a piacere, es. "Post scheda business FR18")
4. Annota la password di 16 caratteri generata

Questo passaggio è del tutto separato e indipendente dalla richiesta di
accesso alle Business Profile API (punto 6): puoi farlo subito, non serve
aspettare l'approvazione di Google.

## 9. Imposta i secret su GitHub

Nel repository GitHub `FR-Immobiliare/post-scheda-business-fr18` → Settings →
Secrets and variables → Actions, crea questi 7 secret (fallo tu direttamente
su GitHub, via interfaccia web o `gh secret set NOME_SECRET`, incollando i
valori ottenuti ai passi precedenti — evita di condividerli in chat):

| Secret | Valore |
|---|---|
| `GBP_CLIENT_ID` | `873163525560-bg052sa3lbc1p7krgntlsr0vqsouct46.apps.googleusercontent.com` |
| `GBP_CLIENT_SECRET` | Client secret OAuth (passo 5 — recuperalo dalla console) |
| `GBP_REFRESH_TOKEN` | Refresh token (passo 7) |
| `GBP_ACCOUNT_ID` | es. `accounts/106xxxxxxxxxxxxxxxxx` (passo 7) |
| `GBP_LOCATION_ID` | es. `locations/98xxxxxxxxxxxxxxxxx` (passo 7) |
| `EMAIL_USER` | `fotoroma18@gmail.com` |
| `EMAIL_APP_PASSWORD` | App Password di 16 caratteri (passo 8) |

## 10. Testa l'automazione

Da GitHub → Actions → "Pubblica post Google Business Profile (FR18)" → "Run
workflow", lascia "dry_run" su `false` per un test reale, oppure `true` per
verificare solo la selezione di foto/didascalia senza pubblicare nulla.

In locale puoi anche testare la sola logica di selezione, senza toccare le
API di Google:

```bash
DRY_RUN=true node publish-post.mjs
```

Da quel momento in poi il workflow gira da solo ogni lunedì e giovedì alle
8:00 UTC (le 9:00 circa, ora italiana).
