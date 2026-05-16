import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDate, IsEnum, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator';

export enum BookingStatusDto { PENDING = 'PENDING', CONFIRMED = 'CONFIRMED', CANCELLED = 'CANCELLED' }
export class BookingItemDto {
  @IsUUID() productId!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(100_000) quantity!: number;
}
export class CreateBookingDto {
  @IsUUID() customerId!: string;
  @IsString() @Length(1, 160) title!: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;
  @Type(() => Date) @IsDate() startTime!: Date;
  @Type(() => Date) @IsDate() endTime!: Date;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => BookingItemDto) items!: BookingItemDto[];
}
export class UpdateBookingDto {
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsString() @Length(1, 160) title?: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;
  @IsOptional() @Type(() => Date) @IsDate() startTime?: Date;
  @IsOptional() @Type(() => Date) @IsDate() endTime?: Date;
  @IsOptional() @IsEnum(BookingStatusDto) status?: BookingStatusDto;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => BookingItemDto) items?: BookingItemDto[];
}
export class BookingQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 10;
  @IsOptional() @IsEnum(BookingStatusDto) status?: BookingStatusDto;
  @IsOptional() @Type(() => Date) @IsDate() from?: Date;
  @IsOptional() @Type(() => Date) @IsDate() to?: Date;
  @IsOptional() @IsString() @Length(1, 160) search?: string;
  @IsOptional() @IsEnum(['title', 'startTime', 'endTime', 'createdAt', 'status']) sortBy: 'title' | 'startTime' | 'endTime' | 'createdAt' | 'status' = 'startTime';
  @IsOptional() @Transform(({ value }) => String(value).toLowerCase()) @IsEnum(['asc', 'desc']) sortOrder: 'asc' | 'desc' = 'asc';
}
