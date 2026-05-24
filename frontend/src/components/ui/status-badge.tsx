import type { BookingStatus } from '@/types';
const styles: Record<BookingStatus, string> = { PENDING: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-slate-200 text-slate-600' };
export function StatusBadge({ status }: { status: BookingStatus }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${styles[status]}`}>{status.toLowerCase()}</span>; }
