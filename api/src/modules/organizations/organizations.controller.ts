import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { CsrfGuard } from '../../common/auth/csrf.guard';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import type { AuthUser } from '../../common/auth/auth.types';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller({ path: 'organizations', version: '1' })
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}
  @Get('me') current(@CurrentUser() user: AuthUser) { return this.organizations.current(user.id); }
  @Post() @UseGuards(CsrfGuard) create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrganizationDto) { return this.organizations.create(user.id, dto.name); }
}
