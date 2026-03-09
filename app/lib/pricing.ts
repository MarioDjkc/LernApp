/**
 * Dynamische Preisformel für Nachhilfestunden.
 *
 * f(x) = 25 + (45-25) * (1 - e^(-x/15)) * a/5
 *
 * x = Anzahl der Bewertungen
 * a = Durchschnittsbewertung (1–5), Minimalwert 1 wenn noch keine Bewertungen
 *
 * Neue Lehrkräfte (x=0) starten bei 25 €/h.
 * Mit vielen Top-Bewertungen (x→∞, a=5) konvergiert der Preis gegen 45 €/h.
 *
 * Ergebnis: Preis pro Stunde in EUR (gerundet auf 2 Dezimalstellen)
 */
export function calcHourlyPrice(ratingCount: number, avgRating: number | null): number {
  const x = Math.max(0, ratingCount);
  const a = Math.max(1, avgRating ?? 1);
  const raw = 25 + 20 * (1 - Math.exp(-x / 15)) * (a / 5);
  return Math.round(raw * 100) / 100;
}

/**
 * Berechnet den Gesamtpreis in Cent für eine Buchung.
 * durationMinutes: Dauer in Minuten
 */
export function calcPriceCents(
  durationMinutes: number,
  ratingCount: number,
  avgRating: number | null
): number {
  const hourlyPrice = calcHourlyPrice(ratingCount, avgRating);
  return Math.round((durationMinutes / 60) * hourlyPrice * 100);
}
