import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import type { AuthUser } from '../../common/auth/auth.types';
import type { LoginDto, RegisterDto } from './dto/auth.dto';

const publicUser = { id: true, firstName: true, lastName: true, email: true, role: true, organizationId: true, organization: { select: { id: true, name: true, slug: true } }, emailVerifiedAt: true, createdAt: true } as const;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const future = (minutes: number) => new Date(Date.now() + minutes * 60_000);

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService, private readonly mail: MailService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) throw new ConflictException('An account with this email already exists');
    const user = await this.prisma.user.create({ data: { firstName: dto.firstName.trim(), lastName: dto.lastName.trim(), email, passwordHash: await hash(dto.password) }, select: publicUser });
    await this.issueVerification(user.id, user.email);
    return user;
  }

  async issueVerification(userId: string, email: string) {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } }),
      this.prisma.emailVerificationToken.create({ data: { userId, tokenHash: digest(token), expiresAt: future(60) } }),
    ]);
    await this.mail.sendVerification(email, token);
  }

  async resendVerification(emailInput: string) {
    const user = await this.prisma.user.findUnique({ where: { email: emailInput.trim().toLowerCase() } });
    if (user && !user.emailVerifiedAt) await this.issueVerification(user.id, user.email);
    return { message: 'If the account exists and is unverified, an email has been sent.' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash: digest(token) } });
    if (!record || record.usedAt || record.expiresAt <= new Date()) throw new BadRequestException('Verification link is invalid or expired');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
      this.prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || !(await verify(user.passwordHash, dto.password))) throw new UnauthorizedException('Invalid email or password');
    if (!user.emailVerifiedAt) throw new UnauthorizedException('Verify your email before signing in');
    return this.createSession({ id: user.id, email: user.email, role: user.role, organizationId: user.organizationId });
  }

  async createSession(user: AuthUser) {
    const sessionId = randomUUID();
    const refreshToken = await this.jwt.signAsync({ sub: user.id, sid: sessionId, type: 'refresh' }, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: this.config.get<JwtSignOptions['expiresIn']>('JWT_REFRESH_EXPIRATION', '7d') });
    const payload = this.jwt.decode<{ exp: number }>(refreshToken);
    await this.prisma.refreshSession.create({ data: { id: sessionId, userId: user.id, tokenHash: digest(refreshToken), expiresAt: new Date(payload.exp * 1000) } });
    return { accessToken: await this.accessToken(user), refreshToken, user };
  }

  private accessToken(user: AuthUser) {
    return this.jwt.signAsync({ id: user.id, email: user.email, role: user.role, organizationId: user.organizationId }, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: this.config.get<JwtSignOptions['expiresIn']>('JWT_ACCESS_EXPIRATION', '15m') });
  }

  async rotate(refreshToken: string) {
    let payload: { sub: string; sid: string; type: string };
    try { payload = await this.jwt.verifyAsync(refreshToken, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') }); }
    catch { throw new UnauthorizedException('Invalid refresh token'); }
    const session = await this.prisma.refreshSession.findUnique({ where: { id: payload.sid }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.tokenHash !== digest(refreshToken)) throw new UnauthorizedException('Refresh session is no longer valid');
    const revoked = await this.prisma.refreshSession.updateMany({ where: { id: session.id, revokedAt: null, tokenHash: digest(refreshToken) }, data: { revokedAt: new Date() } });
    if (revoked.count !== 1) throw new UnauthorizedException('Refresh token has already been used');
    return this.createSession({ id: session.user.id, email: session.user.email, role: session.user.role, organizationId: session.user.organizationId });
  }

  async logout(refreshToken?: string) {
    if (refreshToken) await this.prisma.refreshSession.updateMany({ where: { tokenHash: digest(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async forgotPassword(emailInput: string) {
    const user = await this.prisma.user.findUnique({ where: { email: emailInput.trim().toLowerCase() } });
    if (user) {
      const token = randomBytes(32).toString('base64url');
      await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: digest(token), expiresAt: future(30) } });
      await this.mail.sendPasswordReset(user.email, token);
    }
    return { message: 'If the account exists, a password reset email has been sent.' };
  }

  async resetPassword(token: string, password: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: digest(token) } });
    if (!record || record.usedAt || record.expiresAt <= new Date()) throw new BadRequestException('Reset link is invalid or expired');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hash(password) } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshSession.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { message: 'Password updated successfully' };
  }

  me(id: string) { return this.prisma.user.findUniqueOrThrow({ where: { id }, select: publicUser }); }
}
