import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { UpdateUserDto } from './dto/update-user.dto';
const select = { id: true, firstName: true, lastName: true, email: true, role: true, organizationId: true, organization: { select: { id: true, name: true, slug: true } }, emailVerifiedAt: true, createdAt: true } as const;
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  me(id: string) { return this.prisma.user.findUniqueOrThrow({ where: { id }, select }); }
  update(id: string, dto: UpdateUserDto) { return this.prisma.user.update({ where: { id }, data: dto, select }); }
  async list(requesterId: string) {
    const requester = await this.prisma.user.findUniqueOrThrow({ where: { id: requesterId }, select: { organizationId: true } });
    return this.prisma.user.findMany({ where: { organizationId: requester.organizationId }, select, orderBy: { createdAt: 'desc' } });
  }
  async remove(requesterId: string, id: string) {
    const requester = await this.prisma.user.findUniqueOrThrow({ where: { id: requesterId }, select: { organizationId: true } });
    return this.prisma.user.delete({ where: { id, organizationId: requester.organizationId }, select });
  }
}
