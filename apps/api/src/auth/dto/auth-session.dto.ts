import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class VerifyMagicLinkDto {
  @IsString()
  token!: string;
}

export class OAuthCompleteDto {
  @IsString()
  token!: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class SetPasswordDto {
  @IsString()
  @MinLength(8)
  password!: string;
}

export class CompleteOnboardingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  step?: string;
}
