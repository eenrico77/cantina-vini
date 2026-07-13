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
- [x] **Completata e verificata via codice il 13/07/2026**: box "Abbinamenti Consigliati" statico per
      colore in `/cantina/[id]`; modulo "Cosa mangi stasera?" in home (`components/FoodPairingForm.tsx`)
      che chiama `app/actions.ts` → `getPairingAction` (server-only, filtra bottiglie con quantity>0,
      gestisce cantina vuota e errori/quota AI esaurita senza crashare)

## Fase 4 — Diario, statistiche, wishlist (funzionalità di base)

Oggi sono solo placeholder: qui si rendono realmente funzionanti, anche senza grafica rifinita.
- [x] **Nuova migrazione** `supabase/migrations/0003_diary_wishlist.sql`: tabelle `diary_entries`
      (bevute, con wine_id/bottle_id opzionali per sopravvivere a cancellazioni, rating, notes)
      e `wishlist_items` (vini desiderati, non posseduti), entrambe con RLS per user_id —
      da eseguire su Supabase prima di questa fase
- [x] `/diary`: segna una bottiglia come bevuta con data, occasione, note, valutazione; storico elencato
- [x] `/stats`: conteggi reali (bottiglie totali, per tipologia, per stato maturazione, valore stimato, bevute)
- [x] Wishlist: aggiungi vino desiderato, collegato a produttore/annata
- [x] **Corretto il 13/07/2026 (bug di sicurezza, non estetico, trovato rileggendo il codice)**:
      `drinkBottleAction` (in `app/cantina/[id]/actions.ts`) e `deleteWishlistItem` (in
      `app/wishlist/actions.ts`) non filtravano per `user_id` — un utente autenticato poteva in
      teoria modificare/cancellare bottiglie o voci wishlist di un altro utente, perché la
      tabella `bottles` non ha RLS. Aggiunto `.eq("user_id", auth.user.id)` su entrambe.
      **Da tenere presente in Fase 6**: valutare se attivare RLS anche su `wines`/`bottles`/`cellars`
      come seconda barriera, oltre al filtro manuale già presente ovunque nell'app.

## Fase 5 — Design & Usabilità (spezzata in sotto-blocchi, deciso il 13/07/2026)

Solo ora si applica `DESIGN.md` (palette ambra/terracotta, tipografia, componenti) a
TUTTO il progetto — ma non in un'unica istruzione enorme: si procede a blocchi, con verifica
di Enrico tra un blocco e l'altro, per non far perdere/bloccare l'agente su un progetto ampio.
Ordine deciso: prima la curva di maturazione (priorità esplicita di Enrico), poi il resto.

### Fase 5a — Curva di maturazione premium (PRIMO blocco, priorità di Enrico)

- [x] **Completato e verificato via codice il 13/07/2026**: `components/MaturationCurve.tsx`
      riscritto — barra animata (espansione all'ingresso), gradiente con gli hex esatti di
      status-young/almost/ready/decline da tailwind.config.js, marker "OGGI: [anno]" animato
      che scivola in posizione, marker verticali per Giovane/Apice/Declino. Giudizio estetico
      finale da dare a occhio da Enrico su `/cantina/[id]`.

### Fase 5b — Componenti base e design system

- [x] Applicare `DESIGN.md` a bottoni, badge, colori di base in tutto il progetto (vedi
      sezione "Cosa correggere" nel file)
- [x] Icone vere al posto delle emoji nel menu in basso
- [x] **Corretto il 13/07/2026 (bug funzionale, trovato rileggendo il codice)**: i badge di
      maturazione in `/wines` (renderizzati da `WineCard.jsx` via `getAgingBadgeColor` in
      `lib/domain/maturation.ts`) usavano ancora blu/ambra/verde/rosso hardcoded, NON i token
      status-*, nonostante il report dicesse il contrario — l'helper con i colori giusti
      scritto in `WineListClient.tsx` non veniva mai chiamato da nessuna parte (codice morto,
      e comunque con le chiavi di stato sbagliate: "young" invece di "too_young" ecc.).
      Corretto `getAgingBadgeColor` per usare i token status-*/10, rimosso l'helper morto,
      e "hover:text-blue-500" in `WineCard.jsx` → "hover:text-brand-600".

### Fase 5c — Pagine principali

- [x] Riscrivere `/cantina/[id]` in Tailwind (oggi usa ancora stili inline) con hero immagine
      grande, tab "Annate / Storico", azioni rapide ben integrate visivamente — verificato via
      codice il 13/07/2026 (`WineDetailClient.tsx`, `DrinkBottleModal.tsx`)
- [x] `/wines`: rifinitura filtri e card
- [x] Immagini vere/rappresentative al posto dei segnaposto — già in hero di `/cantina/[id]`,
      con fallback 🍷 se `image_url` assente

### Fase 5d — Rifiniture testuali

- [x] **Tradurre tutte le etichette rimaste in inglese** trovate testando il 13/07/2026:
      "Storage & Service", "TEMP.", "DECANTING", "Maturation Start/End (offset)" nel form
      dettagli extra, e qualunque altra label AI mostrata in inglese.
      *(Nota: se Gemini restituisce i dati descrittivi in inglese nel DB, non è stato forzato qui per non toccare le Server Actions. Sarà necessario in futuro rafforzare il prompt di Gemini per pretendere l'output in italiano sempre).*

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
