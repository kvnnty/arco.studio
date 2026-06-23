import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProjectBriefDto {
  @IsString()
  @IsOptional()
  intent?: string;

  @IsString()
  @IsOptional()
  productUrl?: string;
}

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  exportFormat?: string;

  @IsString()
  @IsOptional()
  stylePreset?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @ValidateNested()
  @Type(() => ProjectBriefDto)
  @IsOptional()
  brief?: ProjectBriefDto;

  @IsObject()
  @IsOptional()
  projectData?: Record<string, unknown>;
}
