import { IsString, IsOptional } from 'class-validator';

export class CreateRenderDto {
  @IsString()
  projectId!: string;

  @IsString()
  @IsOptional()
  format?: string;
}
