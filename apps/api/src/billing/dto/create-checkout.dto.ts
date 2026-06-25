import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsIn(['trial', 'pro', 'studio'])
  plan!: 'trial' | 'pro' | 'studio';
}
