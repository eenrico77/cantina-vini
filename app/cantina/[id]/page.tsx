import { createClient } from "@/lib/supabase/server";
import MaturationCurve from "@/components/MaturationCurve";
import { getAgingLabel } from "@/lib/domain/maturation";
import type { AgingStatus } from "@/types";

export default async function WineDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div style={{ padding: 24 }}>Non autenticato</div>;
  }

  // Il vino concettuale: dati validi per tutte le annate possedute.
  const { data: wine, error: wineError } = await supabase
    .from("wines")
    .select(
      `
      id,
      name,
      producer,
      color,
      region,
      country,
      image_url,
      ideal_temp,
      decanting_needed,
      storage_position,
      storage_temperature,
      storage_humidity,
      storage_notes,
      grapes,
      description,
      origin_notes,
      vintage_review,
      organoleptic,
      taste_profile
    `
    )
    .eq("user_id", user.id)
    .eq("id", params.id)
    .maybeSingle();

  if (wineError || !wine) {
    return <div style={{ padding: 24 }}>Vino non trovato</div>;
  }

  // Tutte le annate/bottiglie possedute di questo vino: la maturazione è per annata.
  const { data: bottles, error: bottlesError } = await supabase
    .from("bottles")
    .select(
      `
      id,
      year,
      quantity,
      cellar_id,
      peak_start,
      peak_end,
      aging_status,
      notes,
      rating
    `
    )
    .eq("user_id", user.id)
    .eq("wine_id", params.id)
    .order("year", { ascending: false });

  if (bottlesError) {
    return <div style={{ padding: 24 }}>Errore caricamento annate</div>;
  }

  const currentYear = new Date().getFullYear();

  // Etichette leggibili per il profilo gustativo (invece del JSON grezzo)
  const TASTE_LABELS: Record<string, string> = {
    body: "Corpo",
    intensity: "Intensità",
    tannins: "Tannini",
    acidity: "Acidità",
    persistence: "Persistenza",
    alcohol: "Alcol",
  };
  const tasteProfile = wine.taste_profile as Record<string, number> | null;
  const organoleptic = wine.organoleptic as
    | { visual?: string; olfactory?: string; gustatory?: string }
    | null;

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      {wine.image_url ? (
        <img
          src={wine.image_url}
          alt={wine.name}
          style={{
            display: "block",
            maxWidth: 200,
            margin: "0 auto 20px",
            borderRadius: 16,
          }}
        />
      ) : null}

      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
        {wine.producer?.toUpperCase?.() ?? ""}
      </div>

      <h1 style={{ margin: 0, fontSize: 26, lineHeight: 1.15 }}>{wine.name}</h1>

      <div style={{ marginTop: 8, opacity: 0.75 }}>
        {wine.region ? `${wine.region}, ` : ""}
        {wine.country ?? ""}
        {wine.color ? ` · ${wine.color}` : ""}
      </div>

      <div style={{ marginTop: 22 }}>
        <h3 style={{ margin: "0 0 10px" }}>Conservazione e servizio</h3>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>TEMPERATURA</div>
            <div style={{ fontWeight: 700 }}>{wine.ideal_temp ?? "—"}</div>
          </div>

          <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>DECANTAZIONE</div>
            <div style={{ fontWeight: 700 }}>{wine.decanting_needed ? "Sì" : "No"}</div>
          </div>
        </div>

        {wine.storage_notes ? (
          <div style={{ marginTop: 12, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>NOTE DI CONSERVAZIONE</div>
            <div>{wine.storage_notes}</div>
          </div>
        ) : null}

        {/* Dati AI aggiuntivi, in testo leggibile (niente più JSON grezzo) */}
        {(wine.grapes || wine.description || wine.origin_notes || wine.vintage_review || organoleptic || tasteProfile) ? (
          <div style={{ marginTop: 16, padding: 14, border: "1px solid #eee", borderRadius: 14, fontSize: 13, background: "#f9fafb" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Note del vino</div>

            {wine.grapes ? (
              <div style={{ marginBottom: 8 }}>
                <strong>Uvaggio:</strong> {wine.grapes}
              </div>
            ) : null}

            {wine.description ? (
              <div style={{ marginBottom: 8 }}>
                <strong>Descrizione:</strong> {wine.description}
              </div>
            ) : null}

            {wine.origin_notes ? (
              <div style={{ marginBottom: 8 }}>
                <strong>Terroir:</strong> {wine.origin_notes}
              </div>
            ) : null}

            {wine.vintage_review ? (
              <div style={{ marginBottom: 8 }}>
                <strong>Recensione annata:</strong> {wine.vintage_review}
              </div>
            ) : null}

            {organoleptic ? (
              <div style={{ marginBottom: 8 }}>
                <strong>Analisi organolettica:</strong>
                <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                  {organoleptic.visual ? <li>Vista: {organoleptic.visual}</li> : null}
                  {organoleptic.olfactory ? <li>Naso: {organoleptic.olfactory}</li> : null}
                  {organoleptic.gustatory ? <li>Gusto: {organoleptic.gustatory}</li> : null}
                </ul>
              </div>
            ) : null}

            {tasteProfile ? (
              <div>
                <strong>Profilo gustativo:</strong>
                <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                  {Object.entries(tasteProfile).map(([key, value]) => (
                    <li key={key}>
                      {TASTE_LABELS[key] ?? key}: {value}
                      {key === "alcohol" ? "%" : "/5"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* VINO -> CIBO: Abbinamenti statici per colore */}
        {wine.color && (
          <div style={{ marginTop: 16, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>ABBINAMENTI CONSIGLIATI</div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {wine.color === "Rosso" && "Carni rosse, brasati, formaggi stagionati"}
              {wine.color === "Bianco" && "Pesce, crostacei, formaggi freschi"}
              {wine.color === "Bollicine" && "Aperitivo, fritti, sushi"}
              {wine.color === "Rosato" && "Salumi, cucina estiva, pesce grigliato"}
              {wine.color === "Dolce" && "Dessert, formaggi erborinati"}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 26 }}>
        <h3 style={{ margin: "0 0 10px" }}>Le tue annate</h3>

        {!bottles || bottles.length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 14 }}>
            Nessuna bottiglia di questo vino in cantina.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {bottles.map((bottle) => {
              const hasCurve =
                typeof bottle.peak_start === "number" && typeof bottle.peak_end === "number";
              const peak =
                hasCurve
                  ? Math.floor(((bottle.peak_start as number) + (bottle.peak_end as number)) / 2)
                  : null;

              return (
                <div key={bottle.id} style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        flex: 1,
                        border: "1px solid #eee",
                        borderRadius: 14,
                        padding: 14,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.6 }}>ANNATA</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{bottle.year}</div>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        border: "1px solid #eee",
                        borderRadius: 14,
                        padding: 14,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.6 }}>BOTTIGLIE</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{bottle.quantity}</div>
                    </div>
                  </div>

                  {hasCurve ? (
                    <>
                      <MaturationCurve
                        start={bottle.peak_start as number}
                        peak={peak as number}
                        end={bottle.peak_end as number}
                        current={currentYear}
                      />
                      {bottle.aging_status ? (
                        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                          {getAgingLabel(
                            bottle.aging_status as AgingStatus,
                            bottle.peak_start as number,
                            bottle.peak_end as number
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 14 }}>
                      Dati maturazione non disponibili
                    </div>
                  )}

                  {bottle.notes ? (
                    <div style={{ marginTop: 12, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
                      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>NOTE</div>
                      <div>{bottle.notes}</div>
                    </div>
                  ) : null}

                  {typeof bottle.rating === "number" ? (
                    <div style={{ marginTop: 8, fontSize: 13 }}>Valutazione: {bottle.rating}/5</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
