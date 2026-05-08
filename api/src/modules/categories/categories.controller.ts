import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { CsrfGuard } from '../../common/auth/csrf.guard';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import type { AuthUser } from '../../common/auth/auth.types';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';

@Controller({ path: 'categories', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Get() list(@CurrentUser() user: AuthUser) { return this.categories.list(user); }
  @Get(':id') find(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.categories.find(user, id); }
  @Post() @Roles('ADMIN') @UseGuards(CsrfGuard) create(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) { return this.categories.create(user, dto); }
}
