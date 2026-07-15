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

### Fase 7 — UI e Rifiniture

- [x] Consolidare le azioni sparse nella scheda di dettaglio vino in un pulsante "••• Azioni" con bottom sheet (ispirazione Oeni).
- [x] Redesign del form "Aggiungi Vino" a blocchi (card per ogni sezione logica) con logica decantazione corretta.
- [x] 6 rifiniture form Aggiungi Vino (annata select, testo formattato, decantazione, bicchiere, maturazione leggibile, rimozione foto).
- [x] Fix decantazione automatica e campi testo auto-espandibili.
- [x] Fase 7: campi testo come paragrafo con modifica esplicita, layout full-width, Azioni sheet compatto.
- [x] Fase 7: campi AI sola lettura, note personali, bicchiere con nome breve, maturazione semplificata, redesign Azioni sheet.
- [x] Fix regioni duplicate nel filtro cantina + etichetta Maturazione troncata.

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

## Fase 7 — Revisione grafica e UX generale (avviata 14/07/2026)

App live e funzionante (Fase 6 completata: RLS attiva, upload etichette, wishlist con foto,
password reale). Enrico ha condiviso screenshot di un'app concorrente ben fatta (Oeni) per
prendere spunti grafici/funzionali. Backlog prioritizzato di conseguenza, dal più al meno
impattante/economico da realizzare. Coerente con le decisioni "Cosa NON fare" sopra: niente 3D,
niente social/gamification, niente refactor del modello dati.

### Fase 7 — CHIUSA il 15/07/2026, confermata da Enrico dopo l'ultimo giro di test
(filtri cantina, regioni deduplicate, form Aggiungi Vino, bottone Azioni). Prossimo passo:
Fase 8 (identità visiva/branding), quando Enrico deciderà di avviarla — vedi sezione dedicata
più sotto per il contesto già raccolto.

### Priorità 1 — alto impatto, sforzo contenuto
- [x] Bottone unico "Azioni" nella scheda vino (`WineDetailClient.tsx`): bottom sheet con le
      azioni disponibili (Segna come bevuta, Modifica valore, Aggiungi nota, ecc.) invece di
      pulsanti sparsi per la pagina — spunto segnalato direttamente da Enrico su uno screenshot
      annotato a mano ("TASTO AZIONI")
- [x] **Fatto il 15/07/2026 (controllo funzionale su Oeni)**: rimozione bottiglia dalla cantina
      senza passare da "Segna come bevuta". Oggi in `BottleActionsSheet.tsx` esiste solo
      "🍷 Segna come bevuta" (`DrinkBottleModal.tsx` → `drinkBottleAction`), che scala sempre e
      solo 1 unità e presume che la bottiglia sia stata bevuta. Manca un'azione tipo "🗑️ Rimuovi
      bottiglia" per i casi in cui non è stata bevuta (rotta, regalata, errore di inserimento) —
      e in generale, quando la quantità di un'annata è > 1, nessuna delle due azioni chiede
      "quante ne hai tolte?" (oggi si scala sempre 1 alla volta). Da aggiungere: nuova voce nel
      bottom sheet, con un piccolo input quantità se `bottle.quantity > 1`, che decrementa
      `bottles.quantity` senza creare una voce nel Diario (a differenza di "Segna come bevuta").
- [x] **Fatto il 15/07/2026**: Curva di maturazione con faccine/emoji lungo la curva (🌱/⏳/🍷/📉)
      e legenda sotto con fasce d'età + nome fase, per renderla ancora più leggibile
- [x] **Fatto il 15/07/2026**: Empty state illustrati e più caldi per Diario/Wishlist/Vini
      (nuovo `components/EmptyState.tsx`, con CTA verso l'azione utile in ciascun caso);
      distinto anche il caso "cantina vuota" da "nessun risultato con i filtri attivi" in
      `WineListClient.tsx`, prima confusi nello stesso messaggio
- [x] **Fatto il 15/07/2026**: nella lista "I miei vini" ora si vede inline prezzo d'acquisto
      vs valore corrente con percentuale (`components/Winecard.jsx`), colorata con i token
      status-ready/status-decline; nessuna riga se mancano entrambi i dati.

### Priorità 1 — CHIUSA il 15/07/2026, tutti i punti completati e verificati via codice.

### Priorità 2 — impatto medio, richiede più lavoro
- [ ] **Nuovo (15/07/2026, da screenshot Oeni "Cibo & vino")**: nella scheda vino, aggiungere
      una sezione di abbinamento più ricca di quella attuale (box statico per colore) — con
      categorie/piatti illustrati con foto (es. "Formaggio blu", "Agnello", "Cibi piccanti"),
      che quando selezionati mostrino sia vini consigliati in generale da comprare (per invogliare
      l'acquisto, come su Oeni) sia — cosa più utile per noi — quali vini GIÀ in cantina si
      abbinano bene a quel piatto/categoria. È un'evoluzione della logica "Cosa mangi stasera?"
      già esistente in home (`FoodPairingForm.tsx` → `getPairingAction`, oggi input libero testo)
      ma con un punto d'ingresso a griglia fotografica per categoria invece che solo testo libero,
      e con l'aggiunta dei vini "da comprare" oltre a quelli in cantina.
- [ ] Sezione abbinamenti cibo-vino: sostituire i chip testuali con card fotografiche (foto
      reali del piatto) e percentuale di match, sia nella scheda vino che nella pagina "Cibo e
      vino" dedicata — capofila naturale del punto sopra
- [x] **Fatto il 15/07/2026**: hero fotografico nella scheda vino, foto fissa di vigneto/vista
      panoramica (stessa per tutti i vini) con overlay scuro sfumato 40%→75%, testo bianco/
      brand-200 sopra.
- [x] **Fatto il 15/07/2026**: profilo gustativo ora mostrato con 5 slider orizzontali
      (Corpo/Intensità/Tannini/Acidità/Persistenza, con poli descrittivi), alcol a parte come
      testo. Adattato rispetto al piano originale: "Piatto↔Frizzante" non esiste nei dati
      restituiti da Gemini (`lib/ai/enrichWine.ts`), scartato per non inventare un dato AI falso.
- [x] **Fatto il 15/07/2026**: tag liberi sulle bottiglie (non sul vino generico, dato che tag
      come "Regalo" riguardano l'acquisto specifico) — nuova colonna `bottles.tags text[]`
      (migrazione `0009_bottle_tags.sql`), campo testo libero nel form (virgola-separato,
      ripulito lato server), mostrati come chip color sabbia nella scheda vino.
- [x] **Fatto il 15/07/2026**: campo formato bottiglia (`Bottle.format_ml`) ora collegato:
      select nel form Aggiungi Vino (Piccola/Mezza/Standard/Magnum/Doppio Magnum, default 750),
      salvato in `createWine` con fallback a 750, e mostrato come chip nella scheda vino
      (`BottleCard` in `WineDetailClient.tsx`).

### Priorità 3 — idee valide ma da valutare più avanti
- [ ] Gestione multi-annata/formato sotto un'unica scheda prodotto (oggi ogni bottiglia è
      un'entry a sé) — cambierebbe struttura della UI di dettaglio, non il modello dati
      sottostante; da valutare se serve davvero per uso personale
- [ ] Barra "Qualità annata" con icona meteo, derivata automaticamente dal testo
      `vintage_review` già generato dall'AI

### Nuovi spunti da Oeni (segnalati da Enrico il 15/07/2026, da smistare in priorità)
- [ ] **Selettore annata a pillole orizzontali**: nella scheda vino di Oeni, invece di una lista
      verticale di tutte le annate possedute (come facciamo oggi in "Le tue Annate"), si sceglie
      UNA annata alla volta con pillole scorrevoli in alto ("Senza annata", 2026, 2025, 2024...) e
      sotto si vedono solo i dati di quella selezionata. Cambierebbe la struttura della tab
      Annate — da valutare se e quanto vogliamo davvero passare da "vedo tutto in sequenza" a
      "scelgo e vedo una alla volta".
- [ ] **Card vino in lista con foto "a sbalzo" + fascia prezzo**: nella lista vini di Oeni, la
      foto della bottiglia sporge leggermente da un blocco colorato dietro di essa, con
      annata+quantità come badge sovrapposto in alto a sinistra sulla foto, e sotto una fascia
      grigia chiara divisa in due colonne (Prezzo d'acquisto | Valore). Evoluzione grafica di
      quanto già fatto in Priorità 1 (prezzo/valore inline in `Winecard.jsx`), qui più il layout
      che il dato in sé (che abbiamo già).
- [ ] **Schermata di conferma dopo il salvataggio vino**: oggi `createWine` fa `redirect`
      diretto a `/cantina/[id]` senza nessuna schermata intermedia. Oeni mostra "Complimenti! La
      tua cantina è aggiornata" con spunta verde (e Enrico suggerisce anche una mini
      animazione) prima di arrivare alla scheda. Aggiungerebbe un passaggio in più al flusso,
      da bilanciare con la velocità d'uso.

### Esplicitamente escluso (coerente con "Cosa NON fare")
- Cantina 3D, gamification a punti/sfide, funzioni social/amici — viste su Oeni ma fuori scope
  per un'app di uso personale

### Problema noto da indagare (segnalato da Enrico il 14/07/2026)
- L'analisi foto etichetta (`analyzeLabelAction` -> `analyzeWineLabel` in `lib/ai/enrichWine.ts`)
  impiega circa 2 minuti, troppo lento per un'attesa in-app. Ipotesi principale: chiediamo
  troppi campi in un'unica chiamata al modello (nome, produttore, colore, regione, paese,
  uvaggio, descrizione, terroir, recensione annata, maturazione, temperatura, bicchiere,
  decantazione, analisi organolettica, profilo gustativo — tutto insieme). Da valutare in una
  sessione dedicata: dividere in due chiamate (dati essenziali veloci + arricchimento testuale
  più lento in background), o ridurre lo schema richiesto. Non affrontato ora per non
  mischiarlo con i fix di stile in corso.

## Bug trovato e corretto durante la Fase 7 (15/07/2026): foto non riconosciute

Controllando come procedere con l'hero fotografico della scheda vino, Enrico ha chiesto cosa
succede caricando una foto non pertinente (es. un gatto, o una foto storta/sfocata dell'etichetta).
Verifica del codice: **nessuna gestione esisteva** — lo schema Gemini in
`lib/ai/enrichWine.ts` (`analyzeWineLabel`) rendeva `name`/`producer`/`color` obbligatori,
quindi il modello non aveva modo di dire "non riconosciuto" e rischiava di inventare dati
plausibili invece di segnalare l'errore. Corretto: nuovo campo `recognized` (unico obbligatorio),
prompt aggiornato per non inventare dati se l'immagine non mostra chiaramente un'etichetta,
errore esplicito lanciato e mostrato all'utente (`e.message`) sia in Aggiungi Vino che in
Wishlist, al posto del generico "Errore durante l'analisi dell'etichetta" senza motivo.
Nessuna correzione automatica dell'orientamento della foto (non richiesta, non implementata).

## Rimozione sfondo foto vino (15/07/2026)

Motivata dal confronto con Oeni: la bottiglia nella hero fotografica sembrava un adesivo bianco
sopra la foto di sfondo, perché le nostre foto (reali o generate) hanno lo sfondo pieno cotto nei
pixel, mentre Oeni pesca da un catalogo centralizzato con immagini già pulite (confermato via
ricerca: nessun database italiano gratuito/completo con foto esiste, quindi non serve inseguire
quella strada — il problema si risolve senza database, solo pulendo l'immagine che già abbiamo).

- [x] **Fatto il 15/07/2026**: integrato `@imgly/background-removal` (rimozione sfondo
      client-side via WASM/ONNX, gratuita, nessuna API key, nessun costo per immagine — a
      differenza di remove.bg che nel piano gratuito dà solo 50 immagini/mese a bassa
      risoluzione). Nota: licenza AGPL — da rivalutare se in futuro l'app diventa un prodotto
      commerciale vero (Enrico ha detto che a quel punto pagherebbe volentieri un servizio AI
      dedicato senza problemi).
- [x] Rimosso il precedente trucco CSS (maschera radiale) nella hero — non necessario e
      potenzialmente dannoso ora che la trasparenza è reale.
- [x] Fix build Vercel: `next.config.js` con `transpilePackages` per i pacchetti imgly/onnxruntime-web,
      alias `onnxruntime-node: false` lato client, regola webpack per i moduli `.mjs`.
- **Nota**: i vini salvati PRIMA di questa modifica mantengono la foto con sfondo pieno originale
  (nessun riprocessamento retroattivo) — tornano a un riquadro semplice nella hero, senza più
  l'alone bianco sfocato del tentativo precedente. Solo i vini aggiunti da ora in poi hanno il
  ritaglio pulito vero.

## Fase 8 — Identità visiva e branding (segnalata da Enrico il 15/07/2026, da avviare dopo
la Fase 7)

Enrico ha detto esplicitamente (più di una volta): l'app deve differenziarsi visivamente ed
essere "molto attrattiva" perché nei suoi piani potrebbe voler essere rivenduta/proposta ad
altri, non resta solo un progetto personale. Questo cambia la posta in gioco rispetto ai fix
di UI fatti finora in Fase 7 (che erano correzioni puntuali a schermate esistenti): qui si
parla di un vero e proprio passaggio di identità — palette colori, tipografia, set di icone
coerente, tono grafico generale — pensato apposta per differenziare il prodotto, non solo
per renderlo "pulito".

**Chiarito con Enrico il 15/07/2026**: ambizione reale = prodotto potenzialmente rivendibile,
non solo uso personale — l'identità visiva va quindi pensata per differenziare davvero, non
solo per pulizia. Enrico ha confermato esplicitamente di voler prima concludere tutta la Fase
7 (strutturale/bug) e affrontare la grafica solo dopo, in una sessione dedicata. Quando si
parte: proporre 2-3 direzioni visive alternative (palette + font + un paio di schermate
reinterpretate) prima di scrivere codice, stesso approccio già usato con successo per la curva
di maturazione — non presumere che si parta dalla palette attuale (brand/sand/ino) o da zero,
va deciso insieme in quel momento.
