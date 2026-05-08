import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { AuthUser } from '../../common/auth/auth.types';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async organizationId(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    if (!user?.organizationId) throw new BadRequestException('Complete organization setup first');
    return user.organizationId;
  }

  async list(user: AuthUser) {
    const organizationId = await this.organizationId(user.id);
    const categories = await this.prisma.category.findMany({
      where: { organizationId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return categories.map(({ _count, ...category }) => ({ ...category, productCount: _count.products }));
  }

  async find(user: AuthUser, id: string) {
    const organizationId = await this.organizationId(user.id);
    const category = await this.prisma.category.findFirst({
      where: { id, organizationId },
      include: { products: { include: { category: true }, orderBy: { name: 'asc' } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(user: AuthUser, dto: CreateCategoryDto) {
    const organizationId = await this.organizationId(user.id);
    const name = dto.name.trim();
    const duplicate = await this.prisma.category.findFirst({ where: { organizationId, name: { equals: name, mode: 'insensitive' } }, select: { id: true } });
    if (duplicate) throw new ConflictException('A category with this name already exists');
    const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'category';
    return this.prisma.category.create({ data: { organizationId, name, slug: `${base}-${randomBytes(3).toString('hex')}`, description: dto.description?.trim() || null } });
  }
}
