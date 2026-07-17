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
- [x] Credenziali OAuth create — Client ID:
      `873163525560-a3kalrnh1qvlfrsjl0sjvcs2hb44m8cp.apps.googleusercontent.com`
      (tipo Applicazione desktop, nome "Post scheda business FR18 - desktop").
      Il **Client secret** non è stato salvato qui per sicurezza: recuperalo tu
      da Google Cloud Console → API e servizi → Credenziali → clicca sul
      client per vederlo
- [ ] Refresh token (passo 7 sotto — richiede il tuo login personale)
- [ ] App Password Gmail per le notifiche email (passo 8 sotto)
- [ ] Secret su GitHub (passo 9 sotto)

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

Client OAuth creato (tipo Applicazione desktop):

- **Client ID**: `873163525560-a3kalrnh1qvlfrsjl0sjvcs2hb44m8cp.apps.googleusercontent.com`
- **Client secret**: da recuperare tu su
  [console.cloud.google.com/auth/clients](https://console.cloud.google.com/auth/clients?project=fotoroma18-automazione),
  clicca su "Post scheda business FR18 - desktop" per visualizzarlo

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

## 7. Ottieni il refresh token (in locale, una sola volta)

Una volta approvato l'accesso (punto 6) e create le credenziali (punto 5),
dal tuo Mac, dentro questo repository:

```bash
GBP_CLIENT_ID="873163525560-a3kalrnh1qvlfrsjl0sjvcs2hb44m8cp.apps.googleusercontent.com" \
GBP_CLIENT_SECRET="il-client-secret-che-hai-recuperato-al-passo-5" \
  node get-refresh-token.mjs
```

Lo script apre un link: aprilo nel browser dove sei loggato con l'account
Google proprietario della scheda, autorizza l'app. Lo script stamperà:

- il **refresh token**
- l'elenco di `accounts/...` e `locations/...` collegati al tuo account, da
  cui prendere `GBP_ACCOUNT_ID` e `GBP_LOCATION_ID`

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
| `GBP_CLIENT_ID` | `873163525560-a3kalrnh1qvlfrsjl0sjvcs2hb44m8cp.apps.googleusercontent.com` |
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
