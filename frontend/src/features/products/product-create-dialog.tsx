'use client';

import { useEffect, useState } from 'react';
import { PackagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, TextArea } from '@/components/ui/field';
import { MetadataFields } from './metadata-fields';
import { metadataFieldsToRecord, type MetadataField } from './product-metadata';
import { createProduct } from './products.api';
import type { Category } from '@/types';

const emptyForm = { sku: '', name: '', categoryId: '', description: '', quantity: 1 };
const initialFields = (): MetadataField[] => [{ id: crypto.randomUUID(), key: '', value: '' }];

export function ProductCreateDialog({ categories, onClose, onCreated }: { categories: Category[]; onClose: () => void; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState(emptyForm);
  const [fields, setFields] = useState<MetadataField[]>(initialFields);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createProduct({ ...form, quantity: Number(form.quantity), metadata: metadataFieldsToRecord(fields) });
      await onCreated();
      toast.success('Product added');
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create product');
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="add-product-title" className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-5 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><PackagePlus size={21}/></span><div><h2 id="add-product-title" className="text-xl font-black">Add rental product</h2><p className="mt-1 text-sm text-slate-500">Create a product and describe it with your own custom fields.</p></div></div>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Close dialog" className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={20}/></button>
      </header>
      <form onSubmit={submit}>
        <div className="grid max-h-[calc(100vh-13rem)] gap-6 overflow-y-auto px-5 py-6 sm:px-7">
          <section>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Product details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" placeholder="MacBook Pro 14”" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoFocus/>
              <Field label="SKU" placeholder="MBP-14-001" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} required/>
              <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>Category</span><select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required className="focus-ring min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal text-slate-950"><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{categories.length === 0 && <Link href="/dashboard/categories" className="font-normal text-emerald-800">Create a category first →</Link>}</label>
              <Field label="Total quantity" type="number" min={1} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} required/>
            </div>
            <div className="mt-4"><TextArea label="Description" placeholder="Add a short description of the product and its intended use…" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })}/></div>
          </section>
          <MetadataFields fields={fields} onChange={setFields}/>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}
        </div>
        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button type="button" onClick={onClose} disabled={saving} className="focus-ring min-h-11 rounded-xl px-5 font-semibold text-slate-600 hover:bg-slate-200/70">Cancel</button>
          <Button disabled={saving} className="gap-2"><PackagePlus size={18}/>{saving ? 'Adding product…' : 'Add product'}</Button>
        </footer>
      </form>
    </div>
  </div>;
}
