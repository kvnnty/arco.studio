import { IsString, IsOptional, IsObject, IsInt, Min } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  stylePreset?: string;

  @IsString()
  @IsOptional()
  exportFormat?: string;

  @IsObject()
  @IsOptional()
  projectData?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  recordingSrc?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  markerCount?: number;
}
