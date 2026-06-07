import { api } from '@/lib/api';
import type { Customer } from '@/types';

export type CreateCustomerInput = { name: string; registrationNumber?: string; contactName?: string; email?: string; phone?: string; address?: string };

export function getCustomers(search = '') {
  const params = new URLSearchParams({ limit: '20' });
  if (search.trim()) params.set('search', search.trim());
  return api<Customer[]>(`/customers?${params}`);
}

export function createCustomer(input: CreateCustomerInput) {
  return api<Customer>('/customers', { method: 'POST', body: JSON.stringify(input) });
}
