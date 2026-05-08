import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import type { Prisma } from '../../../generated/prisma/client';

export class CreateProductDto {
  @IsString() @Length(1, 64) sku!: string;
  @IsString() @Length(1, 160) name!: string;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;
  @IsOptional() @IsObject() metadata?: Prisma.InputJsonObject;
  @Type(() => Number) @IsInt() @Min(1) @Max(100_000) quantity!: number;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @Length(1, 64) sku?: string;
  @IsOptional() @IsString() @Length(1, 160) name?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;
  @IsOptional() @IsObject() metadata?: Prisma.InputJsonObject;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100_000) quantity?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
