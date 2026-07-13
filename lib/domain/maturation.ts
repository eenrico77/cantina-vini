import type { AgingStatus } from "../../types";

/**
 * Calcola lo stato di maturazione DI UNA SPECIFICA BOTTIGLIA/ANNATA,
 * dati i suoi peak_start/peak_end (non i dati generici del vino).
 */
export function getAgingStatus(
  currentYear: number,
  peakStart: number,
  peakEnd: number
): AgingStatus {
  if (currentYear < peakStart - 1) return "too_young";
  if (currentYear === peakStart - 1) return "almost_ready";
  if (currentYear >= peakStart && currentYear <= peakEnd) return "ready";
  return "past_peak";
}

export function getAgingLabel(status: AgingStatus, peakStart: number, peakEnd: number) {
  switch (status) {
    case "too_young":
      return `Troppo giovane — ideale da bere dal ${peakStart}`;
    case "almost_ready":
      return `Quasi pronto — al meglio dal ${peakStart}`;
    case "ready":
      return `Pronto ora — finestra ideale fino al ${peakEnd}`;
    case "past_peak":
      return `Oltre il picco — finestra ideale terminata nel ${peakEnd}`;
  }
}

export function getAgingBadgeColor(status: AgingStatus | null | undefined): string {
  switch (status) {
    case "too_young":
      return "bg-blue-100 text-blue-800";
    case "almost_ready":
      return "bg-amber-100 text-amber-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "past_peak":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
