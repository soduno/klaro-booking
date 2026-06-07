'use client';

import { useEffect, useId, useState } from 'react';
import { Building2, Check, ChevronRight, LoaderCircle, Plus, Search, X } from 'lucide-react';
import type { Customer } from '@/types';
import { createCustomer, getCustomers, type CreateCustomerInput } from './customers.api';

const emptyCustomer: CreateCustomerInput = { name: '', registrationNumber: '', contactName: '', email: '', phone: '', address: '' };

function CustomerResult({ customer, onSelect }: { customer: Customer; onSelect: (customer: Customer) => void }) {
  return <button type="button" onClick={() => onSelect(customer)} className="focus-ring flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Building2 size={20}/></span>
    <span className="min-w-0 flex-1"><span className="block truncate font-bold text-slate-900">{customer.name}</span><span className="block truncate text-sm text-slate-500">{[customer.registrationNumber && `CVR ${customer.registrationNumber}`, customer.contactName, customer.email].filter(Boolean).join(' · ') || 'No additional company details'}</span></span>
    <ChevronRight className="shrink-0 text-slate-400" size={19}/>
  </button>;
}

export function CustomerFinder({ selected, error, onSelect }: { selected?: Customer; error?: string; onSelect: (customer: Customer) => void }) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [draft, setDraft] = useState<CreateCustomerInput>(emptyCustomer);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      getCustomers(query).then(setCustomers).catch((reason: unknown) => setRequestError(reason instanceof Error ? reason.message : 'Unable to load companies')).finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const updateDraft = (key: keyof CreateCustomerInput, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const saveCustomer = async () => {
    if (draft.name.trim().length < 2) { setRequestError('Enter a company name'); return; }
    setSaving(true); setRequestError('');
    try {
      const payload = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value?.trim()]).filter(([, value]) => value)) as CreateCustomerInput;
      const customer = await createCustomer(payload);
      setCustomers((current) => [customer, ...current]);
      setDraft(emptyCustomer); setCreating(false); onSelect(customer);
    } catch (reason) { setRequestError(reason instanceof Error ? reason.message : 'Unable to create company'); }
    finally { setSaving(false); }
  };

  if (selected) return <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
    <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-emerald-800 shadow-sm"><Check size={22}/></span><div className="min-w-0 flex-1"><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Selected company</span><h2 className="mt-1 text-xl font-bold text-slate-950">{selected.name}</h2><p className="mt-1 text-sm text-slate-600">{[selected.registrationNumber && `CVR ${selected.registrationNumber}`, selected.contactName, selected.email, selected.phone].filter(Boolean).join(' · ') || 'No additional company details'}</p></div><button type="button" onClick={() => onSelect({ ...selected, id: '' })} className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-white" aria-label="Choose another company"><X size={19}/></button></div>
  </section>;

  return <div className="grid gap-5">
    <div className="grid gap-2"><label htmlFor={searchId} className="text-sm font-semibold text-slate-700">Find a company</label><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19}/><input id={searchId} autoFocus autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company name, CVR or contact…" className="focus-ring h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-slate-950 placeholder:text-slate-400"/></div><span className="text-xs text-slate-500">Searches only companies saved in your workspace.</span></div>
    {error && <p className="text-sm text-red-700">{error}</p>}
    {requestError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{requestError}</p>}
    <div className="grid gap-2">{loading ? <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-8 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18}/>Searching companies…</div> : customers.length ? customers.map((customer) => <CustomerResult key={customer.id} customer={customer} onSelect={onSelect}/>) : <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center"><Building2 className="mx-auto text-slate-400"/><p className="mt-2 font-bold">No companies found</p><p className="mt-1 text-sm text-slate-500">Create the company and continue with the booking.</p></div>}</div>
    {!creating ? <button type="button" onClick={() => { setCreating(true); setDraft((current) => ({ ...current, name: query })); }} className="focus-ring flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 font-bold text-emerald-800 hover:bg-emerald-50"><Plus size={18}/>Create new company</button> : <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">New company</h2><p className="text-sm text-slate-500">Only the company name is required.</p></div><button type="button" onClick={() => setCreating(false)} className="focus-ring rounded-lg p-2 text-slate-500"><X size={18}/></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">Company name<input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} className="focus-ring h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal"/></label><label className="grid gap-2 text-sm font-semibold text-slate-700">CVR number<input value={draft.registrationNumber} onChange={(event) => updateDraft('registrationNumber', event.target.value)} className="focus-ring h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal"/></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Contact person<input value={draft.contactName} onChange={(event) => updateDraft('contactName', event.target.value)} className="focus-ring h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal"/></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Email<input type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} className="focus-ring h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal"/></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Phone<input value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} className="focus-ring h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal"/></label><label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">Address<input value={draft.address} onChange={(event) => updateDraft('address', event.target.value)} className="focus-ring h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal"/></label></div><button type="button" disabled={saving} onClick={saveCustomer} className="focus-ring mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 font-bold text-white disabled:opacity-50">{saving && <LoaderCircle className="animate-spin" size={18}/>}Create and select company</button></section>}
  </div>;
}
