import { IsString, Length } from 'class-validator';
export class CreateOrganizationDto {
  @IsString() @Length(2, 120) name!: string;
}
