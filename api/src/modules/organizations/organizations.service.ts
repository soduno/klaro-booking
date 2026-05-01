import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async current(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { organization: true } });
    if (!user?.organization) throw new NotFoundException('No organization is attached to this account');
    return user.organization;
  }

  async create(userId: string, nameInput: string) {
    const name = nameInput.trim();
    const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'organization';
    const slug = `${base}-${randomBytes(3).toString('hex')}`;
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({ data: { name, slug } });
      const attached = await tx.user.updateMany({ where: { id: userId, organizationId: null }, data: { organizationId: organization.id, role: 'ADMIN' } });
      if (attached.count !== 1) throw new ConflictException('This account already belongs to an organization');
      return organization;
    });
  }
}
