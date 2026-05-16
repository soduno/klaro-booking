import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth.types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, type BookingStatus } from '../../generated/prisma/client';
import type { BookingItemDto, BookingQueryDto, CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

const transitions: Record<BookingStatus, BookingStatus[]> = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['CANCELLED'], CANCELLED: [] };
const bookingInclude = { customer: true, user: { select: { id: true, firstName: true, lastName: true, email: true } }, items: { include: { product: { include: { category: true } } }, orderBy: { product: { name: 'asc' as const } } } } as const;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async organizationId(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    if (!user?.organizationId) throw new BadRequestException('Complete organization setup first');
    return user.organizationId;
  }

  private validateTimes(start: Date, end: Date, creating = false) {
    if (start >= end) throw new BadRequestException('Start time must be earlier than end time');
    if (creating && start <= new Date()) throw new BadRequestException('Choose a future start time. The selected time has already passed.');
  }

  private validateItems(items: BookingItemDto[]) {
    if (new Set(items.map((item) => item.productId)).size !== items.length) throw new BadRequestException('Each product can only appear once in a booking');
  }

  private async assertAvailability(tx: Prisma.TransactionClient, organizationId: string, items: BookingItemDto[], start: Date, end: Date, excludeBookingId?: string) {
    this.validateItems(items);
    const productIds = items.map((item) => item.productId).sort();
    for (const productId of productIds) await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))', productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds }, organizationId, isActive: true }, select: { id: true, name: true, quantity: true } });
    if (products.length !== productIds.length) throw new BadRequestException('One or more products are unavailable');
    const reserved = await tx.bookingItem.groupBy({ by: ['productId'], where: { productId: { in: productIds }, booking: { id: excludeBookingId ? { not: excludeBookingId } : undefined, status: { not: 'CANCELLED' }, startTime: { lt: end }, endTime: { gt: start } } }, _sum: { quantity: true } });
    const reservedByProduct = new Map(reserved.map((row) => [row.productId, row._sum.quantity ?? 0]));
    for (const item of items) {
      const product = products.find((candidate) => candidate.id === item.productId)!;
      const available = product.quantity - (reservedByProduct.get(item.productId) ?? 0);
      if (item.quantity > available) throw new ConflictException(`${product.name} only has ${Math.max(available, 0)} available for the selected period`);
    }
  }

  async create(user: AuthUser, dto: CreateBookingDto) {
    this.validateTimes(dto.startTime, dto.endTime, true);
    const organizationId = await this.organizationId(user.id);
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, organizationId }, select: { id: true } });
    if (!customer) throw new BadRequestException('Choose a valid company');
    return this.prisma.$transaction(async (tx) => {
      await this.assertAvailability(tx, organizationId, dto.items, dto.startTime, dto.endTime);
      return tx.booking.create({ data: { userId: user.id, organizationId, customerId: customer.id, title: dto.title.trim(), description: dto.description?.trim() || null, startTime: dto.startTime, endTime: dto.endTime, items: { create: dto.items } }, include: bookingInclude });
    }, { isolationLevel: 'Serializable' });
  }

  async list(user: AuthUser, query: BookingQueryDto) {
    const organizationId = await this.organizationId(user.id);
    const where: Prisma.BookingWhereInput = {
      organizationId,
      ...(user.role === 'ADMIN' ? {} : { userId: user.id }),
      status: query.status,
      startTime: query.from || query.to ? { gte: query.from, lte: query.to } : undefined,
      OR: query.search ? [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { items: { some: { product: { name: { contains: query.search, mode: 'insensitive' } } } } },
      ] : undefined,
    };
    const [items, total] = await this.prisma.$transaction([this.prisma.booking.findMany({ where, orderBy: { [query.sortBy]: query.sortOrder }, skip: (query.page - 1) * query.limit, take: query.limit, include: bookingInclude }), this.prisma.booking.count({ where })]);
    return { items, meta: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
  }

  async find(user: AuthUser, id: string) {
    const organizationId = await this.organizationId(user.id);
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: bookingInclude });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.organizationId !== organizationId) throw new ForbiddenException('You cannot access this booking');
    if (user.role !== 'ADMIN' && booking.userId !== user.id) throw new ForbiddenException('You cannot access this booking');
    return booking;
  }

  async update(user: AuthUser, id: string, dto: UpdateBookingDto) {
    const current = await this.find(user, id);
    if (current.status === 'CANCELLED') throw new BadRequestException('Cancelled bookings cannot be modified');
    if (dto.status && user.role !== 'ADMIN') throw new ForbiddenException('Only administrators can change booking status');
    if (dto.status && !transitions[current.status].includes(dto.status)) throw new BadRequestException('Invalid booking status transition');
    const start = dto.startTime ?? current.startTime, end = dto.endTime ?? current.endTime;
    const items = dto.items ?? current.items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, organizationId: current.organizationId }, select: { id: true } });
      if (!customer) throw new BadRequestException('Choose a valid company');
    }
    this.validateTimes(start, end);
    return this.prisma.$transaction(async (tx) => {
      if (dto.startTime || dto.endTime || dto.items) await this.assertAvailability(tx, current.organizationId, items, start, end, id);
      if (dto.items) await tx.bookingItem.deleteMany({ where: { bookingId: id } });
      const { items: omittedItems, ...bookingData } = dto;
      void omittedItems;
      return tx.booking.update({ where: { id }, data: { ...bookingData, title: dto.title?.trim(), description: dto.description?.trim() || (dto.description === '' ? null : undefined), ...(dto.items ? { items: { create: dto.items } } : {}) }, include: bookingInclude });
    }, { isolationLevel: 'Serializable' });
  }

  async cancel(user: AuthUser, id: string) {
    const booking = await this.find(user, id);
    if (booking.status === 'CANCELLED') throw new BadRequestException('Booking is already cancelled');
    return this.prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' }, include: bookingInclude });
  }
}
