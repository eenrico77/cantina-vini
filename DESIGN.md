# Cantina Vini — Identità visiva

Decisioni prese il 13/07/2026. Vincolanti per ogni componente nuovo o modificato:
se un componente non rispetta queste regole, va corretto, non lasciato con i suoi colori.

## Direzione

Ambra/terracotta caldo (già presente in `tailwind.config.js`, prima solo abbozzato e mai
usato davvero). Mood: elegante e minimale — coerente con la visione del PRD di "cantina
digitale elegante", non un gestionale. Poco testo, molto spazio, niente elementi gridati
o eccessivamente decorativi.

## Palette (in `tailwind.config.js`)

- `brand-500` (`#c7773a`) — colore d'accento principale: bottoni primari, tab attiva,
  elementi interattivi in evidenza. Non usare `black`/`gray-900` per i bottoni primari.
- `brand-50/100/200/400/600` — varianti per hover, sfondi leggeri, bordi in evidenza.
- `sand-50` — sfondo dell'app (non bianco puro).
- `sand-100` — sfondo delle card.
- `sand-200` — bordi e divisori (non `gray-200`/`gray-300` generico).
- `ink-700` — testo principale (non `black`/`gray-900`: leggermente più caldo).
- `ink-500` — testo secondario (non `gray-500` generico, per coerenza cromatica).
- `status-young / status-almost / status-ready / status-decline` — SOLO per lo stato di
  maturazione (badge, curva). Non riusare questi colori per altro.

## Tipografia

- Font: Inter (già configurato in `app/layout.tsx`), va bene, non cambiare.
- Titoli pagina (h1): `text-2xl md:text-3xl font-bold text-ink-700 tracking-tight`
- Titoli sezione (h2/h3): `text-lg font-semibold text-ink-700`
- Testo secondario/meta: `text-sm text-ink-500`
- Etichette piccole (badge, label sopra i valori): `text-xs uppercase tracking-wide text-ink-500`

## Componenti — regole comuni

- **Card**: sfondo `bg-white` o `bg-sand-50`, `rounded-2xl`, `shadow-soft`, bordo
  `border border-sand-200` solo se serve separare da uno sfondo dello stesso colore.
- **Bottone primario**: `bg-brand-500 text-white rounded-full px-5 py-2.5 font-medium
  hover:bg-brand-600 transition-colors`. Mai `bg-black`.
- **Bottone secondario**: `bg-sand-100 text-ink-700 rounded-full`.
- **Badge tipologia vino** (`WineTypeBadge`): può restare multicolore (Rosso/Bianco/
  Rosato/Bollicine/Dolce sono informazione, non branding) ma con toni pastello coerenti
  con la palette calda, non colori Tailwind di default a caso.
- **Badge stato maturazione**: usa sempre `status-young/almost/ready/decline`, mai
  blue/green/red di default.
- **Icone**: line-icon semplici, mai emoji nella UI finale (le emoji nel nav attuale
  🏠🍷📊📓 sono un placeholder, da sostituire con icone vere prima della release).

## Cosa correggere per allineare il progetto esistente

- `app/cantina/[id]/page.tsx` usa ancora `style={{...}}` inline con bordi grigi e nessun
  colore di brand: va riscritta con le classi Tailwind e la palette sopra, è la pagina
  più indietro sul piano visivo.
- Tutti i bottoni primari attuali (`/wines`, `/cantina/new`) sono `bg-black`: da
  aggiornare a `bg-brand-500`.
- `lib/domain/maturation.ts` (`getAgingBadgeColor`) usa blue/amber/green/red di Tailwind
  default: da aggiornare ai token `status-*`.
- Menu in basso (`BottomNav.jsx`): emoji da sostituire con icone (es. lucide-react, già
  disponibile in molti setup Next/Tailwind) prima della release, non urgente ora.

## Cosa NON fare

- Non introdurre altri colori "una tantum" per singoli componenti: se manca un token,
  aggiungilo a `tailwind.config.js` con un nome semantico, non un colore Tailwind grezzo.
- Non usare nero puro (`#000`/`black`) né bianco puro come colore di testo: usare sempre
  `ink-700`/`ink-500` e `sand-50`/`white` per gli sfondi.
