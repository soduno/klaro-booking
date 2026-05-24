'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc';
export type TableSort = { key: string; direction: SortDirection };
export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  className?: string;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyMessage: string;
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  footer?: ReactNode;
};

const compare = (left: unknown, right: unknown) => {
  const a = left instanceof Date ? left.getTime() : left;
  const b = right instanceof Date ? right.getTime() : right;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
};

export function DataTable<T>({ rows, columns, getRowId, loading = false, emptyMessage, sort, onSortChange, footer }: DataTableProps<T>) {
  const firstSortable = columns.find((column) => column.sortable && column.sortValue);
  const [internalSort, setInternalSort] = useState<TableSort | undefined>(firstSortable ? { key: firstSortable.key, direction: 'asc' } : undefined);
  const activeSort = sort ?? internalSort;
  const visibleRows = useMemo(() => {
    if (onSortChange || !activeSort) return rows;
    const column = columns.find((candidate) => candidate.key === activeSort.key);
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => compare(column.sortValue?.(a), column.sortValue?.(b)) * (activeSort.direction === 'asc' ? 1 : -1));
  }, [activeSort, columns, onSortChange, rows]);

  const changeSort = (key: string) => {
    const next: TableSort = { key, direction: activeSort?.key === key && activeSort.direction === 'asc' ? 'desc' : 'asc' };
    if (onSortChange) onSortChange(next); else setInternalSort(next);
  };

  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{columns.map((column) => {
          const sortable = column.sortable && (column.sortValue || onSortChange);
          const selected = activeSort?.key === column.key;
          const Icon = selected ? activeSort.direction === 'asc' ? ArrowUp : ArrowDown : ArrowUpDown;
          return <th key={column.key} className={`px-5 py-4 font-bold ${column.className ?? ''}`}>{sortable ? <button type="button" onClick={() => changeSort(column.key)} className="focus-ring -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-slate-200/70" aria-label={`Sort by ${column.header}`}>{column.header}<Icon size={14}/></button> : column.header}</th>;
        })}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? Array.from({ length: 5 }, (_, index) => <tr key={index}><td colSpan={columns.length} className="p-5"><div className="h-6 animate-pulse rounded bg-slate-100"/></td></tr>) : visibleRows.length ? visibleRows.map((row) => <tr key={getRowId(row)} className="transition hover:bg-slate-50">{columns.map((column) => <td key={column.key} className={`px-5 py-4 align-middle ${column.className ?? ''}`}>{column.cell(row)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-14 text-center text-slate-500">{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
    {footer && <footer className="border-t border-slate-100 p-4">{footer}</footer>}
  </section>;
}
