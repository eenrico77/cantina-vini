-- Aggiunge i campi che il riconoscimento AI (Gemini) può fornire e che vogliamo conservare.
-- Esegui questo script nell'SQL Editor di Supabase, dopo 0001_consolidation.sql.
-- Sicuro da rilanciare più volte (IF NOT EXISTS).

alter table wines
  add column if not exists grapes text,
  add column if not exists description text,
  add column if not exists origin_notes text,
  add column if not exists vintage_review text,
  -- { visual: string, olfactory: string, gustatory: string }
  add column if not exists organoleptic jsonb,
  -- { body: int, intensity: int, tannins: int, acidity: int, persistence: int, alcohol: number }
  add column if not exists taste_profile jsonb;

-- Nota: image_url esiste già da 0001_consolidation.sql. Ci salveremo dentro anche
-- l'immagine generata dall'AI (come data URL base64), non serve una colonna nuova.
