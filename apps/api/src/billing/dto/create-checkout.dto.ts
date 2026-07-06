import { IsIn, IsOptional } from 'class-validator';

export class CreateCheckoutDto {
  @IsIn(['trial', 'pro', 'studio'])
  plan!: 'trial' | 'pro' | 'studio';

  @IsOptional()
  @IsIn(['monthly', 'annual'])
  interval?: 'monthly' | 'annual';
}
