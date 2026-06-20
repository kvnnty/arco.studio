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

class MarkerSummaryDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsObject()
  @IsOptional()
  callout?: { text: string; subtext?: string };

  @IsInt()
  @Min(0)
  startMs!: number;
}

export class RefineProjectDto {
  @IsString()
  title!: string;

  @IsString()
  instruction!: string;

  @IsString()
  @IsOptional()
  intent?: string;

  @IsString()
  @IsOptional()
  productUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkerSummaryDto)
  markers!: MarkerSummaryDto[];
}
