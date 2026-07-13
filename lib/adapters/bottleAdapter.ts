import type { Bottle, Wine } from "../../types";

export function mapBottleFromDB(row: any): Bottle {
  const w = Array.isArray(row?.wines) ? row.wines[0] : row?.wines;

  const wine: Wine | null = w
    ? {
        id: String(w.id),
        name: String(w.name ?? ""),
        producer: String(w.producer ?? ""),

        color: w.color ?? null,
        region: w.region ?? null,
        country: w.country ?? null,

        image_url: w.image_url ?? null,
        ideal_temp: w.ideal_temp ?? null,
        decanting_needed: w.decanting_needed ?? null,
        storage_position: w.storage_position ?? null,
        storage_temperature: w.storage_temperature ?? null,
        storage_humidity: w.storage_humidity ?? null,
        storage_notes: w.storage_notes ?? null,
        maturation_confidence: w.maturation_confidence ?? null,
        ai_generated: w.ai_generated ?? null,
      }
    : null;

  return {
    id: String(row.id),
    wine_id: row.wine_id,
    user_id: String(row.user_id),
    cellar_id: row?.cellar_id ?? null,
    year: row?.year ?? null,
    quantity: Number(row?.quantity ?? 1),
    format_ml: row?.format_ml ?? null,
    purchase_price: row?.purchase_price ?? null,
    current_value: row?.current_value ?? null,

    peak_start: row?.peak_start ?? null,
    peak_end: row?.peak_end ?? null,
    aging_status: row?.aging_status ?? null,
    notes: row?.notes ?? null,
    rating: row?.rating ?? null,

    wine,
  };
}
