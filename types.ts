export type WineColor = "Rosso" | "Bianco" | "Bollicine" | "Rosato" | "Dolce";

export type AgingStatus = "too_young" | "almost_ready" | "ready" | "past_peak";

// Il vino concettuale: dati che valgono per tutte le annate possedute.
export interface Wine {
  id: string;
  name: string;
  producer: string;
  color?: WineColor | null;
  region?: string | null;
  country?: string | null;
  image_url?: string | null;
  ideal_temp?: string | null;
  decanting_needed?: boolean | null;
  storage_position?: string | null;
  storage_temperature?: string | null;
  storage_humidity?: string | null;
  storage_notes?: string | null;
  maturation_confidence?: string | null;
  ai_generated?: boolean | null;
}

// La bottiglia realmente posseduta: la maturazione è per annata, non sul vino generico.
export interface Bottle {
  id: string;
  wine_id: number | string;
  user_id: string;
  cellar_id?: string | null;
  year?: number | null;
  quantity: number;
  format_ml?: number | null;
  purchase_price?: number | null;
  current_value?: number | null;
  peak_start?: number | null;
  peak_end?: number | null;
  aging_status?: AgingStatus | null;
  notes?: string | null;
  rating?: number | null;
  tags?: string[] | null;
  wine?: Wine | null;
}
