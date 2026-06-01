import { api } from '@/lib/api';
import type { Organization, User } from '@/types';

export const getCurrentOrganization = () => api<Organization>('/organizations/me');
export const getCurrentUser = () => api<User>('/auth/me');
export const getOrganizationMembers = () => api<User[]>('/users');
