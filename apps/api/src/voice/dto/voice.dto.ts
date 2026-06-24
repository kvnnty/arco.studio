import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class VoiceSceneDto {
  @IsString()
  id!: string;

  @IsString()
  voScript!: string;
}

export class GenerateVoiceDto {
  @IsString()
  @IsOptional()
  voiceId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VoiceSceneDto)
  scenes!: VoiceSceneDto[];
}

export class PreviewVoiceDto {
  @IsString()
  voiceId!: string;

  @IsString()
  @IsOptional()
  text?: string;
}
