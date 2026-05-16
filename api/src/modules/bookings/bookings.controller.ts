import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { CsrfGuard } from '../../common/auth/csrf.guard';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import type { AuthUser } from '../../common/auth/auth.types';
import { BookingQueryDto, CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { BookingsService } from './bookings.service';

@Controller({ path: 'bookings', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: BookingQueryDto) { return this.bookings.list(user, query); }
  @Get(':id') find(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.bookings.find(user, id); }
  @Post() @UseGuards(CsrfGuard) create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) { return this.bookings.create(user, dto); }
  @Patch(':id') @UseGuards(CsrfGuard) update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateBookingDto) { return this.bookings.update(user, id, dto); }
  @Patch(':id/cancel') @UseGuards(CsrfGuard) cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.bookings.cancel(user, id); }
}
