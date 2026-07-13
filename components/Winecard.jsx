// components/WineCard.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WineTypeBadge } from './WineTypeBadge';
import { getAgingBadgeColor } from '../lib/domain/maturation';

const AGING_LABELS = {
  too_young: 'Giovane',
  almost_ready: 'Quasi pronto',
  ready: 'Pronto ora',
  past_peak: 'In declino',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=1000&auto=format&fit=crop';

// bottle: risultato di mapBottleFromDB — contiene year/quantity/aging_status e bottle.wine
export default function WineCard({ bottle }) {
  const wine = bottle?.wine;
  if (!wine) return null;

  const imgSrc = wine.image_url || FALLBACK_IMAGE;
  const agingLabel = bottle.aging_status ? AGING_LABELS[bottle.aging_status] : null;

  return (
    <Link href={`/cantina/${wine.id}`} className="block group">
      <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.01] border border-sand-200/70">

        {/* Immagine */}
        <div className="relative w-16 h-24 flex-shrink-0">
          <Image
            src={imgSrc}
            alt={wine.name}
            fill
            sizes="64px"
            className="rounded-lg object-cover shadow-soft-sm"
          />
        </div>

        {/* Dettagli */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-ink-700 truncate group-hover:text-blue-500 transition-colors">
            {wine.name}
          </h2>
          <p className="text-sm text-ink-500 truncate mt-0.5">
            {wine.producer} — {bottle.year}
          </p>
          <p className="text-xs text-ink-500/70 mt-0.5">
            {bottle.quantity} {bottle.quantity === 1 ? 'bottiglia' : 'bottiglie'}
          </p>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {wine.color && <WineTypeBadge type={wine.color} />}
            {agingLabel && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getAgingBadgeColor(
                  bottle.aging_status
                )}`}
              >
                {agingLabel}
              </span>
            )}
          </div>
        </div>

        {/* Icona di accesso */}
        <div className="flex items-center text-ink-500/70">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
