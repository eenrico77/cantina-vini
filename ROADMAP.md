# Cantina Vini — Roadmap verso la prima release

Ultimo aggiornamento: 13 luglio 2026.

**Prossima sessione, si riparte da qui**: (1) e (2) completati e verificati via codice il
13/07/2026 — `@vercel/functions` installato, `waitUntil` cablato in `createWine`, `year`
nullable con migrazione `0005_year_nullable.sql` pronta. **Da fare per prime**:
1. Eseguire su Supabase, in quest'ordine, le migrazioni non ancora lanciate in produzione:
   `0005_year_nullable.sql`, poi testare in locale la `0004_rls_core_tables.sql` (RLS su
   wines/bottles/cellars) PRIMA di lanciarla anche quella su Supabase.
2. Deploy vero su Vercel (variabili d'ambiente, controllo vincoli DB, QA manuale finale).
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
- [x] **Fase 5a-bis (Revisione Grafica)**: curva di maturazione a onda (SVG), aggiunta bicchiere consigliato, e abbinamenti statici in scheda vino. Aggiunto anche il campo Prezzo di Acquisto.
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
- [x] **Rifatta e completata il 14/07/2026** (bocciata la versione a barra piatta): la barra piatta non convince
      esteticamente, e c'è un'incoerenza logica trovata da Enrico — il testo sotto il grafico
      dice "Quasi pronto — al meglio dal 2027" ma il marker "Apice" nel grafico mostra 2031
      (perché "Apice" è calcolato come punto medio tra peak_start e peak_end, un concetto
      diverso da "al meglio dal" che usa peak_start). Rifare come segue (proposta "Onda
      organica" scelta da Enrico tra 3 mockup mostrati):
      - Vera curva SVG che sale e scende (non una barra piatta), con `path` e area sotto la
        curva sfumata con i colori status-*
      - **Elimina il concetto di "Apice" come singolo punto**: mostra invece la finestra
        ideale (`peak_start` → `peak_end`) come fascia/zona ombreggiata continua sulla curva,
        con le due date ai bordi della fascia — così il testo "al meglio dal" e il grafico
        userrano sempre lo stesso numero (peak_start), niente più incoerenza
      - Marker "OGGI: [anno]" animato che scivola letteralmente sopra il tracciato della curva
        (non su una barra dritta)
      - Sotto il grafico, in `WineDetailClient.tsx` (tab Annate, per ogni bottiglia/annata),
        aggiungere tre informazioni rapide ben visibili:
        1. Temperatura di servizio (`wine.ideal_temp`, già esiste, va solo duplicata qui)
        2. **Bicchiere consigliato — dato NUOVO, oggi scartato**: Gemini restituisce già
           `glassware` in `lib/ai/enrichWine.ts` ma non viene mai salvato. Serve: colonna
           `wines.glassware text` (nuova migrazione), catturarlo in
           `app/cantina/new/actions.ts` (oggi ignorato), campo editabile nel form
           `app/cantina/new/page.tsx` (sezione "dettagli extra", come `ideal_temp`)
        3. Abbinamenti classici come lista di 4-5 chip ben visibili (non una riga di testo
           come oggi nella tab Info) — liste fisse per colore:
           - Rosso: Arrosti, Brasati, Selvaggina, Formaggi stagionati, Grigliate rosse
           - Bianco: Pesce, Crostacei, Risotti, Formaggi freschi, Antipasti di mare
           - Bollicine: Aperitivo, Crudo di pesce, Fritti, Sushi, Antipasti leggeri
           - Rosato: Salumi, Pesce grigliato, Cucina estiva, Insalate importanti, Pizza
           - Dolce: Dessert, Formaggi erborinati, Frutta secca, Crostate, Cioccolato fondente
      - La tab "Info Vino" resta com'è oggi (temperatura/decantazione/note AI complete), questa
        è solo l'anteprima rapida vicino al grafico, non una sostituzione
      - **Verificato via codice il 14/07/2026**: curva Bezier reale con finestra ideale
        ombreggiata coerente (niente più "Apice" fuori posto), chip temperatura/bicchiere/
        abbinamenti sotto il grafico, campo "Valore Attuale" modificabile per bottiglia
        (`updateBottleValueAction`, filtrata per `user_id`), prezzo di acquisto nel form.
      - **Corretto direttamente da Claude**: la curva usava colori hardcoded nuovi
        (`#10b981`/`#f59e0b`/`#14b8a6`/`#ef4444`) invece dei token `status-*` richiesti
        esplicitamente due volte — sostituiti con gli hex ufficiali della palette.

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

**Decisioni prese il 13/07/2026**: deploy su Vercel; nessuna gestione multi-cantina per il
primo rilascio (resta solo la "Cantina predefinita" automatica, si valuta in futuro se serve
davvero); gli item residui di fasi precedenti si chiudono dentro questa fase, non a parte.

- [x] **Recuperato da Fase 2**: popup se manca l'Annata in `/cantina/new` — spiega perché serve
      (calcolo maturazione), permette di procedere comunque senza. Verificato via codice il
      13/07/2026 (`app/cantina/new/page.tsx`).
- [x] **Corretto il 13/07/2026 (bug trovato rileggendo il codice)**: quando si salva senza
      annata, `year` diventava `0` invece di `null` (perché `Number("")` è `0` in JS), e se
      erano presenti gli offset di maturazione dell'AI si calcolava comunque `peak_start/end`
      con base anno 0 (date assurde tipo "anno 3"). Corretto in `app/cantina/new/actions.ts`:
      `year` è ora `null` se non compilato, e il calcolo di `peak_start/end` richiede un
      `year` valido oltre agli offset. Migrazione `0005_year_nullable.sql` pronta e verificata
      via codice — **confermato il 14/07/2026 con un test reale**: senza la migrazione il
      salvataggio va in errore 500 (`null value in column "year" violates not-null constraint`),
      esattamente come previsto. **Non ancora eseguita su Supabase — primo step di oggi.**
- [x] **Fix waitUntil per Vercel completato e verificato via codice il 14/07/2026**:
      `@vercel/functions` installato, `generateAndSave()` ora passato a `waitUntil()` in
      `app/cantina/new/actions.ts` invece di essere lanciato senza await — la Serverless
      Function su Vercel non verrà terminata prima che l'immagine AI sia salvata.
- [ ] RLS su `wines`, `bottles`, `cellars` (migrazione `0004_rls_core_tables.sql` pronta —
      verificata via codice il 13/07/2026, corretta — da eseguire e testare in locale con
      Enrico prima di lanciarla su Supabase in produzione). **Secondo step di oggi.**
- [ ] Deploy su Vercel, variabili d'ambiente Supabase e `GEMINI_API_KEY` configurate lato hosting
- [ ] Controllo dei vincoli DB usati davvero dall'app contro tutti i form
- [x] Passata di QA manuale su tutti i flussi: login, aggiungi vino (con e senza foto AI, con
      e senza annata), segna come bevuta, abbinamento cibo-vino, wishlist, statistiche

## Decisioni aperte (da chiudere prima di iniziare le fasi corrispondenti)

| Decisione | Riguarda | Quando serve |
|---|---|---|
| ~~Motore AI per riconoscimento etichetta~~ | Fase 2 | ✅ Deciso: Gemini Vision |
| ~~Database di arricchimento~~ | Fase 2/3 | ✅ Deciso: nessuno per l'MVP |
| ~~Fonte immagine rappresentativa~~ | Fase 2 | ✅ Deciso: generata dall'AI (superata la scelta "stock per tipologia") |
| ~~Dati extra AI (vitigni/descrizione/profilo gusto)~~ | Fase 2 | ✅ Deciso: salvarli tutti |
| ~~Gestione multi-cellar~~ | Fase 5/6 | ✅ Deciso: solo cantina predefinita per il primo rilascio |
| ~~Piattaforma di deploy~~ | Fase 6 | ✅ Deciso: Vercel |

## Note e idee raccolte da Enrico (da smistare nelle fasi giuste)

Enrico scrive qui le idee man mano che vengono in mente durante i test; vengono poi
spostate nella fase giusta sopra. Non si agisce su queste finché non sono state
riorganizzate in un task concreto in una fase.

- (vuoto per ora — tutte le idee del 13/07/2026 sono già state smistate sopra)

### Bug trovati da Enrico testando /stats il 14/07/2026

- [x] **Corretto direttamente da Claude (non da Antigravity)**: `/stats`, sezione "Per
      Maturazione", mostrava i valori grezzi del DB (`too_young`, `ready`, `almost_ready`)
      invece delle etichette italiane già usate altrove (`Giovane`, `Pronto ora`, ecc.).
      Aggiunta mappa `AGING_LABELS` in `app/stats/page.tsx`.
- [ ] **"Valore Stimato" sempre a 0€**: non è un bug di calcolo — il form "Aggiungi Vino"
      non ha mai avuto un campo per il prezzo, quindi `purchase_price`/`current_value` restano
      sempre `null`. **Decisione presa il 14/07/2026**: niente valore di mercato automatico
      (richiederebbe un database prezzi esterno, già escluso per l'MVP, e Gemini non deve
      "inventare" un prezzo di mercato plausibile ma non verificato). Due campi distinti:
      - `purchase_price`: costo reale, compilato una volta all'aggiunta del vino (nuovo campo
        nel form, vedi sotto)
      - `current_value`: valore attuale stimato DA ENRICO, non automatico — modificabile in
        qualsiasi momento nella scheda vino (tab Annate, per ogni bottiglia/annata, vicino a
        quantità/note). Finché non viene toccato, `/stats` e la home usano `purchase_price`
        come base (logica già presente: `current_value || purchase_price`).
      Da aggiungere insieme al blocco Fase 5a-bis (vedi sopra).

### QA manuale di Enrico dopo le migrazioni 0004/0005/0006 (14/07/2026)

- [x] **CAUSA REALE TROVATA il 14/07/2026 (non era una cache)**: la migrazione
      `0003_diary_wishlist.sql` non era mai stata eseguita sul Supabase reale — verificato dal
      Table Editor: esistono solo `bottles`/`cellars`/`wines` (nostre) più `profiles`/
      `tastings`/`wine_values` (residui del vecchio progetto abbandonato, zero riferimenti nel
      codice attuale), ma NON `diary_entries` né `wishlist_items`. Diario e Wishlist non hanno
      mai davvero funzionato: "segna come bevuta" scalava la quantità (tabella esistente) ma
      l'inserimento nel diario falliva silenziosamente (nessun controllo errore sul risultato
      dell'insert). Corretto eseguendo la migrazione 0003 (versione con tipi giusti, vedi voce
      sotto sull'incompatibilità uuid/bigint) sul Supabase reale — **verificato funzionante il
      14/07/2026**: "segna come bevuta" ora crea davvero una voce reale in `/diary` con nome,
      data e voto corretti.
      **Da fare da Antigravity**: aggiungere controllo esplicito dell'errore su OGNI insert/
      update Supabase in `drinkBottleAction`, `deleteWishlistItem`, `addWishlistItem` (e
      qualunque altra azione di scrittura) — se `error` non è null, lanciare un'eccezione
      invece di ignorarlo, così un problema come questo si vede subito invece di fallire in
      silenzio.
- [x] **Scoperta collegata e corretta il 14/07/2026 — inconsistenza di tipi tra tabelle**:
      `wines.id` è `bigint`, ma `bottles.id` e `cellars.id` sono `uuid` (eredità dello schema
      originale pre-esistente, mai uniformato). La migrazione 0003 dichiarava
      `diary_entries.bottle_id` come `bigint` con FK verso `bottles(id)` (uuid) — Postgres ha
      bloccato la creazione della tabella per l'incompatibilità di tipo. Corretto: colonna
      cambiata in `uuid` nella migrazione, e in `app/cantina/[id]/actions.ts` rimosso un
      `parseInt(bottleId, 10)` che avrebbe scritto un id numerico senza senso invece del vero
      UUID della bottiglia. `wine_id` resta `bigint` (coerente con `wines.id`, corretto così).
      **Da tenere a mente**: qualunque nuovo codice che tocca `bottles.id`/`cellars.id` deve
      trattarli come stringhe/UUID, mai con `parseInt`/`Number()`.
- [ ] **Filtri `/wines` illeggibili**: le etichette delle select ("Tutte le tipologie", "Tutte
      le maturazioni", ecc.) sono tagliate ("Tutte le tip⌄") perché le caselle sono troppo
      strette. Allargare le select o accorciare i placeholder, e sistemare l'allineamento
      della griglia dei filtri.
- [ ] **Manca login/logout visibile**: non esiste da nessuna parte un modo per fare logout
      (verificato: nessun bottone/azione di sign-out in tutto il codice). Aggiungere un modo
      chiaro per uscire (es. nel menu in basso o in un'icona profilo in alto), e verificare che
      il login stesso sia chiaro quando non si è autenticati.
- [ ] **Upload foto poco chiaro**: in "Aggiungi Vino" si vede solo "Scegli file", non è chiaro
      se si può scattare una foto al volo o solo caricarne una esistente. Su desktop il
      comportamento della fotocamera diretta non è comunque garantito (dipende dal browser),
      quindi va chiarita la label/testo di supporto invece di promettere una funzione che su
      desktop potrebbe non esserci (su mobile invece dovrebbe aprire la fotocamera grazie a
      `capture="environment"` già presente nel codice).
- [ ] **Sezione "dettagli extra (AI)" da rifare**: troppo testo dentro box che non c'entrano,
      caselle non allineate in griglia, testo che sborda dai contenitori. Dati brevi come
      "Decantazione" (Sì/No) non hanno bisogno di un riquadro dedicato — vanno mostrati come
      semplice testo/etichetta inline, non incasellati come i campi lunghi (descrizione, note
      terroir, ecc.). Rivedere tutta la sezione con una griglia coerente in base alla
      lunghezza attesa del contenuto.
- [ ] **Wishlist poco utile così com'è**: oggi si può solo aggiungere/rimuovere un vino
      desiderato, ma non c'è modo di "promuoverlo" a vino posseduto quando lo si compra
      davvero. Aggiungere un'azione (es. stellina/bottone "Ho comprato questo vino") che apre
      il form "Aggiungi Vino" pre-compilato con i dati della voce wishlist (nome, produttore,
      regione, colore, annata se presente), e rimuove la voce dalla wishlist una volta creato
      il vino vero.

## Cosa NON fare ora (deciso insieme, per non disperdere tempo)

- Niente visualizzazione 3D della cantina (fuori scope, eventuale fase futura)
- Niente funzioni social/community (contro la visione di prodotto)
- Niente refactor strutturali ulteriori sul modello dati: wines/bottles/cellars è quello giusto, si costruisce sopra, non si ridiscute
- Niente rifinitura grafica a pezzi: colori/stile/immagini vere si fanno tutti insieme in Fase 5, non prima
