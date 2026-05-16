import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth.types';
import { CsrfGuard } from '../../common/auth/csrf.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CreateCustomerDto, CustomerQueryDto } from './dto/customer.dto';
import { CustomersService } from './customers.service';

@Controller({ path: 'customers', version: '1' })
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: CustomerQueryDto) { return this.customers.list(user, query); }
  @Post() @UseGuards(CsrfGuard) create(@CurrentUser() user: AuthUser, @Body() dto: CreateCustomerDto) { return this.customers.create(user, dto); }
}
