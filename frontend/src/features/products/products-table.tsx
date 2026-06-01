import Link from 'next/link';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { formatDateTime } from '@/lib/format';
import type { Product } from '@/types';

export function ProductsTable({ products, loading = false, showCategory = true, emptyMessage = 'No products match these filters.' }: { products: Product[]; loading?: boolean; showCategory?: boolean; emptyMessage?: string }) {
  const columns: DataTableColumn<Product>[] = [
    { key: 'name', header: 'Product', sortable: true, sortValue: (product) => product.name, cell: (product) => <div><strong className="block text-slate-900">{product.name}</strong>{product.description && <span className="block max-w-72 truncate text-xs text-slate-500">{product.description}</span>}</div> },
    { key: 'sku', header: 'SKU', sortable: true, sortValue: (product) => product.sku, cell: (product) => <span className="font-mono text-xs font-semibold text-slate-600">{product.sku}</span> },
    ...(showCategory ? [{ key: 'category', header: 'Category', sortable: true, sortValue: (product: Product) => product.category.name, cell: (product: Product) => <Link href={`/dashboard/categories/${product.categoryId}`} className="font-semibold text-emerald-800 hover:underline">{product.category.name}</Link> } satisfies DataTableColumn<Product>] : []),
    { key: 'quantity', header: 'Quantity', sortable: true, sortValue: (product) => product.quantity, cell: (product) => <strong>{product.quantity}</strong> },
    { key: 'specifications', header: 'Specifications', sortValue: (product) => Object.keys(product.metadata).length, sortable: true, cell: (product) => { const entries = Object.entries(product.metadata); return <span className="block max-w-72 truncate text-slate-600" title={entries.map(([key, value]) => `${key}: ${String(value)}`).join(', ')}>{entries.length ? entries.slice(0, 2).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') : '—'}</span>; } },
    { key: 'status', header: 'Status', sortable: true, sortValue: (product) => product.isActive ? 1 : 0, cell: (product) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{product.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'updatedAt', header: 'Updated', sortable: true, sortValue: (product) => new Date(product.updatedAt), cell: (product) => <span className="whitespace-nowrap text-slate-600">{formatDateTime(product.updatedAt)}</span> },
  ];
  return <DataTable rows={products} columns={columns} getRowId={(product) => product.id} loading={loading} emptyMessage={emptyMessage}/>;
}
