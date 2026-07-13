import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
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

class SceneSummaryDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  subheadline?: string;

  @IsString()
  @IsOptional()
  voScript?: string;
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
  @IsOptional()
  markers?: MarkerSummaryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SceneSummaryDto)
  @IsOptional()
  scenes?: SceneSummaryDto[];
}
