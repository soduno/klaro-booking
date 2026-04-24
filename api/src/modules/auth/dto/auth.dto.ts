import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @Length(1, 80) firstName!: string;
  @IsString() @Length(1, 80) lastName!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(10) @MaxLength(128) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'password must contain upper-case, lower-case and numeric characters' }) password!: string;
}
export class LoginDto { @IsEmail() email!: string; @IsString() password!: string; }
export class TokenDto { @IsString() @MinLength(32) token!: string; }
export class EmailDto { @IsEmail() email!: string; }
export class ResetPasswordDto extends TokenDto {
  @IsString() @MinLength(10) @MaxLength(128) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/) password!: string;
}
