import { describe, expect, it } from 'vitest';
import { bookingSchema } from '../features/bookings/booking.schema';
describe('booking validation', () => {
  const items = [{ productId: 'product-1', quantity: 1 }];
  const customerId = 'customer-1';
  it('rejects an end before the start', () => expect(bookingSchema.safeParse({ customerId, title: 'Review', startTime: '2030-01-02T10:00', endTime: '2030-01-02T09:00', items }).success).toBe(false));
  it('accepts a valid interval with products', () => expect(bookingSchema.safeParse({ customerId, title: 'Review', description: '', startTime: '2030-01-02T09:00', endTime: '2030-01-02T10:00', items }).success).toBe(true));
  it('rejects duplicate product lines', () => expect(bookingSchema.safeParse({ customerId, title: 'Review', startTime: '2030-01-02T09:00', endTime: '2030-01-02T10:00', items: [...items, ...items] }).success).toBe(false));
  it('requires a company', () => expect(bookingSchema.safeParse({ customerId: '', title: 'Review', startTime: '2030-01-02T09:00', endTime: '2030-01-02T10:00', items }).success).toBe(false));
});
