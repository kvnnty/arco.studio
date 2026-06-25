import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateRenderDto {
  @IsString()
  projectId!: string;

  @IsString()
  @IsOptional()
  format?: string;

  @IsIn(['1080p', '4k'])
  @IsOptional()
  quality?: '1080p' | '4k';
}
