'use client';

import { useEffect, useState } from 'react';
import { Building2, Crown, Fingerprint, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import type { Organization, User } from '@/types';
import { getCurrentOrganization, getCurrentUser, getOrganizationMembers } from './organizations.api';

type WorkspaceState = { organization: Organization; currentUser: User; members: User[] };

function initials(member: User) {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}

export function OrganizationWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCurrentOrganization(), getCurrentUser()])
      .then(async ([organization, currentUser]) => {
        const members = currentUser.role === 'ADMIN' ? await getOrganizationMembers() : [currentUser];
        setWorkspace({ organization, currentUser, members });
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load the organization'));
  }, []);

  if (error) return <><PageHeader title="Organization" description="Manage your rental workspace."/><p role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">{error}</p></>;
  if (!workspace) return <><PageHeader title="Organization" description="Manage your rental workspace."/><div className="h-48 animate-pulse rounded-2xl bg-slate-200"/></>;

  const { organization, currentUser, members } = workspace;
  return <>
    <PageHeader eyebrow="Workspace settings" title={organization.name} description="Your products, rentals and members are isolated inside this organization."/>
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-2">
        <div className="mb-5 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-800"><Building2 size={22}/></div>
        <p className="text-sm font-semibold text-slate-500">Organization name</p>
        <h2 className="mt-1 text-2xl font-black">{organization.name}</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 inline-flex rounded-xl bg-slate-100 p-3 text-slate-700"><Fingerprint size={22}/></div>
        <p className="text-sm font-semibold text-slate-500">Workspace identifier</p>
        <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">{organization.slug}</p>
      </div>
    </section>
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div><h2 className="flex items-center gap-2 font-bold"><Users size={19}/>Members</h2><p className="mt-1 text-sm text-slate-500">People with access to this workspace</p></div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{members.length}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {members.map((member) => <div key={member.id} className="flex flex-wrap items-center gap-4 p-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-900">{initials(member)}</div>
          <div className="min-w-0 flex-1"><p className="truncate font-bold">{member.firstName} {member.lastName}{member.id === currentUser.id && <span className="ml-2 text-xs font-semibold text-slate-400">You</span>}</p><p className="truncate text-sm text-slate-500">{member.email}</p></div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${member.role === 'ADMIN' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{member.role === 'ADMIN' && <Crown size={13}/>} {member.role === 'ADMIN' ? 'Administrator' : 'Member'}</span>
        </div>)}
      </div>
      {currentUser.role !== 'ADMIN' && <p className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">Only administrators can view the complete member list.</p>}
    </section>
  </>;
}
