import { IsOptional, IsString, Length } from 'class-validator';
export class UpdateUserDto {
  @IsOptional() @IsString() @Length(1, 80) firstName?: string;
  @IsOptional() @IsString() @Length(1, 80) lastName?: string;
}
