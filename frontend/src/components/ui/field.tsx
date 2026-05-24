import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
export function Field({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span><input className="focus-ring min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 font-normal text-slate-950 placeholder:text-slate-400" {...props} />{error && <span className="font-normal text-red-700">{error}</span>}</label>;
}
export function TextArea({ label, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span><textarea className="focus-ring min-h-28 rounded-xl border border-slate-300 bg-white p-3.5 font-normal text-slate-950" {...props} />{error && <span className="font-normal text-red-700">{error}</span>}</label>;
}
