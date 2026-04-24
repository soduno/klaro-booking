import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const cookie = request.cookies?.csrf_token as string | undefined;
    const header = request.headers['x-csrf-token'];
    if (!cookie || typeof header !== 'string' || cookie !== header) throw new ForbiddenException('Invalid CSRF token');
    return true;
  }
}
