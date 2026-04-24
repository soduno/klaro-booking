import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { CsrfGuard } from '../../common/auth/csrf.guard';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import type { AuthUser } from '../../common/auth/auth.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me') me(@CurrentUser() user: AuthUser) { return this.users.me(user.id); }
  @Patch('me') @UseGuards(CsrfGuard) update(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) { return this.users.update(user.id, dto); }
  @Get() @Roles('ADMIN') list(@CurrentUser() user: AuthUser) { return this.users.list(user.id); }
  @Delete(':id') @Roles('ADMIN') @UseGuards(CsrfGuard) remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.users.remove(user.id, id); }
}
