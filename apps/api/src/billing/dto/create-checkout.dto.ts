import { IsIn } from 'class-validator';

export class CreateCheckoutDto {
  @IsIn(['trial', 'pro'])
  plan!: 'trial' | 'pro';
}
