import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateRenderDto {
  @IsString()
  projectId!: string;

  /** @deprecated Ignored — export uses project native aspect ratio. */
  @IsString()
  @IsOptional()
  format?: string;

  @IsIn(['720p', '1080p', '4k'])
  @IsOptional()
  quality?: '720p' | '1080p' | '4k';
}
