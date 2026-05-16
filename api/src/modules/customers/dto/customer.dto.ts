import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

const trimOptional = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() || undefined : value;

export class CreateCustomerDto {
  @IsString() @Length(2, 160) name!: string;
  @IsOptional() @Transform(trimOptional) @IsString() @Length(1, 80) registrationNumber?: string;
  @IsOptional() @Transform(trimOptional) @IsString() @Length(1, 160) contactName?: string;
  @IsOptional() @Transform(trimOptional) @IsEmail() @Length(3, 254) email?: string;
  @IsOptional() @Transform(trimOptional) @IsString() @Length(3, 40) phone?: string;
  @IsOptional() @Transform(trimOptional) @IsString() @Length(3, 300) address?: string;
}

export class CustomerQueryDto {
  @IsOptional() @Transform(trimOptional) @IsString() @Length(1, 160) search?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit = 20;
}
