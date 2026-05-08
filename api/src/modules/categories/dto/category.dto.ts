import { IsOptional, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @Length(1, 80) name!: string;
  @IsOptional() @IsString() @Length(0, 500) description?: string;
}
