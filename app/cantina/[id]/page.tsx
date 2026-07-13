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

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
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
        <h3 style={{ margin: "0 0 10px" }}>Storage &amp; Service</h3>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>TEMP.</div>
            <div style={{ fontWeight: 700 }}>{wine.ideal_temp ?? "—"}</div>
          </div>

          <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>DECANTING</div>
            <div style={{ fontWeight: 700 }}>{wine.decanting_needed ? "Sì" : "No"}</div>
          </div>
        </div>

        {wine.storage_notes ? (
          <div style={{ marginTop: 12, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>NOTE DI CONSERVAZIONE</div>
            <div>{wine.storage_notes}</div>
          </div>
        ) : null}

        {/* EXTRA AI DATA (Testo Grezzo) */}
        <div style={{ marginTop: 16, padding: 14, border: "1px solid #eee", borderRadius: 14, fontSize: 13, background: "#f9fafb" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Dati AI Aggiuntivi:</div>
          {wine.grapes && <div><strong>Uvaggio:</strong> {wine.grapes}</div>}
          {wine.description && <div><strong>Descrizione:</strong> {wine.description}</div>}
          {wine.origin_notes && <div><strong>Terroir:</strong> {wine.origin_notes}</div>}
          {wine.vintage_review && <div><strong>Recensione Annata:</strong> {wine.vintage_review}</div>}
          {wine.organoleptic && <div><strong>Organolettico:</strong> {JSON.stringify(wine.organoleptic)}</div>}
          {wine.taste_profile && <div><strong>Profilo Gustativo:</strong> {JSON.stringify(wine.taste_profile)}</div>}
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <h3 style={{ margin: "0 0 10px" }}>I tuoi millesimi</h3>

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
