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
      return "bg-status-young/10 text-status-young";
    case "almost_ready":
      return "bg-status-almost/10 text-status-almost";
    case "ready":
      return "bg-status-ready/10 text-status-ready";
    case "past_peak":
      return "bg-status-decline/10 text-status-decline";
    default:
      return "bg-sand-100 text-ink-500";
  }
}
