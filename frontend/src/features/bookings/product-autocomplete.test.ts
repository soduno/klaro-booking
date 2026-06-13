import { describe, expect, it } from 'vitest';
import type { Product } from '@/types';
import { filterProducts } from './product-autocomplete';

const product = (id: string, name: string, sku: string, category: string): Product => ({ id, name, sku, categoryId: `${id}-category`, category: { id: `${id}-category`, name: category, slug: category.toLowerCase(), createdAt: '', updatedAt: '' }, quantity: 1, isActive: true, metadata: {}, createdAt: '', updatedAt: '' });
const products = [product('1', 'MacBook Pro', 'MBP-001', 'Notebooks'), product('2', 'Volvo XC40', 'CAR-042', 'Cars')];

describe('product autocomplete filtering', () => {
  it('matches name, SKU and category', () => {
    expect(filterProducts(products, 'mac').map(({ id }) => id)).toEqual(['1']);
    expect(filterProducts(products, 'CAR-042').map(({ id }) => id)).toEqual(['2']);
    expect(filterProducts(products, 'notebook').map(({ id }) => id)).toEqual(['1']);
  });

  it('excludes products selected on another line', () => {
    expect(filterProducts(products, '', ['1']).map(({ id }) => id)).toEqual(['2']);
  });
});
