import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable, type DataTableColumn, type TableSort } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/format';
import type { Booking, Paginated } from '@/types';

export function BookingsTable({ data, loading, page, sortBy, sortOrder, onPageChange, onSortChange }: { data: Paginated<Booking> | null; loading: boolean; page: number; sortBy: string; sortOrder: 'asc' | 'desc'; onPageChange: (page: number) => void; onSortChange: (sort: TableSort) => void }) {
  const columns: DataTableColumn<Booking>[] = [
    { key: 'title', header: 'Booking', sortable: true, cell: (booking) => <Link href={`/dashboard/bookings/${booking.id}`} className="block max-w-56 truncate font-bold text-slate-900 hover:text-emerald-800 hover:underline">{booking.title}</Link> },
    { key: 'customer', header: 'Company', cell: (booking) => <span className="block max-w-56 truncate font-semibold text-slate-700" title={booking.customer.name}>{booking.customer.name}</span> },
    { key: 'products', header: 'Products', cell: (booking) => <span className="block max-w-72 truncate text-slate-600" title={booking.items.map((item) => `${item.quantity}× ${item.product.name}`).join(', ')}>{booking.items.map((item) => `${item.quantity}× ${item.product.name}`).join(', ') || 'No products'}</span> },
    { key: 'startTime', header: 'Start', sortable: true, cell: (booking) => <span className="whitespace-nowrap text-slate-600">{formatDateTime(booking.startTime)}</span> },
    { key: 'endTime', header: 'End', sortable: true, cell: (booking) => <span className="whitespace-nowrap text-slate-600">{formatDateTime(booking.endTime)}</span> },
    { key: 'status', header: 'Status', sortable: true, cell: (booking) => <StatusBadge status={booking.status}/> },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (booking) => <span className="whitespace-nowrap text-slate-600">{formatDateTime(booking.createdAt)}</span> },
    { key: 'actions', header: '', cell: (booking) => <Link className="font-bold text-emerald-800" href={`/dashboard/bookings/${booking.id}`}>View</Link> },
  ];
  const footer = <div className="flex items-center justify-between text-sm text-slate-600"><span>{data?.meta.total ?? 0} bookings</span><div className="flex items-center gap-2"><button aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="focus-ring rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft size={18}/></button><span>Page {page} of {Math.max(data?.meta.pages ?? 1, 1)}</span><button aria-label="Next page" disabled={page >= (data?.meta.pages ?? 1)} onClick={() => onPageChange(page + 1)} className="focus-ring rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight size={18}/></button></div></div>;
  return <DataTable rows={data?.items ?? []} columns={columns} getRowId={(booking) => booking.id} loading={loading} emptyMessage="No bookings match these filters." sort={{ key: sortBy, direction: sortOrder }} onSortChange={onSortChange} footer={footer}/>;
}
