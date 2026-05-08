import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CsrfGuard } from '../../common/auth/csrf.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthUser } from '../../common/auth/auth.types';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller({ path: 'products', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly products: ProductsService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query('includeInactive') includeInactive?: string) { return this.products.list(user, user.role === 'ADMIN' && includeInactive === 'true'); }
  @Get(':id') find(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.products.find(user, id); }
  @Post() @Roles('ADMIN') @UseGuards(CsrfGuard) create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) { return this.products.create(user, dto); }
  @Patch(':id') @Roles('ADMIN') @UseGuards(CsrfGuard) update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProductDto) { return this.products.update(user, id, dto); }
}
