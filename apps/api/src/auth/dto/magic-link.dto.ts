import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class MagicLinkDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}
