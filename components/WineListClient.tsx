'use client';

import { useState, useMemo } from 'react';
import WineCard from './Winecard';

export default function WineListClient({ bottles }) {
  const [filters, setFilters] = useState({
    type: '',
    aging: '',
    year: '',
    region: '',
    inStockOnly: false,
  });

  const filteredBottles = useMemo(() => {
    return bottles.filter((bottle) => {
      const wine = bottle.wine;
      if (!wine) return false;

      // Filter by type (color)
      if (filters.type && wine.color !== filters.type) return false;
      
      // Filter by aging status
      if (filters.aging && bottle.aging_status !== filters.aging) return false;

      // Filter by year
      if (filters.year && bottle.year.toString() !== filters.year) return false;

      // Filter by region
      if (filters.region && wine.region !== filters.region) return false;

      // Filter by stock
      if (filters.inStockOnly && (bottle.quantity || 0) <= 0) return false;

      return true;
    });
  }, [bottles, filters]);

  // Extract unique values for filter dropdowns
  const uniqueTypes = Array.from(new Set(bottles.map((b: any) => b.wine?.color).filter(Boolean))) as string[];
  const uniqueYears = Array.from(new Set(bottles.map((b: any) => b.year).filter(Boolean))).sort((a: any, b: any) => b - a) as string[];
  const uniqueRegions = Array.from(new Set(bottles.map((b: any) => b.wine?.region).filter(Boolean))).sort() as string[];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-sand-200/70 space-y-4">
        <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider">Filtra Cantina</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            className="p-2 text-sm border rounded-lg bg-sand-50 focus:ring-2 focus:ring-brand-500 outline-none"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Tipologia</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            className="p-2 text-sm border rounded-lg bg-sand-50 focus:ring-2 focus:ring-brand-500 outline-none"
            value={filters.aging}
            onChange={(e) => setFilters({ ...filters, aging: e.target.value })}
          >
            <option value="">Maturazione</option>
            <option value="too_young">Giovane</option>
            <option value="almost_ready">Quasi pronto</option>
            <option value="ready">Pronto ora</option>
            <option value="past_peak">In declino</option>
          </select>

          <select
            className="p-2 text-sm border rounded-lg bg-sand-50 focus:ring-2 focus:ring-brand-500 outline-none"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="">Annata</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            className="p-2 text-sm border rounded-lg bg-sand-50 focus:ring-2 focus:ring-brand-500 outline-none"
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          >
            <option value="">Regione</option>
            {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t">
          <input
            type="checkbox"
            id="inStock"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
            className="rounded text-black focus:ring-brand-500"
          />
          <label htmlFor="inStock" className="text-sm text-ink-500">Solo disponibili in cantina (Q.tà &gt; 0)</label>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-ink-500 px-1">
        <span>Trovati {filteredBottles.length} risultati</span>
      </div>

      {filteredBottles.length === 0 ? (
        <p className="text-center text-ink-500 mt-10">Nessun vino trovato con questi filtri 🍷</p>
      ) : (
        <div className="space-y-4">
          {filteredBottles.map((bottle) => (
            <WineCard key={bottle.id} bottle={bottle} />
          ))}
        </div>
      )}
    </div>
  );
}
