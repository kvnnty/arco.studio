import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  exportFormat?: string;

  @IsObject()
  @IsOptional()
  projectData?: Record<string, unknown>;
}
