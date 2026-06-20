import {
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChatHistoryItemDto {
  @IsString()
  role!: 'user' | 'assistant';

  @IsString()
  content!: string;
}

class ChatMarkerDto {
  @IsString()
  id!: string;

  @IsInt()
  @Min(0)
  startMs!: number;

  @IsInt()
  @Min(0)
  durationMs!: number;

  @IsString()
  @IsOptional()
  label?: string;

  @IsObject()
  @IsOptional()
  callout?: { text: string; subtext?: string };
}

class ChatProjectSnapshotDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  stylePreset?: string;

  @IsInt()
  @Min(1000)
  durationMs!: number;

  @IsString()
  @IsOptional()
  intent?: string;

  @IsString()
  @IsOptional()
  productUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMarkerDto)
  markers!: ChatMarkerDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  selectedMarkerIndex?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  playheadMs?: number;
}

export class ChatDto {
  @IsString()
  projectId!: string;

  @IsString()
  message!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  @IsOptional()
  history?: ChatHistoryItemDto[];

  @ValidateNested()
  @Type(() => ChatProjectSnapshotDto)
  project!: ChatProjectSnapshotDto;
}
