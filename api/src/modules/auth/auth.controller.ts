import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { CsrfGuard } from '../../common/auth/csrf.guard';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import type { AuthUser } from '../../common/auth/auth.types';
import { AuthService } from './auth.service';
import { EmailDto, LoginDto, RegisterDto, ResetPasswordDto, TokenDto } from './dto/auth.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}
  private setCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const base = { httpOnly: true, secure: this.config.get('COOKIE_SECURE', false), sameSite: 'lax' as const, path: '/' };
    res.cookie('access_token', tokens.accessToken, { ...base, maxAge: 15 * 60_000 });
    res.cookie('refresh_token', tokens.refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60_000 });
    res.cookie('csrf_token', randomBytes(24).toString('base64url'), { secure: base.secure, sameSite: 'lax', path: '/' });
  }
  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('verify-email') verify(@Body() dto: TokenDto) { return this.auth.verifyEmail(dto.token); }
  @Post('resend-verification') resend(@Body() dto: EmailDto) { return this.auth.resendVerification(dto.email); }
  @Post('forgot-password') forgot(@Body() dto: EmailDto) { return this.auth.forgotPassword(dto.email); }
  @Post('reset-password') reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto.token, dto.password); }
  @Post('login') async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.login(dto); this.setCookies(res, session); return { user: session.user };
  }
  @Post('refresh') @UseGuards(CsrfGuard) async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.rotate(req.cookies?.refresh_token as string); this.setCookies(res, session); return { user: session.user };
  }
  @Post('logout') @UseGuards(CsrfGuard) async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh_token as string | undefined); res.clearCookie('access_token'); res.clearCookie('refresh_token'); res.clearCookie('csrf_token'); return { message: 'Signed out' };
  }
  @Get('me') @UseGuards(JwtAuthGuard) me(@CurrentUser() user: AuthUser) { return this.auth.me(user.id); }
}
