'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ProductsTable } from '@/features/products/products-table';
import type { Category } from '@/types';
import { getCategory } from './categories.api';

export function CategoryDetail({ id }: { id: string }) {
  const [category, setCategory] = useState<(Category & { products: NonNullable<Category['products']> }) | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getCategory(id).then(setCategory).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load category')); }, [id]);
  if (error) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!category) return <div className="h-72 animate-pulse rounded-2xl bg-white"/>;
  return <><PageHeader eyebrow="Category" title={category.name} description={category.description || `${category.products.length} products in this category.`} action={<Link href="/dashboard/categories" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-700"><ArrowLeft size={17}/>All categories</Link>}/><ProductsTable products={category.products} showCategory={false} emptyMessage="No products have been assigned to this category yet."/></>;
}
