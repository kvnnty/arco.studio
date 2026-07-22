import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const ONBOARDING_STEPS = [
  'profile',
  'persona',
  'goals',
  'plan',
  'completed',
] as const;

export class UpdateOnboardingDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(ONBOARDING_STEPS)
  step?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  referralCode?: string;
}
