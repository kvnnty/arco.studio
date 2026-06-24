import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StoryboardBriefDto {
  @IsString()
  @IsOptional()
  intent?: string;

  @IsString()
  @IsOptional()
  productUrl?: string;
}

export class GenerateStoryboardDto {
  @IsString()
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  imageUrls!: string[];

  @ValidateNested()
  @Type(() => StoryboardBriefDto)
  @IsOptional()
  brief?: StoryboardBriefDto;

  @IsString()
  @IsOptional()
  productUrl?: string;

  @IsString()
  @IsOptional()
  intent?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsNumber()
  @IsOptional()
  targetDurationMs?: number;
}
