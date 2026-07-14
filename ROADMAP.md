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
- [x] **Nuovo requisito UX — completato in Fase 6**: popup se manca l'Annata, vedi sezione
      Fase 6 più sotto per i dettagli (già implementato e verificato).

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

## Fase 6 — Pre-release (In Corso)

- [x] Rimuovere alert JavaScript grezzi e sostituirli con toast o messaggi in pagina integrati,
      specialmente per gli errori non bloccanti — verificato via QA 14/07/2026.
- [x] Aggiungere pagina Account (/account) per impostare la password dopo login via magic link.
- [x] Aggiunta foto etichetta (AI) anche nella Wishlist per precompilare il form.
- [ ] Configurazione progetto Vercel (env vars)
- [ ] Push DB di produzione (eseguire tutte le migrazioni)
- [ ] Verificare che non ci siano "console.log" dimenticati o warning di Next.js in build.

**Nota del 14/07/2026**: Enrico conferma che dopo il deploy resta ancora molto da rivedere
lato grafica/interfaccia (nonostante la passata di Fase 5) — il deploy su Vercel NON è un
punto di non ritorno, si continua a rifinire dopo, ogni push aggiorna il sito online in
automatico. Non rimandare il deploy in attesa di una grafica perfetta.

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
- [ ] **ANCORA DA FARE — priorità**: RLS su `wines`, `bottles`, `cellars` (migrazione
      `0004_rls_core_tables.sql` pronta e verificata via codice il 13/07/2026, corretta, ma
      MAI ESEGUITA su Supabase — persa di vista durante il deploy). L'app funziona comunque
      perché ogni query filtra già manualmente per `user_id`, ma questa è la seconda barriera
      di sicurezza a livello di database che avevamo pianificato. Da fare a breve.
- [x] **Deploy su Vercel completato il 14/07/2026**: app online su
      `https://cantina-vini-five.vercel.app`, variabili d'ambiente configurate, Supabase
      Site URL/Redirect URLs aggiornati con l'indirizzo di produzione.
- [ ] Controllo dei vincoli DB usati davvero dall'app contro tutti i form (non ancora fatto
      sistematicamente — da fare)
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

### Da fare dopo il deploy (14/07/2026)

- [ ] **Rifinitura grafica generale**: Enrico conferma che, nonostante la Fase 5, restano
      parecchi problemi di interfaccia da rivedere con calma dopo il deploy — non bloccante
      per andare online, ma da riprendere presto.
- [ ] **Dominio personalizzato**: da collegare quando Enrico ne compra uno (nessun costo
      aggiuntivo su Vercel Hobby per aggiungerlo, solo il costo del dominio stesso).
- [ ] **PWA / "Aggiungi a schermata Home"**: manca un manifest per installare l'app come icona
      sul telefono (l'app è già pensata mobile-first — colonna stretta, bottom nav, upload con
      fotocamera — ma senza l'icona home screen resta "solo" un sito aperto dal browser).
      Non urgente, comodo da aggiungere in futuro.
- [x] **Corretto il 14/07/2026 (bug reale, non solo UX, due parti)**: mancava completamente
      la gestione del ritorno dai link email di Supabase (magic link, reset password,
      conferma). Scoperto testando un vero blocco: Enrico non riusciva più ad accedere
      all'app appena deployata perché aveva dimenticato la password.
      1. Aggiunta gestione di un eventuale `?code=...` in `middleware.js` (scambio sessione
         PRIMA del redirect al login) + creata `app/auth/callback/route.ts` per usi futuri
         (PKCE, es. OAuth) — ma si è scoperto che il bottone "Send magic link" del pannello
         Supabase non usa questo formato.
      2. **Causa reale**: il link inviato da Supabase torna con il token dopo il cancelletto
         (`#access_token=...&refresh_token=...`, "implicit flow"), che il server non vede mai
         (i browser non inviano la parte dopo `#` nelle richieste HTTP) — va letto e scambiato
         per una sessione lato browser. Corretto in `app/login/page.jsx`: legge
         `window.location.hash` al caricamento della pagina, e se trova i token chiama
         `supabase.auth.setSession(...)` per completare l'accesso.
- [ ] **Manca ancora "Password dimenticata" nell'interfaccia di `/login`**: oggi si può
      recuperare l'accesso solo manualmente dal pannello Supabase (Authentication → Users →
      "Send magic link"/"Reset password"), ora che il callback funziona. Da aggiungere in
      futuro: link "Password dimenticata?" nel form di login che chiama
      `supabase.auth.resetPasswordForEmail(email)`, più una pagina per impostare la nuova
      password dopo il click sul link ricevuto via email.

### Bug trovati da Enrico testando /stats il 14/07/2026

- [x] **Corretto direttamente da Claude (non da Antigravity)**: `/stats`, sezione "Per
      Maturazione", mostrava i valori grezzi del DB (`too_young`, `ready`, `almost_ready`)
      invece delle etichette italiane già usate altrove (`Giovane`, `Pronto ora`, ecc.).
      Aggiunta mappa `AGING_LABELS` in `app/stats/page.tsx`.
- [x] **"Valore Stimato" — completato in Fase 5a-bis**: campo "Prezzo di acquisto" nel form
      e "Valore Attuale" modificabile nella scheda vino, entrambi implementati e verificati
      (vedi sezione Fase 5a-bis più sopra per i dettagli).

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
- [x] **Filtri `/wines`**: griglia 1 colonna su mobile, 4 su desktop, placeholder accorciati
      ("Tipologia" invece di "Tutte le tipologie") — verificato via codice il 14/07/2026.
- [x] **Login/logout**: `components/Header.tsx` con bottone "Esci" (`signOutAction` in
      `app/actions.ts`), `components/NotAuthenticated.tsx` sostituisce i vecchi "Non
      autenticato" grezzi in TUTTE le pagine protette (verificato: home, /wines, /stats,
      /diary, /wishlist, /cantina/[id]) — verificato via codice il 14/07/2026.
- [x] **Upload foto**: label chiarita in `app/cantina/new/page.tsx` — verificato via codice.
- [x] **Sezione "dettagli extra (AI)"**: griglia compatta 2-3 colonne per i campi brevi
      (Temp./Bicchiere/Decantazione/Maturazione), textarea a piena larghezza solo per i campi
      lunghi (Terroir/Recensione) — verificato via codice il 14/07/2026.
- [x] **Wishlist → Cantina**: bottone "⭐️ Comprato" in `WishlistClientList.tsx` porta a
      `/cantina/new?wishlistId=...` con tutti i campi pre-compilati via query string, letti in
      `page.tsx` e passati come hidden field a `createWine`, che cancella la voce wishlist dopo
      il salvataggio riuscito — verificato via codice il 14/07/2026, flusso completo e corretto.

### Fase 6-bis — Gestione immagini reali (decisa il 14/07/2026)

Oggi la foto dell'etichetta serve SOLO al riconoscimento AI e viene scartata; l'immagine
mostrata è sempre quella generata dall'AI (stile catalogo), salvata come base64 grezzo dentro
`wines.image_url` (pesante, lento). Enrico vuole poter scegliere tra la sua foto vera e quella
da catalogo. Decisioni prese: generazione foto da catalogo SU RICHIESTA (bottone dedicato, non
automatica) per non rallentare chi non la vuole; migrazione a Supabase Storage vero (via URL)
al posto del base64, approfittandone visto che tocchiamo comunque il salvataggio immagini.

- [x] Nuova migrazione `supabase/migrations/0007_storage_bucket.sql`: crea bucket pubblico
      `wine-images` in `storage.buckets`, con policy RLS su `storage.objects` — insert/update
      solo per l'utente proprietario (path `${userId}/...`), select pubblica (serve per
      mostrare le immagini senza autenticazione lato client). **Verificata via codice il
      14/07/2026, corretta — ma NON ANCORA ESEGUITA su Supabase: senza il bucket, l'upload
      dell'immagine scelta fallirà silenziosamente (errore loggato, vino salvato senza
      immagine). Da eseguire come prossimo passo prima di testare questo flusso.**
- [x] In `app/cantina/new/page.tsx`, dopo l'upload e il riconoscimento AI: mostrare subito
      l'anteprima della foto reale caricata dall'utente, più un bottone "Genera foto da
      catalogo" (chiama una nuova server action che usa `generateProfessionalWineImage`,
      mostra un caricamento, poi la anteprima del risultato). L'utente sceglie quale delle due
      tenere (default: la propria foto se non genera quella da catalogo)
- [x] In `createWine` (actions.ts): caricare l'immagine scelta (propria o da catalogo) su
      Supabase Storage (bucket `wine-images`, path tipo `${userId}/${timestamp}.png`), salvare
      in `wines.image_url` l'URL pubblico risultante, NON più il base64 diretto
- [x] Rimuovere il vecchio meccanismo "fire and forget" (`waitUntil`/`generateAndSave`
      automatico dopo il salvataggio) — non serve più, la scelta ora avviene prima del submit
- [ ] Non prioritario/facoltativo per ora: possibilità di cambiare l'immagine di un vino già
      salvato dalla sua scheda dettaglio — si può rimandare a dopo la prima release se non c'è
      tempo, non blocca il deploy
- [x] **Decisione presa il 14/07/2026**: "Genera foto da catalogo" resta DISATTIVATA per ora —
      il modello di generazione immagine (`gemini-2.5-flash-preview-image`) ha quota gratuita
      pari a zero (confermato dall'errore reale: `limit: 0`), e attivare la fatturazione sul
      progetto Gemini attuale rimuoverebbe il livello gratuito per TUTTO il progetto (anche
      riconoscimento etichetta e abbinamenti, che oggi sono gratis e funzionano bene). Enrico
      non vuole spendere per ora. Se in futuro si vorrà riattivare: usare un progetto/chiave
      API Gemini SEPARATA solo per le immagini (con fatturazione prepay lì), lasciando la
      chiave attuale gratuita per tutto il resto — non riattivare sullo stesso progetto. Per
      ora: nascondere/disabilitare il bottone "Genera foto da catalogo" con una nota invece di
      lasciarlo fallire con un errore generico. La scelta "usa la tua foto reale" resta
      l'unica opzione attiva e funziona perfettamente gratis.

## Cosa NON fare ora (deciso insieme, per non disperdere tempo)

- Niente visualizzazione 3D della cantina (fuori scope, eventuale fase futura)
- Niente funzioni social/community (contro la visione di prodotto)
- Niente refactor strutturali ulteriori sul modello dati: wines/bottles/cellars è quello giusto, si costruisce sopra, non si ridiscute
- Niente rifinitura grafica a pezzi: colori/stile/immagini vere si fanno tutti insieme in Fase 5, non prima
