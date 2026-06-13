import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';

describe('BookingsService product availability', () => {
  const tx = {
    $queryRawUnsafe: jest.fn(),
    product: { findMany: jest.fn() },
    bookingItem: { groupBy: jest.fn(), deleteMany: jest.fn() },
    booking: { create: jest.fn(), update: jest.fn() },
  };
  const prisma = { $transaction: jest.fn((fn: (value: typeof tx) => unknown) => fn(tx)), user: { findUnique: jest.fn() }, customer: { findFirst: jest.fn() }, booking: { findUnique: jest.fn(), update: jest.fn() } };
  const service = new BookingsService(prisma as never);
  const user = { id: 'user-1', email: 'a@example.com', role: 'USER' as const, organizationId: 'org-1' };
  const item = { productId: '11111111-1111-4111-8111-111111111111', quantity: 2 };
  const customerId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ organizationId: 'org-1' });
    prisma.customer.findFirst.mockResolvedValue({ id: customerId });
    tx.product.findMany.mockResolvedValue([{ id: item.productId, name: 'Notebook', quantity: 5 }]);
    tx.bookingItem.groupBy.mockResolvedValue([]);
  });

  it('rejects an invalid rental interval', async () => {
    await expect(service.create(user, { customerId, title: 'Test', startTime: new Date('2030-01-02'), endTime: new Date('2030-01-01'), items: [item] })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows overlapping rentals while enough stock remains', async () => {
    tx.bookingItem.groupBy.mockResolvedValue([{ productId: item.productId, _sum: { quantity: 2 } }]);
    tx.booking.create.mockResolvedValue({ id: 'booking-1' });
    await expect(service.create(user, { customerId, title: 'Test', startTime: new Date('2030-01-01'), endTime: new Date('2030-01-02'), items: [item] })).resolves.toEqual({ id: 'booking-1' });
  });

  it('rejects an overlap when requested quantity exceeds remaining stock', async () => {
    tx.bookingItem.groupBy.mockResolvedValue([{ productId: item.productId, _sum: { quantity: 4 } }]);
    await expect(service.create(user, { customerId, title: 'Test', startTime: new Date('2030-01-01'), endTime: new Date('2030-01-02'), items: [item] })).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents access to another user rental', async () => {
    prisma.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'other', organizationId: 'org-1' });
    await expect(service.find(user, 'b1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
