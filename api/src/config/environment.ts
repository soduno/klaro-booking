import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min, MinLength, validateSync } from 'class-validator';

class Environment {
  @IsString() DATABASE_URL!: string;
  @IsString() @MinLength(32) JWT_ACCESS_SECRET!: string;
  @IsString() @MinLength(32) JWT_REFRESH_SECRET!: string;
  @IsString() JWT_ACCESS_EXPIRATION = '15m';
  @IsString() JWT_REFRESH_EXPIRATION = '7d';
  @IsUrl({ require_tld: false }) FRONTEND_URL!: string;
  @Type(() => Number)
  @IsInt()
  @Min(1)
  API_PORT = 3001;
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  COOKIE_SECURE = false;
  @IsString() SMTP_HOST!: string;
  @Type(() => Number)
  @IsInt()
  SMTP_PORT!: number;
  @IsOptional() @IsString() SMTP_USER?: string;
  @IsOptional() @IsString() SMTP_PASSWORD?: string;
  @IsString() SMTP_FROM!: string;
}

export function validateEnvironment(input: Record<string, unknown>) {
  const config = plainToInstance(Environment, input, { enableImplicitConversion: true });
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length) throw new Error(errors.toString());
  return config;
}
