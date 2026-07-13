"use client";
import { deleteWishlistItem } from "@/app/wishlist/actions";

export default function WishlistClientList({ items }: { items: any[] }) {
  if (items.length === 0) return <p className="text-ink-500 text-sm text-center py-4">Nessun vino desiderato per ora.</p>;

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-sm text-ink-500">{item.producer} {item.year ? `— ${item.year}` : ''}</p>
            <p className="text-xs text-ink-500/70 mt-1">
              {[item.color, item.region, item.country].filter(Boolean).join(" · ")}
            </p>
            {item.notes && <p className="text-sm mt-2 italic text-ink-500">"{item.notes}"</p>}
          </div>
          <button onClick={() => deleteWishlistItem(item.id)} className="text-red-500 text-xs font-semibold px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors">
            Rimuovi
          </button>
        </div>
      ))}
    </div>
  );
}
