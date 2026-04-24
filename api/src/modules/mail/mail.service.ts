import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter;
  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow('SMTP_HOST'), port: config.getOrThrow('SMTP_PORT'),
      auth: config.get('SMTP_USER') ? { user: config.get('SMTP_USER'), pass: config.get('SMTP_PASSWORD') } : undefined,
    });
  }
  async sendVerification(email: string, token: string) {
    const link = `${this.config.getOrThrow('FRONTEND_URL')}/verify-email?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({ from: this.config.getOrThrow('SMTP_FROM'), to: email, subject: 'Verify your email', text: `Verify your email: ${link}` });
  }
  async sendPasswordReset(email: string, token: string) {
    const link = `${this.config.getOrThrow('FRONTEND_URL')}/reset-password?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({ from: this.config.getOrThrow('SMTP_FROM'), to: email, subject: 'Reset your password', text: `Reset your password: ${link}` });
  }
}
