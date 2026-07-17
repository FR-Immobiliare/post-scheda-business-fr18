# Post scheda business FR18

Automazione che pubblica **2 post a settimana** (lunedì e giovedì) sulla
scheda Google Business Profile di **FotoRoma18**, scegliendo foto e
didascalie in modo automatico, senza intervento manuale e senza API a
pagamento.

- **Foto**: [`images/`](./images) — 137 foto JPG, categorizzate per tipo di servizio
- **Didascalie**: [`captions.json`](./captions.json) — 42 testi in italiano già scritti, nessuna AI generativa a runtime
- **Script di pubblicazione**: [`publish-post.mjs`](./publish-post.mjs) — sceglie foto+didascalia in base alla data e chiama l'API di Google Business Profile
- **Hosting immagini**: GitHub Pages di questo stesso repo (gratuito)
- **Scheduler**: [`.github/workflows/gbp-post.yml`](./.github/workflows/gbp-post.yml) — GitHub Actions, gratuito per repo pubblici

Repository separato dal sito [FotoRoma18.it](https://www.fotoroma18.it):
questa automazione non tocca mai il codice o il deploy del sito.

## Come funziona la selezione di foto e didascalie

Nessuno stato salvato da qualche parte: la scelta è **deterministica in base
alla data**. Ogni esecuzione (lunedì o giovedì) calcola uno "slot" crescente
che seleziona foto e didascalia a rotazione. Con 137 foto e 2 post a
settimana, il ciclo completo dura oltre un anno prima di ripetersi.

## Setup (una tantum, richiede il tuo account Google)

Il codice qui dentro è pronto e funzionante. Quello che manca è
l'autorizzazione lato Google, che solo il proprietario della scheda può
concedere. Segui [`SETUP.md`](./SETUP.md) passo passo.

## Test

```bash
DRY_RUN=true node publish-post.mjs
```

Stampa quale foto e quale didascalia verrebbero usate oggi, senza chiamare
l'API di Google.
