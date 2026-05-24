'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { AuthTitle } from '@/components/auth-title';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { api } from '@/lib/api';
import type { User } from '@/types';

export default function OrganizationOnboardingPage() {
  const router=useRouter(),[name,setName]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false);
  useEffect(()=>{api<User>('/auth/me').then((user)=>{if(user.organizationId)router.replace('/dashboard')}).catch(()=>router.replace('/login'))},[router]);
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setSaving(true);setError('');try{await api('/organizations',{method:'POST',body:JSON.stringify({name})});await api('/auth/refresh',{method:'POST'});router.replace('/dashboard');router.refresh()}catch(reason){setError(reason instanceof Error?reason.message:'Unable to create organization');setSaving(false)}};
  return <><div className="mb-7 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-800"><Building2 size={26}/></div><AuthTitle title="Create your organization" subtitle="Your products, users, and rental bookings will stay securely separated inside this workspace."/><form onSubmit={submit} className="grid gap-5"><Field label="Organization name" placeholder="e.g. Northline Rentals" value={name} onChange={(event)=>setName(event.target.value)} minLength={2} maxLength={120} required autoFocus/>{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button disabled={saving||name.trim().length<2}>{saving?'Creating workspace…':'Create organization'}</Button></form></>;
}
