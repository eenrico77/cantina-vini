# Cantina Vini — Roadmap verso la prima release

Ultimo aggiornamento: 13 luglio 2026.
Questo file vive nel repo apposta: aprilo in Antigravity a inizio sessione così l'agente ha subito il contesto.

## Filosofia di sequenza (deciso il 13/07/2026)

Prima tutte le funzionalità, con segnaposto (foto stock, testo generico, mock dove serve).
Poi, in un'unica passata finale, grafica/usabilità/immagini vere su tutto insieme.

Perché in questo ordine: le parti più incerte del progetto sono il riconoscimento foto+AI
e l'abbinamento cibo-vino — vanno provate presto per scoprire se e come funzionano davvero,
prima di investire tempo nella rifinitura visiva. Con Tailwind (già in uso) cambiare colori
e stile dopo costa poco: non si butta via lavoro rimandando la grafica.

Nota: "usabilità di base" (che campi chiede un flusso, in che ordine, cosa succede se sbagli)
NON è rimandata — è parte della funzione stessa e va decisa costruendo ogni fase. Quello che
si rimanda è la grafica/rifinitura visiva/immagini vere.

## Come partire (fatto il 13/07/2026)

1. ~~Apri la cartella `cantina-vini` in Antigravity.~~ ✅
2. ~~`git init`, primo commit.~~ ✅
3. ~~Esegui `supabase/migrations/0001_consolidation.sql` su Supabase.~~ ✅
4. ~~Test end-to-end: login, aggiungi vino, lista, dettaglio.~~ ✅ verificato 13/07/2026, tutto funzionante.

## Fase 1 — Fondamenta (stabilizzazione) ✅ COMPLETATA

- [x] Un solo client Supabase, import coerenti
- [x] Form "nuovo vino" scrive su wines + bottles
- [x] Cellar di default automatica
- [x] Maturazione per annata (bottles.peak_start/peak_end/aging_status)
- [x] Verifica reale in locale — testato il 13/07/2026
- [x] Primo commit git reale

## Fase 2 — Aggiunta vino con foto + AI (funzionalità, non grafica)

**Svolta del 13/07/2026**: trovato un prototipo precedente in Google AI Studio (progetto
separato, stack Vite/React, non collegato a questo repo) con codice Gemini già funzionante
per tre delle nostre funzioni chiave: riconoscimento etichetta, generazione immagine
rappresentativa, abbinamento cibo-vino. Non si migra il prototipo intero (stack diverso,
niente Supabase) — si adatta la LOGICA delle tre funzioni al progetto Next.js reale.

- [x] **Decisione presa**: motore di riconoscimento = Gemini (`@google/genai`, modelli
      `gemini-3-flash-preview` per testo/visione e `gemini-2.5-flash-image` per l'immagine)
- [x] **Decisione presa**: NESSUN database esterno (Grapeminds/EtOH) per la prima release
- [x] **Decisione presa (aggiornata)**: immagine rappresentativa = generata dall'AI
      (`generateProfessionalWineImage`, una sola volta per vino, salvata come data URL in
      `wines.image_url`), NON più foto stock per tipologia — decisione precedente superata
- [x] **Decisione presa**: salviamo anche i dati extra che Gemini fornisce già nella stessa
      chiamata (vitigni, descrizione, note terroir, recensione annata, profilo organolettico
      e di gusto) — richiede `supabase/migrations/0002_ai_enrichment.sql` (nuova, da eseguire
      su Supabase prima di questa fase)
- [ ] **Da correggere prima di adattarlo**: nel prototipo la chiamata a Gemini gira lato
      client (chiave API esposta nel browser) — nel progetto reale DEVE girare solo lato
      server (server action), la chiave non deve mai arrivare al client
- [ ] **Da adattare**: `maturation_start/peak/end` nel prototipo sono anni-dopo-vendemmia
      (offset), il nostro schema li vuole come anni assoluti su `bottles.peak_start/peak_end`
      → sommare l'anno della bottiglia all'offset
- [ ] **Da adattare**: il prototipo usa `type` per il colore, il nostro schema usa `color`
- [ ] Flusso completo: scatto/upload foto → Gemini legge l'etichetta e propone tutti i campi
      (base + extra) → form di conferma/correzione → generazione immagine rappresentativa →
      salvataggio (wine + bottle, riusando `createWine`/`actions.ts`)
- [ ] Chiave `GEMINI_API_KEY` in `.env.local` (mai committata — `.env*` è già in `.gitignore`)
- [ ] `lib/ai/enrichWine.ts` (mock attuale) va sostituito dalla vera chiamata Gemini per la
      maturazione — non serve più tenerlo separato come pensato in origine

## Fase 3 — Abbinamento cibo-vino (funzionalità, non grafica)

**Anche questa già in gran parte scritta** nel prototipo (`getFoodPairingRecommendation`):
dato un piatto e l'inventario reale dell'utente, Gemini sceglie 2 vini tra quelli posseduti
con motivazione. Da adattare: stessa correzione lato server, e nomi campi (`type`→`color`).

- [ ] Vino → cibo: abbinamenti nella scheda dettaglio
- [ ] Cibo → vino: input libero ("stasera mangio risotto ai funghi"), adattando
      `getFoodPairingRecommendation` ai vini realmente in cantina dell'utente

## Fase 4 — Diario, statistiche, wishlist (funzionalità di base)

Oggi sono solo placeholder: qui si rendono realmente funzionanti, anche senza grafica rifinita.

- [ ] `/diary`: segna una bottiglia come bevuta con data, occasione, note, valutazione; storico elencato
- [ ] `/stats`: conteggi reali (bottiglie totali, per tipologia, per stato maturazione, valore stimato)
- [ ] Wishlist: aggiungi vino desiderato, collegato a produttore/annata

## Fase 5 — Design & Usabilità (passata unica su tutto)

Solo ora si applica `DESIGN.md` (palette ambra/terracotta, tipografia, componenti) a
TUTTO il progetto in una volta, non pezzo per pezzo come pensato inizialmente.

- [ ] Applicare `DESIGN.md` a ogni file (bottoni, badge, card, colori — vedi sezione
      "Cosa correggere" nel file, incluso riscrivere `/cantina/[id]` che oggi usa ancora
      stili inline invece di Tailwind)
- [ ] Immagini vere/rappresentative al posto dei segnaposto, ora che la Fase 2 ha deciso la fonte
- [ ] `/wines`: rifinitura filtri e card
- [ ] `/cantina/[id]`: hero con immagine grande, tab "Annate / Storico", azioni rapide
      (segna come bevuta, rimuovi, modifica quantità/posizione)
- [ ] Icone vere al posto delle emoji nel menu in basso

## Fase 6 — Pre-release

- [ ] Deploy su Vercel (o piattaforma scelta), variabili d'ambiente Supabase configurate lato hosting
- [ ] Controllo dei vincoli DB usati davvero dall'app contro tutti i form
- [ ] Passata di QA manuale su tutti i flussi

## Decisioni aperte (da chiudere prima di iniziare le fasi corrispondenti)

| Decisione | Riguarda | Quando serve |
|---|---|---|
| ~~Motore AI per riconoscimento etichetta~~ | Fase 2 | ✅ Deciso: Gemini Vision |
| ~~Database di arricchimento~~ | Fase 2/3 | ✅ Deciso: nessuno per l'MVP |
| ~~Fonte immagine rappresentativa~~ | Fase 2 | ✅ Deciso: generata dall'AI (superata la scelta "stock per tipologia") |
| ~~Dati extra AI (vitigni/descrizione/profilo gusto)~~ | Fase 2 | ✅ Deciso: salvarli tutti |
| Gestione multi-cellar (UI dedicata o solo default) | Fase 5/6 | Prima della release se vuoi più di una "cantina" |
| Piattaforma di deploy | Fase 6 | A ridosso della release |

## Cosa NON fare ora (deciso insieme, per non disperdere tempo)

- Niente visualizzazione 3D della cantina (fuori scope, eventuale fase futura)
- Niente funzioni social/community (contro la visione di prodotto)
- Niente refactor strutturali ulteriori sul modello dati: wines/bottles/cellars è quello giusto, si costruisce sopra, non si ridiscute
- Niente rifinitura grafica a pezzi: colori/stile/immagini vere si fanno tutti insieme in Fase 5, non prima
