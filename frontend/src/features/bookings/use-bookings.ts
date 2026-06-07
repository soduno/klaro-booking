'use client';
import { useEffect, useState } from 'react';
import { getBookings, type BookingFilters } from './bookings.api';
import type { Paginated, Booking } from '@/types';

export function useBookings(filters: BookingFilters) {
  const [data, setData] = useState<Paginated<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { page, search, status, from, to, sortBy, sortOrder } = filters;
  useEffect(() => {
    let active = true;
    getBookings({ page, search, status, from, to, sortBy, sortOrder }).then((value) => active && setData(value)).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Unable to load bookings')).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, search, status, from, to, sortBy, sortOrder]);
  return { data, loading, error };
}
