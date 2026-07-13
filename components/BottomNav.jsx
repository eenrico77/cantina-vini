// components/BottomNav.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Oggi", icon: "🏠" },
  { href: "/wines", label: "I miei vini", icon: "🍷" },
  { href: "/stats", label: "Statistiche", icon: "📊" },
  { href: "/diary", label: "Diario", icon: "📓" },
  { href: "/wishlist", label: "Wishlist", icon: "⭐" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10"> {/* Aggiunto z-10 per sicurezza */}
      <div className="max-w-[500px] mx-auto bg-white/95 backdrop-blur border-t border-gray-200 px-3 py-2 flex justify-between">
        {items.map((item) => {
          // Controlla se il pathname attuale inizia con l'href dell'elemento (gestisce le sottorotte come /wines/1)
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 text-xs"
            >
              <span className={`text-xl ${active ? "text-brand-600" : "opacity-50 text-gray-500"}`}>
                {item.icon}
              </span>
              <span
                className={
                  active
                    ? "text-[11px] font-semibold text-brand-600"
                    : "text-[11px] text-slate-500"
                }
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}