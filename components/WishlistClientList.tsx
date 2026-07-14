"use client";
import { deleteWishlistItem } from "@/app/wishlist/actions";
import Link from "next/link";

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
          <div className="flex flex-col gap-2 items-end">
            <Link 
              href={`/cantina/new?wishlistId=${item.id}&name=${encodeURIComponent(item.name || '')}&producer=${encodeURIComponent(item.producer || '')}&region=${encodeURIComponent(item.region || '')}&country=${encodeURIComponent(item.country || '')}&color=${encodeURIComponent(item.color || '')}&year=${encodeURIComponent(item.year || '')}`}
              className="text-brand-600 text-xs font-bold px-3 py-1.5 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1 shadow-sm border border-brand-100"
            >
              <span className="text-sm">⭐️</span> Comprato
            </Link>
            <button onClick={() => deleteWishlistItem(item.id)} className="text-red-500 text-xs font-semibold px-2 py-1 hover:bg-red-50 rounded transition-colors w-full text-right">
              Rimuovi
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
