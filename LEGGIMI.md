# dariomap.com — istruzioni per la pubblicazione

## Struttura del sito

- `index.html` — homepage (about, news, pubblicazioni selezionate)
- `research.html` — tutte le pubblicazioni e i lavori in corso
- `teaching.html` — corsi attuali e passati
- `resources.html` — dataset per la ricerca
- `contact.html` — contatti
- `admin.html` — pannello di amministrazione (vedi sotto)
- `data/content.js` — **tutti i contenuti del sito sono qui**: news, pubblicazioni, corsi, risorse. Modificando questo file (a mano o via admin) si aggiorna il sito.

## Pubblicazione su GitHub Pages (consigliata)

1. Vai su https://github.com e crea un nuovo repository (es. `dariomap-site`), pubblico.
2. Nella pagina del repository clicca "uploading an existing file" e trascina **tutti i file e le cartelle** di questo pacchetto. Conferma con "Commit changes".
3. Vai in **Settings → Pages**, sotto "Build and deployment" scegli Source: "Deploy from a branch", Branch: `main`, cartella `/ (root)`. Salva.
4. Dopo 1–2 minuti il sito è online su `https://TUOUTENTE.github.io/dariomap-site/`.

## Collegare il dominio dariomap.com

1. In **Settings → Pages → Custom domain** inserisci `www.dariomap.com` e salva (GitHub crea un file CNAME nel repo).
2. Nel pannello DNS del tuo dominio (Wix o altro registrar):
   - record **CNAME**: nome `www` → valore `TUOUTENTE.github.io`
   - per il dominio nudo `dariomap.com`, quattro record **A** verso: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
3. Attendi la propagazione DNS (da pochi minuti a 24–48 ore), poi in Settings → Pages spunta "Enforce HTTPS".

## Pannello di amministrazione

`admin.html` (raggiungibile su www.dariomap.com/admin.html) permette di aggiungere news e pubblicazioni e modificare tutto il resto senza toccare il codice.

Serve un token GitHub:
1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: solo il repo del sito. Permissions: **Contents → Read and write**. Scadenza a piacere (es. 1 anno).
3. Nel pannello inserisci utente GitHub, nome repo e token, poi "Carica contenuti".

Il token non viene salvato: va incollato a ogni sessione (puoi conservarlo in un password manager).

## Modifiche manuali

In alternativa all'admin, puoi modificare `data/content.js` direttamente su GitHub (icona matita sul file) — il sito si aggiorna da solo dopo il commit.
