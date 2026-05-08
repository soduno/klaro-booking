import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth.types';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async organizationId(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    if (!user?.organizationId) throw new BadRequestException('Complete organization setup first');
    return user.organizationId;
  }

  async list(user: AuthUser, includeInactive = false) {
    const organizationId = await this.organizationId(user.id);
    return this.prisma.product.findMany({ where: { organizationId, ...(includeInactive ? {} : { isActive: true }) }, include: { category: true }, orderBy: { name: 'asc' } });
  }

  async find(user: AuthUser, id: string) {
    const organizationId = await this.organizationId(user.id);
    const product = await this.prisma.product.findFirst({ where: { id, organizationId }, include: { category: true } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(user: AuthUser, dto: CreateProductDto) {
    const organizationId = await this.organizationId(user.id);
    const sku = dto.sku.trim().toUpperCase();
    if (await this.prisma.product.findFirst({ where: { organizationId, sku }, select: { id: true } })) throw new ConflictException('A product with this SKU already exists in your organization');
    if (!await this.prisma.category.findFirst({ where: { id: dto.categoryId, organizationId }, select: { id: true } })) throw new BadRequestException('Category not found in your organization');
    return this.prisma.product.create({ data: { ...dto, organizationId, metadata: dto.metadata, sku, name: dto.name.trim(), description: dto.description?.trim() || null }, include: { category: true } });
  }

  async update(user: AuthUser, id: string, dto: UpdateProductDto) {
    const product = await this.find(user, id);
    if (dto.sku) {
      const duplicate = await this.prisma.product.findFirst({ where: { organizationId: product.organizationId, sku: dto.sku.trim().toUpperCase(), id: { not: id } }, select: { id: true } });
      if (duplicate) throw new ConflictException('A product with this SKU already exists in your organization');
    }
    if (dto.quantity !== undefined) {
      const maximumReserved = await this.maximumConcurrentReservation(id);
      if (dto.quantity < maximumReserved) throw new BadRequestException(`Quantity cannot be lower than the currently reserved quantity (${maximumReserved})`);
    }
    if (dto.categoryId && !await this.prisma.category.findFirst({ where: { id: dto.categoryId, organizationId: product.organizationId }, select: { id: true } })) throw new BadRequestException('Category not found in your organization');
    return this.prisma.product.update({ where: { id }, data: { ...dto, metadata: dto.metadata, sku: dto.sku?.trim().toUpperCase(), name: dto.name?.trim(), description: dto.description?.trim() || (dto.description === '' ? null : undefined) }, include: { category: true } });
  }

  private async maximumConcurrentReservation(productId: string) {
    const items = await this.prisma.bookingItem.findMany({ where: { productId, booking: { status: { not: 'CANCELLED' }, endTime: { gt: new Date() } } }, select: { quantity: true, booking: { select: { startTime: true, endTime: true } } } });
    const points = items.flatMap((item) => [{ time: item.booking.startTime.getTime(), delta: item.quantity }, { time: item.booking.endTime.getTime(), delta: -item.quantity }]).sort((a, b) => a.time - b.time || a.delta - b.delta);
    let current = 0, maximum = 0;
    for (const point of points) { current += point.delta; maximum = Math.max(maximum, current); }
    return maximum;
  }
}
