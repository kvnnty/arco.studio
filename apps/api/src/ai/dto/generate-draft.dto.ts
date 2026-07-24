import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BrandContextDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tone?: string;

  @IsObject()
  @IsOptional()
  colors?: { primary: string; background: string };
}

class TemplateContextDto {
  @IsString()
  name!: string;

  @IsString()
  copyTone!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  sceneCount!: number;

  @IsArray()
  @IsString({ each: true })
  sceneHints!: string[];

  @IsString()
  stylePreset!: string;

  @IsString()
  soundProfile!: string;
}

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

  @IsString()
  @IsOptional()
  templateId?: string;

  @ValidateNested()
  @Type(() => BrandContextDto)
  @IsOptional()
  brandContext?: BrandContextDto;

  @ValidateNested()
  @Type(() => TemplateContextDto)
  @IsOptional()
  templateContext?: TemplateContextDto;
}
