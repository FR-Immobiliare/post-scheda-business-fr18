# Setup — Post scheda business FR18

La parte di automazione (workflow GitHub, script di pubblicazione, foto,
didascalie) è già pronta in questo repository. Quello che segue sono i passaggi
che **devi completare tu**, perché richiedono il tuo login Google come
proprietario della scheda: non è qualcosa che un'automazione può fare al posto
tuo, e Google richiede esplicitamente che sia il proprietario a farne
richiesta.

Metti in conto **da qualche giorno a qualche settimana** per l'approvazione di
Google: non è un processo istantaneo.

## 1. Verifica di essere Owner (non Manager) della scheda

Vai su [business.google.com](https://business.google.com), apri la scheda
FotoRoma18 → Impostazioni → Utenti e assicurati che il tuo account sia
**Proprietario**. Se sei solo gestore, la richiesta di accesso API verrà
respinta.

La scheda deve inoltre essere verificata da **almeno 60 giorni**.

## 2. Crea un progetto Google Cloud

1. Vai su [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuovo progetto (es. "FotoRoma18 Automazione")
3. Annota il **numero di progetto** (Project number), ti servirà per la
   richiesta di accesso

## 3. Abilita le API necessarie

Nella libreria API del progetto, abilita:

- **My Business Account Management API**
- **My Business Business Information API**
- **My Business API** (quella che espone `localPosts`)

## 4. Configura la schermata di consenso OAuth

In "API e servizi → Schermata consenso OAuth":

- Tipo: Esterno
- Aggiungi il tuo indirizzo email come utente di test (finché l'app non è
  verificata, solo gli utenti di test possono autorizzarla)
- Scope da aggiungere: `https://www.googleapis.com/auth/business.manage`

## 5. Crea le credenziali OAuth

In "API e servizi → Credenziali → Crea credenziali → ID client OAuth":

- Tipo di applicazione: **Applicazione desktop**
- Annota **Client ID** e **Client secret**

## 6. Richiedi l'accesso alle Business Profile API

Ogni nuovo progetto Google Cloud parte con quota zero per queste API: le
chiamate falliscono finché Google non approva la richiesta.

Compila il modulo ufficiale: cerca su Google "Google Business Profile API
access request form" (o vai su
[support.google.com/business](https://support.google.com/business) e cerca
"Applying for Google Business Profile API access") e scegli **"Application
for Basic API Access"**.

Punti a cui fare attenzione, perché causano rifiuto automatico:

- Devi essere loggato con l'account **Owner**, non Manager
- Il numero di progetto Google Cloud nel modulo deve essere lo stesso in cui
  hai creato le credenziali OAuth
- Descrivi il caso d'uso in modo specifico: "pubblicare automaticamente foto
  del nostro studio fotografico (FotoRoma18) sulla nostra scheda Google
  Business Profile tramite `accounts.locations.localPosts.create`", non frasi
  generiche

## 7. Ottieni il refresh token (in locale, una sola volta)

Una volta approvato l'accesso, dal tuo Mac, dentro questo repository:

```bash
GBP_CLIENT_ID="il-tuo-client-id" GBP_CLIENT_SECRET="il-tuo-client-secret" \
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
| `GBP_CLIENT_ID` | Client ID OAuth (passo 5) |
| `GBP_CLIENT_SECRET` | Client secret OAuth (passo 5) |
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
