import { api } from '@/lib/api';
import type { Category } from '@/types';

export const getCategories = () => api<Category[]>('/categories');
export const getCategory = (id: string) => api<Category & { products: NonNullable<Category['products']> }>(`/categories/${id}`);
export const createCategory = (input: { name: string; description?: string }) => api<Category>('/categories', { method: 'POST', body: JSON.stringify(input) });
