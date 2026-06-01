import { Plus, Trash2 } from 'lucide-react';
import type { MetadataField } from './product-metadata';

export function MetadataFields({ fields, onChange }: { fields: MetadataField[]; onChange: (fields: MetadataField[]) => void }) {
  const update = (id: string, patch: Partial<MetadataField>) => onChange(fields.map((field) => field.id === id ? { ...field, ...patch } : field));
  const add = () => onChange([...fields, { id: crypto.randomUUID(), key: '', value: '' }]);
  const remove = (id: string) => onChange(fields.filter((field) => field.id !== id));

  return <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
    <legend className="px-1 text-sm font-bold text-slate-900">Custom specifications</legend>
    <p className="mb-4 text-sm leading-6 text-slate-500">Add any information that matters for this product, such as serial number, RAM, color, mileage or screen size.</p>
    <div className="grid gap-3">
      {fields.map((field, index) => <div key={field.id} className="grid gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_44px] sm:items-end">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{index === 0 ? 'Field name' : <span className="sr-only">Field name</span>}</span><input aria-label={`Specification ${index + 1} name`} value={field.key} onChange={(event) => update(field.id, { key: event.target.value })} placeholder="e.g. RAM" className="focus-ring min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal text-slate-950 placeholder:text-slate-400"/></label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{index === 0 ? 'Value' : <span className="sr-only">Value</span>}</span><input aria-label={`Specification ${index + 1} value`} value={field.value} onChange={(event) => update(field.id, { value: event.target.value })} placeholder="e.g. 32 GB" className="focus-ring min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal text-slate-950 placeholder:text-slate-400"/></label>
        <button type="button" onClick={() => remove(field.id)} aria-label={`Remove specification ${index + 1}`} className="focus-ring grid h-11 w-11 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-700"><Trash2 size={18}/></button>
      </div>)}
    </div>
    <button type="button" onClick={add} className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"><Plus size={16}/>Add specification</button>
  </fieldset>;
}
