export type BottleAgingStatus = "too_young" | "almost_ready" | "ready" | "past_peak";

export type EnrichedWine = {
  // Maturazione: PER ANNATA (una bottiglia/vintage specifica), non generica sul vino.
  aging: {
    peak_start: number;
    peak_end: number;
    status: BottleAgingStatus;
    confidence: "low" | "medium" | "high";
  };
  // Info generali del vino (valgono per tutte le annate): servizio e conservazione.
  wine: {
    ideal_temp: string;
    decanting_needed: boolean;
    storage_position: string;
    storage_temperature: string;
    storage_humidity: string;
    storage_notes: string;
  };
};

function computeStatus(year: number, peakStart: number, peakEnd: number): BottleAgingStatus {
  const currentYear = new Date().getFullYear();
  if (currentYear < peakStart - 1) return "too_young";
  if (currentYear === peakStart - 1) return "almost_ready";
  if (currentYear >= peakStart && currentYear <= peakEnd) return "ready";
  return "past_peak";
}

/**
 * MOCK temporaneo, finché non colleghiamo un vero motore AI.
 * Riceve l'annata specifica (year) della bottiglia, non solo il vino,
 * perché la finestra di maturazione dipende dal millesimo.
 */
export async function enrichWineWithAI(
  name: string,
  producer: string,
  year: number
): Promise<EnrichedWine | null> {
  try {
    const peak_start = year + 2;
    const peak_end = year + 8;

    return {
      aging: {
        peak_start,
        peak_end,
        status: computeStatus(year, peak_start, peak_end),
        confidence: "medium",
      },
      wine: {
        ideal_temp: "12–14°C",
        decanting_needed: false,
        storage_position: "orizzontale",
        storage_temperature: "12–14°C",
        storage_humidity: "65–75%",
        storage_notes: "Conservare al buio, lontano da vibrazioni",
      },
    };
  } catch {
    return null;
  }
}
