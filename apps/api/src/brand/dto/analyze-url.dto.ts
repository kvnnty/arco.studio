import { IsString, MaxLength } from 'class-validator';

export class AnalyzeUrlDto {
  @IsString()
  @MaxLength(500)
  url!: string;
}
