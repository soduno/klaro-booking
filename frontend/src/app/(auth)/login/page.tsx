'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AuthTitle } from '@/components/auth-title';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { api } from '@/lib/api';
import type { User } from '@/types';
const schema = z.object({ email: z.email('Enter a valid email'), password: z.string().min(1, 'Enter your password') });
type Values = z.infer<typeof schema>;
export default function LoginPage() {
  const router = useRouter(), [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: 'mail@simonduun.com', password: '1234' } });
  const submit = handleSubmit(async (values) => { try { setServerError(''); const result = await api<{user:User}>('/auth/login', { method: 'POST', body: JSON.stringify(values) }); toast.success('Welcome back'); router.push(result.user.organizationId ? '/dashboard' : '/onboarding/organization'); router.refresh(); } catch (error) { setServerError(error instanceof Error ? error.message : 'Unable to sign in'); } });
  return <><AuthTitle title="Welcome back" subtitle="Sign in to view and manage your bookings."/><form className="grid gap-5" onSubmit={submit}><p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"><strong>Temporary development login</strong><br/>The local account is prefilled for testing.</p><Field label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')}/><div><Field label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')}/><Link href="/forgot-password" className="mt-2 inline-block text-sm font-semibold text-emerald-800">Forgot password?</Link></div>{serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}<Button disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button></form><p className="mt-7 text-center text-sm text-slate-600">New here? <Link className="font-bold text-emerald-800" href="/register">Create an account</Link></p></>;
}
