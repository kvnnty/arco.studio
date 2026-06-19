import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GenerateDraftDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(1000)
  @Max(600_000)
  durationMs!: number;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  intent?: string;

  @IsString()
  @IsOptional()
  productUrl?: string;
}
