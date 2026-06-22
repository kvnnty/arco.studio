import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class MagicLinkDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  referralCode?: string;
}
