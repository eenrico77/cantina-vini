-- tastings e wine_values sono residui di un vecchio progetto Supabase abbandonato
-- (vedi ROADMAP.md), non usati dal codice attuale. Il Security Advisor segnala
-- RLS disabilitato: senza policy, abilitare RLS blocca ogni accesso via anon key.
ALTER TABLE public.tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_values ENABLE ROW LEVEL SECURITY;
