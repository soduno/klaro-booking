'use client';

import { useEffect, useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextArea } from '@/components/ui/field';
import { createCategory } from './categories.api';

export function CategoryCreateDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      await createCategory({ name, description });
      await onCreated();
      toast.success('Category created');
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create category');
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="add-category-title" className="mx-auto mt-12 w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-5 border-b border-slate-100 px-6 py-5"><div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><FolderPlus size={21}/></span><div><h2 id="add-category-title" className="text-xl font-black">Create category</h2><p className="mt-1 text-sm text-slate-500">Group related rental products in your inventory.</p></div></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close dialog" className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={20}/></button></header>
      <form onSubmit={submit}><div className="grid gap-5 px-6 py-6"><Field label="Category name" placeholder="e.g. Cameras" value={name} onChange={(event) => setName(event.target.value)} required autoFocus/><TextArea label="Description (optional)" placeholder="What kind of products belong in this category?" value={description} onChange={(event) => setDescription(event.target.value)}/>{error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}</div><footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4"><button type="button" onClick={onClose} disabled={saving} className="focus-ring min-h-11 rounded-xl px-5 font-semibold text-slate-600 hover:bg-slate-200/70">Cancel</button><Button disabled={saving} className="gap-2"><FolderPlus size={18}/>{saving ? 'Creating…' : 'Create category'}</Button></footer></form>
    </div>
  </div>;
}
