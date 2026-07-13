-- Consolidamento schema Cantina Vini
-- Esegui questo script nell'SQL Editor di Supabase.
-- Sicuro da rilanciare più volte (usa IF NOT EXISTS / OR REPLACE dove possibile).

-- 1) Colonne mancanti su "wines" necessarie per la scheda dettaglio
--    (immagine rappresentativa, servizio, conservazione)
alter table wines
  add column if not exists image_url text,
  add column if not exists ideal_temp text,
  add column if not exists decanting_needed boolean default false,
  add column if not exists storage_position text,
  add column if not exists storage_temperature text,
  add column if not exists storage_humidity text,
  add column if not exists storage_notes text,
  add column if not exists maturation_confidence text;

-- 2) Il vincolo sul colore non includeva "Dolce" (previsto invece nell'app)
alter table wines drop constraint if exists wines_color_check;
alter table wines add constraint wines_color_check
  check (color = any (array['Rosso'::text, 'Bianco'::text, 'Rosato'::text, 'Bollicine'::text, 'Dolce'::text]));

-- 3) Note e valutazione personale vivono sulla bottiglia/annata posseduta, non sul vino generico
alter table bottles
  add column if not exists notes text,
  add column if not exists rating numeric;

-- 4) format_ml è NOT NULL ma nessun form lo popolava: diamo un default sensato
alter table bottles alter column format_ml set default 750;

-- Nota: bottles.aging_status, bottles.peak_start, bottles.peak_end esistono già
-- e sono la fonte di verità per la maturazione PER ANNATA (non wines.maturation_start/end,
-- che restano come eventuale fallback generico sul vino ma non vengono più letti dall'app).

-- Nota: cellars esiste già (id, user_id, name, location, created_at).
-- L'app crea automaticamente una cellar "Cantina predefinita" per utente al primo utilizzo,
-- non serve intervento manuale qui.
