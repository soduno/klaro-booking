import { api } from '@/lib/api';
import type { Product } from '@/types';
export type CreateProductInput = Pick<Product, 'sku' | 'name' | 'categoryId' | 'description' | 'metadata' | 'quantity'>;
export const getProducts = (includeInactive = false) => api<Product[]>(`/products${includeInactive ? '?includeInactive=true' : ''}`);
export const createProduct = (input: CreateProductInput) => api<Product>('/products', { method: 'POST', body: JSON.stringify(input) });
export const updateProduct = (id: string, input: Partial<Pick<Product, 'sku' | 'name' | 'categoryId' | 'description' | 'metadata' | 'quantity' | 'isActive'>>) => api<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
