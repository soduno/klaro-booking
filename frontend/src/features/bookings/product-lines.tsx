import { Minus, Plus, Trash2 } from 'lucide-react';
import { useWatch, type Control, type FieldErrors, type UseFieldArrayAppend, type UseFieldArrayRemove, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import type { Product } from '@/types';
import type { BookingFormValues } from './booking.schema';
import { ProductAutocomplete } from './product-autocomplete';

type ProductLinesProps = {
  fields: Array<{ id: string }>;
  products: Product[];
  control: Control<BookingFormValues>;
  register: UseFormRegister<BookingFormValues>;
  setValue: UseFormSetValue<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
  append: UseFieldArrayAppend<BookingFormValues, 'items'>;
  remove: UseFieldArrayRemove;
};

export function ProductLines({ fields, products, control, register, setValue, errors, append, remove }: ProductLinesProps) {
  const items = useWatch({ control, name: 'items' });
  const selectedIds = items?.map((item) => item.productId).filter(Boolean) ?? [];

  return <fieldset className="grid gap-3">
    <div className="flex items-center justify-between gap-4"><legend className="text-sm font-semibold text-slate-700">Rental products</legend><button type="button" onClick={() => append({ productId: '', quantity: 1 })} className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-emerald-800"><Plus size={16}/>Add product</button></div>
    {fields.map((field, index) => {
      const selectedId = items?.[index]?.productId ?? '';
      const selectedProduct = products.find((product) => product.id === selectedId);
      const quantity = items?.[index]?.quantity ?? 1;
      const setQuantity = (value: number) => setValue(`items.${index}.quantity`, Math.max(1, Math.min(value, selectedProduct?.quantity ?? value)), { shouldDirty: true, shouldValidate: true });
      return <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[minmax(0,1fr)_152px_44px] sm:items-start">
        <input type="hidden" {...register(`items.${index}.productId`)}/>
        <ProductAutocomplete products={products} selectedId={selectedId} excludedIds={selectedIds.filter((id) => id !== selectedId)} index={index} error={errors.items?.[index]?.productId?.message} onSelect={(id) => { setValue(`items.${index}.productId`, id, { shouldDirty: true, shouldValidate: true }); const maximum = products.find((product) => product.id === id)?.quantity; if (maximum && quantity > maximum) setQuantity(maximum); }}/>
        <div className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700"><span>Quantity</span><div className={`flex h-11 min-w-0 overflow-hidden rounded-xl border bg-white ${errors.items?.[index]?.quantity ? 'border-red-400' : 'border-slate-300'}`}><button type="button" aria-label={`Decrease quantity ${index + 1}`} disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)} className="focus-ring grid w-10 shrink-0 place-items-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Minus size={15}/></button><input aria-label={`Quantity ${index + 1}`} type="number" min={1} max={selectedProduct?.quantity} className="min-w-0 flex-1 border-x border-slate-200 bg-white px-1 text-center font-bold text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" {...register(`items.${index}.quantity`, { valueAsNumber: true })}/><button type="button" aria-label={`Increase quantity ${index + 1}`} disabled={Boolean(selectedProduct && quantity >= selectedProduct.quantity)} onClick={() => setQuantity(quantity + 1)} className="focus-ring grid w-10 shrink-0 place-items-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Plus size={15}/></button></div>{selectedProduct && <span className="font-normal text-slate-400">Maximum {selectedProduct.quantity}</span>}{errors.items?.[index]?.quantity?.message && <span className="font-normal text-red-700">{errors.items[index].quantity.message}</span>}</div>
        <button type="button" aria-label={`Remove product ${index + 1}`} disabled={fields.length === 1} onClick={() => remove(index)} className="focus-ring mt-7 grid h-11 w-11 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30"><Trash2 size={18}/></button>
      </div>;
    })}
    {typeof errors.items?.message === 'string' && <span className="text-sm text-red-700">{errors.items.message}</span>}
  </fieldset>;
}
