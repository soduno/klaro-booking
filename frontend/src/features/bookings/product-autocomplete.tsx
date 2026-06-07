'use client';

import { useId, useMemo, useState } from 'react';
import { Check, ChevronDown, Package, Search } from 'lucide-react';
import type { Product } from '@/types';

export function filterProducts(products: Product[], query: string, excludedIds: string[] = []) {
  const normalized = query.trim().toLowerCase();
  return products
    .filter((product) => !excludedIds.includes(product.id))
    .filter((product) => !normalized || [product.name, product.sku, product.category.name].some((value) => value.toLowerCase().includes(normalized)))
    .slice(0, 8);
}

export function ProductAutocomplete({ products, selectedId, excludedIds, index, error, onSelect }: { products: Product[]; selectedId: string; excludedIds: string[]; index: number; error?: string; onSelect: (id: string) => void }) {
  const inputId = useId();
  const listId = `${inputId}-list`;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = products.find((product) => product.id === selectedId);
  const results = useMemo(() => filterProducts(products, query, excludedIds), [excludedIds, products, query]);
  const displayedValue = open ? query : selected?.name ?? query;

  const choose = (product: Product) => {
    onSelect(product.id);
    setQuery(product.name);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && open && results[activeIndex]) {
      event.preventDefault();
      choose(results[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return <div className="relative grid gap-2 text-sm font-semibold text-slate-700">
    <label htmlFor={inputId}>Product</label>
    <span className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/>
      <input id={inputId} role="combobox" aria-label={`Product ${index + 1}`} aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open && results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined} autoComplete="off" placeholder="Search by name, SKU or category…" value={displayedValue} onFocus={() => { setQuery(selected?.name ?? query); setActiveIndex(0); setOpen(true); }} onBlur={() => window.setTimeout(() => setOpen(false), 100)} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true); if (selectedId) onSelect(''); }} onKeyDown={handleKeyDown} className={`focus-ring min-h-11 w-full rounded-xl border bg-white pl-10 pr-10 font-normal text-slate-950 placeholder:text-slate-400 ${error ? 'border-red-400' : 'border-slate-300'}`}/>
      <ChevronDown className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition ${open ? 'rotate-180' : ''}`} size={17}/>
    </span>
    {error && <span className="font-normal text-red-700">{error}</span>}
    {open && <span id={listId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
      {results.length ? results.map((product, resultIndex) => <button id={`${listId}-${product.id}`} key={product.id} type="button" role="option" aria-selected={product.id === selectedId} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(product)} onMouseEnter={() => setActiveIndex(resultIndex)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${resultIndex === activeIndex ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><Package size={17}/></span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-slate-900">{product.name}</span><span className="block truncate text-xs font-normal text-slate-500">{product.sku} · {product.category.name}</span></span><span className="shrink-0 text-xs font-semibold text-slate-500">{product.quantity} total</span>{product.id === selectedId && <Check className="shrink-0 text-emerald-700" size={17}/>}</button>) : <span className="block px-4 py-6 text-center text-sm font-normal text-slate-500">No matching products</span>}
    </span>}
  </div>;
}
