'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FolderPlus, Search } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { formatDateTime } from '@/lib/format';
import { api } from '@/lib/api';
import type { Category, User } from '@/types';
import { getCategories } from './categories.api';
import { CategoryCreateDialog } from './category-create-dialog';

export function CategoryOverview() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setCategories(await getCategories()); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    getCategories().then(setCategories).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load categories')).finally(() => setLoading(false));
    api<User>('/auth/me').then(setUser).catch(() => undefined);
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((category) => !query || [category.name, category.description ?? ''].some((value) => value.toLowerCase().includes(query)));
  }, [categories, search]);

  const columns: DataTableColumn<Category>[] = [
    { key: 'name', header: 'Category', sortable: true, sortValue: (category) => category.name, cell: (category) => <Link href={`/dashboard/categories/${category.id}`} className="font-bold text-slate-900 hover:text-emerald-800 hover:underline">{category.name}</Link> },
    { key: 'description', header: 'Description', sortable: true, sortValue: (category) => category.description ?? '', cell: (category) => <span className="block max-w-xl truncate text-slate-600">{category.description || '—'}</span> },
    { key: 'products', header: 'Products', sortable: true, sortValue: (category) => category.productCount ?? 0, cell: (category) => <strong>{category.productCount ?? 0}</strong> },
    { key: 'createdAt', header: 'Created', sortable: true, sortValue: (category) => new Date(category.createdAt), cell: (category) => <span className="whitespace-nowrap text-slate-600">{formatDateTime(category.createdAt)}</span> },
    { key: 'actions', header: '', cell: (category) => <Link href={`/dashboard/categories/${category.id}`} className="font-bold text-emerald-800">View products</Link> },
  ];

  return <>
    <PageHeader eyebrow="Inventory structure" title="Categories" description="Organize your rental catalog and open a category to see all of its products." action={user?.role === 'ADMIN' ? <button type="button" onClick={() => setDialogOpen(true)} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-900"><FolderPlus size={18}/>New category</button> : undefined}/>
    <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"><label className="relative min-w-0 flex-1"><span className="sr-only">Search categories</span><Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories…" className="focus-ring min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm placeholder:text-slate-400"/></label><p className="whitespace-nowrap px-2 text-sm font-semibold text-slate-500">{visible.length} {visible.length === 1 ? 'category' : 'categories'}</p></section>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <DataTable rows={visible} columns={columns} getRowId={(category) => category.id} loading={loading} emptyMessage={categories.length ? 'No categories match your search.' : 'No categories have been created yet.'}/>
    {dialogOpen && <CategoryCreateDialog onClose={() => setDialogOpen(false)} onCreated={load}/>} 
  </>;
}
