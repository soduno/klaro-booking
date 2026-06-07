'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Building2, Check, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Field, TextArea } from './ui/field';
import { api } from '@/lib/api';
import type { Booking, Customer, Product } from '@/types';
import { bookingSchema, type BookingFormValues } from '@/features/bookings/booking.schema';
import { ProductLines } from '@/features/bookings/product-lines';
import { RentalPeriodFields } from '@/features/bookings/rental-period-fields';
import { CustomerFinder } from '@/features/customers/customer-finder';
import { getProducts } from '@/features/products/products.api';

const localValue = (value: string) => { const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); };

function BookingSteps({ current }: { current: 1 | 2 }) {
  return <ol aria-label="Booking steps" className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-slate-200 px-6 py-5 sm:px-8">
    <li className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-full font-bold ${current === 1 ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'}`}>{current > 1 ? <Check size={18}/> : '1'}</span><span><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Step 1</span><span className="hidden font-bold text-slate-900 sm:block">Company</span></span></li>
    <span className={`h-px w-8 sm:w-20 ${current > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}/>
    <li className="flex items-center justify-end gap-3"><span className={`grid h-9 w-9 place-items-center rounded-full font-bold ${current === 2 ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span><span><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Step 2</span><span className="hidden font-bold text-slate-900 sm:block">Booking details</span></span></li>
  </ol>;
}

export function BookingForm({ booking }: { booking?: Booking }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(booking?.customer);
  const [serverError, setServerError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: booking ? { customerId: booking.customerId, title: booking.title, description: booking.description ?? '', startTime: localValue(booking.startTime), endTime: localValue(booking.endTime), items: booking.items.map((item) => ({ productId: item.productId, quantity: item.quantity })) } : { customerId: '', title: '', description: '', startTime: '', endTime: '', items: [{ productId: '', quantity: 1 }] },
  });
  const lines = useFieldArray({ control: form.control, name: 'items' });
  const earliestStart = booking ? undefined : localValue(new Date().toISOString());

  useEffect(() => { getProducts().then(setProducts).catch((error: unknown) => setServerError(error instanceof Error ? error.message : 'Unable to load products')); }, []);

  const chooseCustomer = (customer: Customer) => {
    const next = customer.id ? customer : undefined;
    setSelectedCustomer(next);
    form.setValue('customerId', next?.id ?? '', { shouldDirty: true, shouldValidate: true });
  };

  const continueToDetails = async () => {
    if (await form.trigger('customerId')) { setStep(2); setServerError(''); }
  };

  const submit = form.handleSubmit(async (values) => {
    if (!booking && new Date(values.startTime) <= new Date()) {
      form.setError('startTime', { type: 'validate', message: 'Choose a future start time. The selected time has already passed.' });
      return;
    }
    try {
      setServerError('');
      const body = { ...values, startTime: new Date(values.startTime).toISOString(), endTime: new Date(values.endTime).toISOString() };
      const result = await api<Booking>(booking ? `/bookings/${booking.id}` : '/bookings', { method: booking ? 'PATCH' : 'POST', body: JSON.stringify(body) });
      toast.success(booking ? 'Rental booking updated' : 'Rental booking created');
      router.push(`/dashboard/bookings/${result.id}`); router.refresh();
    } catch (error) { setServerError(error instanceof Error ? error.message : 'Unable to save booking'); }
  });

  return <form className="max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white" onSubmit={submit}>
    <BookingSteps current={step}/>
    {step === 1 ? <section className="grid gap-6 p-6 sm:p-8">
      <header><div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Building2 size={21}/></div><h2 className="text-2xl font-bold text-slate-950">Who is renting?</h2><p className="mt-1 text-slate-600">Find an existing company or create a new one without leaving the booking.</p></header>
      <input type="hidden" {...form.register('customerId')}/>
      <CustomerFinder selected={selectedCustomer} error={form.formState.errors.customerId?.message} onSelect={chooseCustomer}/>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between"><button type="button" onClick={() => router.back()} className="focus-ring min-h-11 rounded-xl border border-slate-300 px-5 font-semibold">Cancel</button><Button type="button" disabled={!selectedCustomer} onClick={continueToDetails} className="gap-2">Continue to booking details<ArrowRight size={18}/></Button></div>
    </section> : <section className="grid gap-6 p-6 sm:p-8">
      <header><div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><ClipboardList size={21}/></div><h2 className="text-2xl font-bold text-slate-950">Booking details</h2><p className="mt-1 text-slate-600">Choose the rental period, products, and quantities.</p></header>
      {selectedCustomer && <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><Building2 className="shrink-0 text-emerald-800" size={20}/><div className="min-w-0 flex-1"><span className="block text-xs font-bold uppercase tracking-wider text-emerald-700">Company</span><strong className="block truncate">{selectedCustomer.name}</strong></div><button type="button" onClick={() => setStep(1)} className="focus-ring rounded-lg px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-white">Change</button></div>}
      <Field label="Booking name" placeholder="e.g. Copenhagen client shoot" error={form.formState.errors.title?.message} {...form.register('title')}/>
      <TextArea label="Notes (optional)" placeholder="Delivery, pickup, or project details…" error={form.formState.errors.description?.message} {...form.register('description')}/>
      <input type="hidden" {...form.register('startTime')}/><input type="hidden" {...form.register('endTime')}/>
      <RentalPeriodFields control={form.control} setValue={form.setValue} errors={form.formState.errors} earliestStart={earliestStart}/>
      <ProductLines fields={lines.fields} products={products} control={form.control} register={form.register} setValue={form.setValue} errors={form.formState.errors} append={lines.append} remove={lines.remove}/>
      {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between"><button type="button" onClick={() => setStep(1)} className="focus-ring flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 font-semibold"><ArrowLeft size={18}/>Back</button><Button disabled={form.formState.isSubmitting || products.length === 0}>{form.formState.isSubmitting ? 'Checking availability…' : booking ? 'Save changes' : 'Book products'}</Button></div>
    </section>}
  </form>;
}
