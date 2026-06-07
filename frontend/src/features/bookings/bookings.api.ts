import { api } from '@/lib/api';
import type { Booking, Paginated } from '@/types';

export type BookingFilters = { page: number; status: string; search: string; from: string; to: string; sortBy: string; sortOrder: string };
export function getBookings(filters: BookingFilters) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '10', sortBy: 'startTime', sortOrder: 'asc' });
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  if (filters.from) params.set('from', new Date(`${filters.from}T00:00:00`).toISOString());
  if (filters.to) params.set('to', new Date(`${filters.to}T23:59:59.999`).toISOString());
  params.set('sortBy', filters.sortBy);
  params.set('sortOrder', filters.sortOrder);
  return api<Paginated<Booking>>(`/bookings?${params}`);
}
export const getBooking = (id: string) => api<Booking>(`/bookings/${id}`);
export const cancelBooking = (id: string) => api<Booking>(`/bookings/${id}/cancel`, { method: 'PATCH' });
