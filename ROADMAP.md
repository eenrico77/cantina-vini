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
- [x] **Corretto**: chiamata a Gemini spostata lato server (`actions.ts`, `"use server"`),
      chiave mai esposta al client — verificato leggendo il codice il 13/07/2026
- [x] **Adattato**: `maturation_start/end` (offset) sommati a `year` della bottiglia per
      valorizzare `bottles.peak_start/peak_end` in modo assoluto
- [x] **Adattato**: `type` → `color` ovunque, coerente col vincolo CHECK su `wines`
- [x] Flusso completo costruito: upload foto in `/cantina/new` → `analyzeLabelAction` (server)
      → form pre-compilato editabile → salvataggio via `createWine` (wine + bottle) →
      generazione immagine solo se `wines.image_url` è vuoto
- [x] `GEMINI_API_KEY` in `.env.local`
- [x] `lib/ai/enrichWine.ts` sostituito con le tre funzioni Gemini reali (riconoscimento,
      immagine, food pairing)
- [x] **Testato con foto vera il 13/07/2026**: upload etichetta Prosecco Ruggeri →
      riconoscimento corretto (nome, produttore, tipologia, regione, uvaggio, descrizione) →
      salvataggio riuscito → scheda dettaglio con dati AI e curva di maturazione funzionante
- [x] **Corretto il 13/07/2026**: aggiunta visualizzazione semplice (non stilizzata) di
      `wines.image_url` in `/cantina/[id]` — confermato che la generazione immagine funziona
- [x] **Corretto il 13/07/2026**: `organoleptic` e `taste_profile` non vengono più mostrati
      come JSON grezzo (es. `{"body":2,"acidity":4,...}`) ma come elenco leggibile in italiano
      (Corpo, Intensità, Tannini, Acidità, Persistenza, Alcol) — era un problema di comprensione,
      non solo estetico, quindi corretto subito invece di aspettare la Fase 5
- [x] **Corretto il 13/07/2026**: intestazione "I tuoi millesimi" (gergo poco chiaro) rinominata
      in "Le tue annate"; anche "Storage & Service" → "Conservazione e servizio", "TEMP." →
      "TEMPERATURA", "DECANTING" → "DECANTAZIONE" tradotte nella stessa passata
- [ ] **Nuovo requisito UX**: se l'utente non compila l'Annata, invece del solo messaggio
      di validazione del browser ("Compila questo campo"), mostrare un popup che spiega che
      l'anno serve a calcolare la maturazione e sapere quando aprire la bottiglia. Se l'utente
      conferma di voler procedere comunque senza, salvare lo stesso (senza peak_start/peak_end,
      come già gestito oggi quando mancano i dati)

## Note tecniche / performance (segnalate da Enrico il 13/07/2026)

- Sia il caricamento generale del sito in locale, sia l'analisi AI della foto etichetta,
  risultano lenti. Cause probabili da verificare più avanti (non bloccante ora):
  - `npm run dev` compila le pagine al volo la prima volta che vengono aperte — è normale
    che sia più lento di una build di produzione. Da riverificare con `npm run build && npm run start`.
  - `generateProfessionalWineImage` (generazione immagine AI) oggi viene chiamata PRIMA del
    redirect alla scheda vino, quindi il salvataggio resta "in attesa" finché l'immagine non
    è pronta — probabile causa principale della lentezza percepita su "Conferma e Salva Vino".
    Miglioria da valutare: salvare subito senza aspettare l'immagine, generarla in background
    e mostrarla appena pronta (richiede un piccolo meccanismo di aggiornamento sulla pagina).
  - Da tenere d'occhio in Fase 6 (pre-release), non prioritario ora.

## Fase 3 — Abbinamento cibo-vino (funzionalità, non grafica)

- [x] `getFoodPairingRecommendation` adattata (server-side, `color`) in `lib/ai/enrichWine.ts` —
      pronta ma non ancora richiamata
- [x] Vino → cibo: sezione abbinamenti nella scheda dettaglio (può partire da regole semplici tipo/colore, poi evolvere con AI)
- [x] Cibo → vino: input libero ("stasera mangio risotto ai funghi") che filtra e ordina solo le bottiglie realmente in cantina, con motivazione breve

## Fase 4 — Diario, statistiche, wishlist (funzionalità di base)

Oggi sono solo placeholder: qui si rendono realmente funzionanti, anche senza grafica rifinita.

- [ ] `/stats`: conteggi reali (bottiglie totali, per tipologia, per stato maturazione, valore stimato)
- [ ] Wishlist: aggiungi vino desiderato, collegato a produttore/annata

## Fase 5 — Design & Usabilità (passata unica su tutto)

Solo ora si applica `DESIGN.md` (palette ambra/terracotta, tipografia, componenti) a
TUTTO il progetto in una volta, non pezzo per pezzo come pensato inizialmente.

- [ ] Applicare `DESIGN.md` a ogni file (bottoni, badge, card, colori — vedi sezione
      "Cosa correggere" nel file, incluso riscrivere `/cantina/[id]` che oggi usa ancora
      stili inline invece di Tailwind)
- [ ] Immagini vere/rappresentative al posto dei segnaposto, ora che la Fase 2 ha deciso la fonte
      (mostrarle finalmente in `/cantina/[id]`, vedi gap segnalato in Fase 2)
- [ ] `/wines`: rifinitura filtri e card
- [ ] `/cantina/[id]`: hero con immagine grande, tab "Annate / Storico", azioni rapide
      (segna come bevuta, rimuovi, modifica quantità/posizione)
- [ ] Icone vere al posto delle emoji nel menu in basso
- [ ] **Tradurre tutte le etichette rimaste in inglese** trovate testando il 13/07/2026:
      "Storage & Service", "TEMP.", "DECANTING", "Maturation Start/End (offset)" nel form
      dettagli extra, e qualunque altra label AI mostrata in inglese
- [ ] **Priorità alta esplicita di Enrico**: la curva/fase di maturazione è uno dei grandi
      punti di forza del prodotto — non deve restare un riquadro grezzo con tre numeri.
      Merita un trattamento grafico premium a parte (animazioni/gradiente/indicatore "oggi"
      più curato), va trattata come componente di punta, non come dettaglio minore della
      passata di design generale

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

## Note e idee raccolte da Enrico (da smistare nelle fasi giuste)

Enrico scrive qui le idee man mano che vengono in mente durante i test; vengono poi
spostate nella fase giusta sopra. Non si agisce su queste finché non sono state
riorganizzate in un task concreto in una fase.

- (vuoto per ora — tutte le idee del 13/07/2026 sono già state smistate sopra)

## Cosa NON fare ora (deciso insieme, per non disperdere tempo)

- Niente visualizzazione 3D della cantina (fuori scope, eventuale fase futura)
- Niente funzioni social/community (contro la visione di prodotto)
- Niente refactor strutturali ulteriori sul modello dati: wines/bottles/cellars è quello giusto, si costruisce sopra, non si ridiscute
- Niente rifinitura grafica a pezzi: colori/stile/immagini vere si fanno tutti insieme in Fase 5, non prima
