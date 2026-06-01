export function ProductSpecifications({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata);
  if (!entries.length) return null;
  return <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm">{entries.map(([key,value])=><div key={key} className="min-w-0"><dt className="truncate capitalize text-xs font-semibold text-slate-400">{key.replaceAll('_',' ')}</dt><dd className="truncate font-semibold text-slate-700" title={String(value)}>{String(value)}</dd></div>)}</dl>;
}
