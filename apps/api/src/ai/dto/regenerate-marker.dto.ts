import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

class MarkerContextDto {
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

export class RegenerateMarkerDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(1000)
  @Max(600_000)
  durationMs!: number;

  @IsInt()
  @Min(0)
  markerIndex!: number;

  @IsInt()
  @Min(1)
  markerCount!: number;

  @IsString()
  @IsOptional()
  intent?: string;

  @IsString()
  @IsOptional()
  productUrl?: string;

  @IsObject()
  marker!: MarkerContextDto;
}
