'use client';
import Link from 'next/link'; import { Plus } from 'lucide-react'; import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/page-header'; import { BookingFilters } from './booking-filters'; import { BookingsTable } from './bookings-table'; import { useBookings } from './use-bookings';

export function BookingsView() {
  const [page,setPage]=useState(1),[status,setStatus]=useState(''),[search,setSearch]=useState(''),[query,setQuery]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[sortBy,setSortBy]=useState('startTime'),[sortOrder,setSortOrder]=useState('asc');
  const filters=useMemo(()=>({ page, status, search: query, from, to, sortBy, sortOrder }),[page,status,query,from,to,sortBy,sortOrder]);
  const { data, loading, error } = useBookings(filters);
  const resetPage = (setter: (value:string)=>void) => (value:string) => { setPage(1); setter(value); };
  return <><PageHeader eyebrow="Schedule" title="Bookings" description="Search, filter, sort, and manage every booking." action={<Link href="/dashboard/bookings/new" className="focus-ring flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white"><Plus size={18}/>New booking</Link>}/><BookingFilters search={search} status={status} from={from} to={to} onSearchChange={setSearch} onSearch={()=>{setPage(1);setQuery(search)}} onStatusChange={resetPage(setStatus)} onFromChange={resetPage(setFrom)} onToChange={resetPage(setTo)}/>{error&&<p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<BookingsTable data={data} loading={loading} page={page} sortBy={sortBy} sortOrder={sortOrder as 'asc' | 'desc'} onPageChange={setPage} onSortChange={(sort)=>{setPage(1);setSortBy(sort.key);setSortOrder(sort.direction)}}/></>;
}
