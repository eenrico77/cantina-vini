# Cantina Vini — Roadmap verso la prima release

Ultimo aggiornamento: 13 luglio 2026.
Questo file vive nel repo apposta: aprilo in Antigravity a inizio sessione così l'agente ha subito il contesto.

## Come partire (oggi, prima di scrivere altro codice)

1. Apri la cartella `cantina-vini` in Antigravity.
2. `git init`, `git add -A`, primo commit ("stato dopo consolidamento schema/dati"). Da qui in poi ogni sessione = un commit, così se un fix ne rompe un altro puoi tornare indietro.
3. Esegui `supabase/migrations/0001_consolidation.sql` nell'SQL Editor di Supabase (non ancora fatto — è il prerequisito per tutto il resto).
4. `npm install && npm run dev`, apri `http://localhost:3000`, fai login, prova ad aggiungere un vino da `/cantina/new` e verifica che compaia in `/wines` e in `/cantina/[id]`. Questo è il test end-to-end minimo che qui non ho potuto fare io.
5. Se qualcosa si rompe in questo giro, sistemalo prima di aggiungere feature nuove: è la base su cui poggia tutto.

## Fase 1 — Fondamenta (stabilizzazione)

- [x] Un solo client Supabase, import coerenti
- [x] Form "nuovo vino" scrive su wines + bottles
- [x] Cellar di default automatica
- [x] Maturazione per annata (bottles.peak_start/peak_end/aging_status)
- [ ] Verifica reale in locale (punto 4 sopra) — **da fare con Antigravity**
- [ ] Primo commit git reale

## Fase 2 — Lista e scheda vino (rifinitura visiva)

Obiettivo: `/wines` e `/cantina/[id]` allo standard del benchmark (screenshot stile Vivino condivisi all'inizio).

- [ ] `/wines`: filtri (tipologia, maturazione, annata, regione, disponibilità)
- [ ] Card vino: immagine più curata, badge annata e stato maturazione già presenti da rifinire nello stile
- [ ] `/cantina/[id]`: hero con immagine rappresentativa grande, tab "Annate / Storico"
- [ ] Azioni rapide sulla bottiglia: segna come bevuta, rimuovi, modifica quantità/posizione

## Fase 3 — Aggiunta vino con foto + AI

Questa è la funzione distintiva del prodotto, va pianificata con calma perché richiede una decisione tecnica:

- [ ] **Decisione da prendere**: quale motore usare per riconoscere l'etichetta da foto (Gemini Vision, dato che sei già nell'ecosistema Google/Antigravity, è la scelta più naturale; alternativa: API Anthropic/OpenAI vision)
- [ ] **Decisione da prendere**: da dove arriva l'immagine "rappresentativa" pulita del vino dopo il riconoscimento (ricerca immagini via API, dataset/catalogo terzi, o generazione AI) — nessuna di queste è ancora scelta
- [ ] Flusso: scatto foto → riconoscimento AI → form pre-compilato per conferma/correzione → ricerca immagine rappresentativa → salvataggio (wine + bottle)
- [ ] Sostituire il mock in `lib/ai/enrichWine.ts` con la chiamata reale al motore scelto

## Fase 4 — Abbinamento cibo-vino

- [ ] Vino → cibo: sezione abbinamenti nella scheda dettaglio (può partire da regole semplici tipo/colore, poi evolvere con AI)
- [ ] Cibo → vino: input libero ("stasera mangio risotto ai funghi") che filtra e ordina solo le bottiglie realmente in cantina, con motivazione breve

## Fase 5 — Diario, statistiche, wishlist (post-MVP se il tempo stringe)

- [ ] `/diary`: storico bottiglie bevute (data, occasione, note, valutazione) — oggi è solo un placeholder
- [ ] `/stats`: conteggi, valore cantina, bottiglie pronte ora/in declino — oggi è solo un placeholder
- [ ] Wishlist vini desiderati

## Fase 6 — Pre-release

- [ ] Deploy su Vercel (o piattaforma scelta), variabili d'ambiente Supabase configurate lato hosting
- [ ] Controllo dei vincoli DB usati davvero dall'app (color, NOT NULL su bottles) contro tutti i form
- [ ] Passata di QA manuale su tutti i flussi: login, aggiungi vino, vedi lista, apri dettaglio, segna bevuta

## Decisioni aperte (da chiudere prima di iniziare le fasi corrispondenti)

| Decisione | Riguarda | Quando serve |
|---|---|---|
| Motore AI per riconoscimento etichetta | Fase 3 | Prima di iniziare il flusso foto |
| Fonte immagine rappresentativa | Fase 3 | Prima di iniziare il flusso foto |
| Gestione multi-cellar (UI dedicata o solo default) | Fase 2/6 | Prima della release se vuoi più di una "cantina" |
| Piattaforma di deploy | Fase 6 | A ridosso della release |

## Cosa NON fare ora (deciso insieme, per non disperdere tempo)

- Niente visualizzazione 3D della cantina (fuori scope, eventuale fase futura)
- Niente funzioni social/community (contro la visione di prodotto)
- Niente refactor strutturali ulteriori sul modello dati: wines/bottles/cellars è quello giusto, si costruisce sopra, non si ridiscute
