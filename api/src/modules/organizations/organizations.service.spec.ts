import { ConflictException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  const tx = { organization: { create: jest.fn() }, user: { updateMany: jest.fn() } };
  const prisma = { $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)) };
  const service = new OrganizationsService(prisma as never);
  beforeEach(() => { jest.clearAllMocks(); tx.organization.create.mockResolvedValue({ id: 'org-1', name: 'Northline', slug: 'northline-abc123' }); });

  it('creates an organization and atomically attaches its creator', async () => {
    tx.user.updateMany.mockResolvedValue({ count: 1 });
    await expect(service.create('user-1', 'Northline')).resolves.toMatchObject({ id: 'org-1' });
    expect(tx.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-1', organizationId: null }, data: { organizationId: 'org-1', role: 'ADMIN' } }));
  });

  it('rejects creating a second organization for the same account', async () => {
    tx.user.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.create('user-1', 'Another')).rejects.toBeInstanceOf(ConflictException);
  });
});
