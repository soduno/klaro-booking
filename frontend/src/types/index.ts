export type Role = 'ADMIN' | 'USER';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export interface Organization { id: string; name: string; slug: string; }
export interface Customer { id: string; name: string; registrationNumber?: string | null; contactName?: string | null; email?: string | null; phone?: string | null; address?: string | null; createdAt: string; updatedAt: string; }
export interface Category { id: string; name: string; slug: string; description?: string | null; productCount?: number; products?: Product[]; createdAt: string; updatedAt: string; }
export interface User { id: string; firstName: string; lastName: string; email: string; role: Role; organizationId: string | null; organization?: Organization | null; createdAt?: string; }
export interface Product { id: string; sku: string; name: string; categoryId: string; category: Category; description?: string | null; metadata: Record<string, unknown>; quantity: number; isActive: boolean; createdAt: string; updatedAt: string; }
export interface BookingItem { id: string; productId: string; quantity: number; product: Product; }
export interface Booking { id: string; userId: string; customerId: string; customer: Customer; title: string; description?: string | null; startTime: string; endTime: string; status: BookingStatus; createdAt: string; updatedAt: string; items: BookingItem[]; user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>; }
export interface Paginated<T> { items: T[]; meta: { page: number; limit: number; total: number; pages: number } }
