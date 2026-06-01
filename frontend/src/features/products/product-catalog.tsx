'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import type { Category, Product, User } from '@/types';
import { getCategories } from '@/features/categories/categories.api';
import { ProductCreateDialog } from './product-create-dialog';
import { ProductsTable } from './products-table';
import { getProducts } from './products.api';

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const nextProducts = await getProducts(true);
      setError('');
      setProducts(nextProducts);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([getProducts(true), getCategories()])
      .then(([nextProducts, nextCategories]) => { setProducts(nextProducts); setCategories(nextCategories); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load products'))
      .finally(() => setLoading(false));
    api<User>('/auth/me').then(setUser).catch(() => undefined);
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = !category || product.categoryId === category;
      const matchesSearch = !query || [product.name, product.sku, product.category.name, product.description ?? ''].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [category, products, search]);

  return <>
    <PageHeader
      eyebrow="Inventory"
      title="Rental products"
      description="Manage the products and equipment available to your organization."
      action={user?.role === 'ADMIN' ? <button type="button" onClick={() => setDialogOpen(true)} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900"><Plus size={18}/>Add product</button> : undefined}
    />

    <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search products</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product, SKU or category" className="focus-ring min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm placeholder:text-slate-400"/>
      </label>
      <select aria-label="Filter category" value={category} onChange={(event) => setCategory(event.target.value)} className="focus-ring min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">
        <option value="">All categories</option>
        {categories.map((value) => <option key={value.id} value={value.id}>{value.name}</option>)}
      </select>
      <p className="whitespace-nowrap px-2 text-sm font-semibold text-slate-500">{visible.length} {visible.length === 1 ? 'product' : 'products'}</p>
    </section>

    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <ProductsTable products={visible} loading={loading} emptyMessage={products.length ? 'No products match the current search and category filter.' : 'No products have been added yet.'}/>

    {dialogOpen && <ProductCreateDialog categories={categories} onClose={() => setDialogOpen(false)} onCreated={load}/>} 
  </>;
}
