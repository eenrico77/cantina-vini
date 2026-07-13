"use client";

import { createWine } from "./actions";

const COLORS = ["Rosso", "Bianco", "Rosato", "Bollicine", "Dolce"];

export default function NewWinePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Nuovo vino</h1>

      <form action={createWine} className="space-y-2">
        <div>
          <input name="name" placeholder="Nome vino" required className="border p-2 rounded mb-2 w-full" />
        </div>

        <div>
          <input name="producer" placeholder="Produttore" required className="border p-2 rounded mb-2 w-full" />
        </div>

        <div>
          <select name="color" required defaultValue="" className="border p-2 rounded mb-2 w-full">
            <option value="" disabled>
              Tipologia
            </option>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input name="region" placeholder="Regione (opzionale)" className="border p-2 rounded mb-2 w-full" />
        </div>

        <div>
          <input name="country" placeholder="Paese (opzionale)" className="border p-2 rounded mb-2 w-full" />
        </div>

        <div>
          <input
            name="year"
            type="number"
            placeholder="Annata (Anno)"
            required
            className="border p-2 rounded mb-2 w-full"
          />
        </div>

        <div>
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Quantità"
            required
            className="border p-2 rounded mb-2 w-full"
          />
        </div>

        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
            Aggiungi vino
        </button>
      </form>
    </div>
  );
}
