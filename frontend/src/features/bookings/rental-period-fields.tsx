'use client';

import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react';
import { useWatch, type Control, type FieldErrors, type UseFormSetValue } from 'react-hook-form';
import type { BookingFormValues } from './booking.schema';

const toLocalValue = (date: Date) => {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
};

export const splitDateTime = (value: string) => ({ date: value.slice(0, 10), time: value.slice(11, 16) });
export const combineDateTime = (date: string, time: string, fallbackTime: string) => date ? `${date}T${time || fallbackTime}` : '';
export const addRentalDays = (value: string, days: number) => { const date = new Date(value); date.setDate(date.getDate() + days); return toLocalValue(date); };

const formatSelection = (value: string) => value ? new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'Not selected';
const formatDuration = (start: string, end: string) => {
  const milliseconds = new Date(end).getTime() - new Date(start).getTime();
  if (!start || !end || milliseconds <= 0) return 'Select a valid period';
  const hours = Math.round(milliseconds / 3_600_000);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.round(hours / 24 * 10) / 10;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

type Props = { control: Control<BookingFormValues>; setValue: UseFormSetValue<BookingFormValues>; errors: FieldErrors<BookingFormValues>; earliestStart?: string };

export function RentalPeriodFields({ control, setValue, errors, earliestStart }: Props) {
  const start = useWatch({ control, name: 'startTime' }) ?? '';
  const end = useWatch({ control, name: 'endTime' }) ?? '';
  const startParts = splitDateTime(start);
  const endParts = splitDateTime(end);
  const earliestParts = splitDateTime(earliestStart ?? '');
  const setField = (field: 'startTime' | 'endTime', value: string) => setValue(field, value, { shouldDirty: true, shouldValidate: true });

  const updateStart = (value: string) => {
    setField('startTime', value);
    if (value && (!end || new Date(end) <= new Date(value))) setField('endTime', addRentalDays(value, 1));
  };

  return <fieldset className="grid gap-4">
    <div><legend className="font-bold text-slate-900">Rental period</legend><p className="mt-1 text-sm text-slate-500">Choose separate dates and times for pickup and return.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <section className={`rounded-2xl border p-4 ${errors.startTime ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="mb-4 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><CalendarDays size={18}/></span><div><strong className="block">Pickup</strong><span className="text-xs text-slate-500">Rental begins</span></div></div>
        <div className="grid gap-3 min-[480px]:grid-cols-[minmax(0,1fr)_120px] sm:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_120px]">
          <label className="grid min-w-0 gap-1.5 text-xs font-bold text-slate-500"><span>Date</span><input aria-label="Pickup date" type="date" min={earliestParts.date || undefined} value={startParts.date} onChange={(event) => updateStart(combineDateTime(event.target.value, startParts.time, '09:00'))} className="focus-ring min-h-11 min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900"/></label>
          <label className="grid min-w-0 gap-1.5 text-xs font-bold text-slate-500"><span>Time</span><span className="relative"><Clock3 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/><input aria-label="Pickup time" type="time" min={startParts.date === earliestParts.date ? earliestParts.time : undefined} value={startParts.time} onChange={(event) => updateStart(combineDateTime(startParts.date, event.target.value, '09:00'))} className="focus-ring min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white pl-9 pr-2 text-sm font-semibold text-slate-900"/></span></label>
        </div>
        {errors.startTime?.message && <p className="mt-2 text-sm text-red-700">{errors.startTime.message}</p>}
      </section>
      <section className={`rounded-2xl border p-4 ${errors.endTime ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="mb-4 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 text-blue-800"><CalendarDays size={18}/></span><div><strong className="block">Return</strong><span className="text-xs text-slate-500">Rental ends</span></div></div>
        <div className="grid gap-3 min-[480px]:grid-cols-[minmax(0,1fr)_120px] sm:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_120px]">
          <label className="grid min-w-0 gap-1.5 text-xs font-bold text-slate-500"><span>Date</span><input aria-label="Return date" type="date" min={startParts.date || earliestParts.date || undefined} value={endParts.date} onChange={(event) => setField('endTime', combineDateTime(event.target.value, endParts.time, '17:00'))} className="focus-ring min-h-11 min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900"/></label>
          <label className="grid min-w-0 gap-1.5 text-xs font-bold text-slate-500"><span>Time</span><span className="relative"><Clock3 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/><input aria-label="Return time" type="time" min={endParts.date === startParts.date ? startParts.time : undefined} value={endParts.time} onChange={(event) => setField('endTime', combineDateTime(endParts.date, event.target.value, '17:00'))} className="focus-ring min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white pl-9 pr-2 text-sm font-semibold text-slate-900"/></span></label>
        </div>
        {errors.endTime?.message && <p className="mt-2 text-sm text-red-700">{errors.endTime.message}</p>}
      </section>
    </div>
    {start && <div className="flex flex-col gap-3 rounded-2xl bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-2 text-sm text-emerald-950"><strong>{formatSelection(start)}</strong><ArrowRight size={15}/><strong>{formatSelection(end)}</strong><span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-emerald-800">{formatDuration(start, end)}</span></div><div className="flex items-center gap-1"><span className="mr-1 text-xs font-semibold text-emerald-800">Quick return:</span>{[1, 3, 7].map((days) => <button key={days} type="button" onClick={() => setField('endTime', addRentalDays(start, days))} className="focus-ring rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100">{days === 7 ? '1 week' : `${days} ${days === 1 ? 'day' : 'days'}`}</button>)}</div></div>}
  </fieldset>;
}
