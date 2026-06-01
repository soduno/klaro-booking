'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { ArrowRight, CalendarCheck, CalendarClock, CalendarX, Plus, type LucideProps } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { Booking, Paginated, User } from '@/types';

type StatCard = { label: string; value: number; icon: ComponentType<LucideProps>; style: string };

export function OverviewView() {
  const [items, setItems] = useState<Booking[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { Promise.all([api<Paginated<Booking>>('/bookings?limit=100&sortBy=startTime&sortOrder=asc'), api<User>('/auth/me')]).then(([result, currentUser]) => { setItems(result.items); setUser(currentUser); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load')).finally(() => setLoading(false)); }, []);
  const now = useMemo(() => new Date(), []);
  const stats = useMemo(() => ({ total: items.length, upcoming: items.filter((booking) => new Date(booking.startTime) > now && booking.status !== 'CANCELLED').length, pending: items.filter((booking) => booking.status === 'PENDING').length, cancelled: items.filter((booking) => booking.status === 'CANCELLED').length }), [items, now]);
  const cards: StatCard[] = [
    { icon: CalendarCheck, label: 'Total', value: stats.total, style: 'bg-emerald-50 text-emerald-800' },
    { icon: CalendarClock, label: 'Upcoming', value: stats.upcoming, style: 'bg-blue-50 text-blue-800' },
    { icon: CalendarClock, label: 'Pending', value: stats.pending, style: 'bg-amber-50 text-amber-800' },
    { icon: CalendarX, label: 'Cancelled', value: stats.cancelled, style: 'bg-slate-100 text-slate-600' },
  ];
  const upcoming = items.filter((booking) => new Date(booking.startTime) > now && booking.status !== 'CANCELLED').slice(0, 5);
  return <><PageHeader eyebrow={user?.organization?.name ?? 'Rental workspace'} title="Rental overview" description="A clear view of your organization's upcoming product reservations and availability." action={<Link href="/dashboard/bookings/new" className="focus-ring flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white"><Plus size={18}/>New rental</Link>}/>{error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ icon: Icon, label, value, style }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className={`mb-6 inline-flex rounded-xl p-2.5 ${style}`}><Icon size={20}/></div><b className="block text-3xl">{loading ? '—' : value}</b><span className="text-sm text-slate-500">{label}</span></div>)}</section><section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold">Coming up</h2><p className="text-sm text-slate-500">The next product pickups</p></div><Link className="flex items-center gap-1 text-sm font-bold text-emerald-800" href="/dashboard/bookings">View all <ArrowRight size={16}/></Link></div>{!loading && upcoming.length === 0 ? <div className="p-12 text-center text-slate-500">No rentals are currently scheduled.</div> : <div className="divide-y divide-slate-100">{upcoming.map((booking) => <Link href={`/dashboard/bookings/${booking.id}`} key={booking.id} className="grid gap-2 p-5 hover:bg-slate-50 sm:grid-cols-[1fr_180px_110px] sm:items-center"><div><b>{booking.title}</b><span className="block truncate text-xs text-slate-500">{booking.items.map((item)=>`${item.quantity}× ${item.product.name}`).join(', ')}</span></div><span className="text-sm text-slate-600">{formatDateTime(booking.startTime)}</span><StatusBadge status={booking.status}/></Link>)}</div>}</section></>;
}
