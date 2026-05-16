import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth.types';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { CreateCustomerDto, CustomerQueryDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private organizationId(user: AuthUser) {
    if (!user.organizationId) throw new BadRequestException('Complete organization setup first');
    return user.organizationId;
  }

  list(user: AuthUser, query: CustomerQueryDto) {
    const organizationId = this.organizationId(user);
    return this.prisma.customer.findMany({
      where: {
        organizationId,
        OR: query.search ? [
          { name: { contains: query.search, mode: 'insensitive' } },
          { registrationNumber: { contains: query.search, mode: 'insensitive' } },
          { contactName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: { name: 'asc' },
      take: query.limit,
    });
  }

  async create(user: AuthUser, dto: CreateCustomerDto) {
    const organizationId = this.organizationId(user);
    if (dto.registrationNumber) {
      const existing = await this.prisma.customer.findFirst({ where: { organizationId, registrationNumber: dto.registrationNumber } });
      if (existing) throw new ConflictException('A company with this registration number already exists');
    }
    return this.prisma.customer.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        registrationNumber: dto.registrationNumber,
        contactName: dto.contactName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        address: dto.address,
      },
    });
  }
}
