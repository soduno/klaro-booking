import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user: AuthUser }>();
    const token = request.cookies?.access_token as string | undefined;
    if (!token) throw new UnauthorizedException('Authentication required');
    try {
      request.user = await this.jwt.verifyAsync<AuthUser>(token, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET') });
      return true;
    } catch { throw new UnauthorizedException('Invalid or expired session'); }
  }
}
