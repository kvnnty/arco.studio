import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ARCO_VOICES,
  getDefaultVoiceId,
  getVoiceById,
  resolveVoiceId,
} from '@arco/project-schema/voices';
import { S3Service } from '../storage/s3.service.js';
import type { GenerateVoiceDto, PreviewVoiceDto } from './dto/voice.dto.js';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  constructor(private readonly s3: S3Service) {}

  listVoices() {
    return ARCO_VOICES.map(({ id, name, accent, gender, previewText }) => ({
      id,
      name,
      accent,
      gender,
      previewText,
    }));
  }

  private requireApiKey(): string {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Voice generation is not configured. Set ELEVENLABS_API_KEY.',
      );
    }
    return apiKey;
  }

  async synthesize(
    voiceId: string,
    text: string,
  ): Promise<Buffer> {
    const apiKey = this.requireApiKey();
    const voice = getVoiceById(voiceId) ?? getVoiceById(getDefaultVoiceId());
    if (!voice) {
      throw new ServiceUnavailableException('Voice not found.');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2',
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      this.logger.warn(`ElevenLabs error ${response.status}: ${body}`);
      throw new ServiceUnavailableException(
        'Voice synthesis failed. Check ELEVENLABS_API_KEY and voice ID.',
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async preview(dto: PreviewVoiceDto) {
    const voice = getVoiceById(dto.voiceId);
    const text =
      dto.text?.trim() ||
      voice?.previewText ||
      'This is a preview of your Arco narrator voice.';

    const audio = await this.synthesize(dto.voiceId, text);
    return {
      audioBase64: audio.toString('base64'),
      contentType: 'audio/mpeg',
    };
  }

  async generateForScenes(userId: string, dto: GenerateVoiceDto) {
    const envDefault = process.env.ELEVENLABS_DEFAULT_VOICE_ID;
    const voiceId = resolveVoiceId(dto.voiceId ?? envDefault);
    const results: Array<{
      id: string;
      voAudioSrc: string;
      voScript: string;
    }> = [];

    for (const scene of dto.scenes) {
      const script = scene.voScript.trim();
      if (!script) continue;

      const audio = await this.synthesize(voiceId, script);
      const key = `voice/${userId}/${randomUUID()}.mp3`;
      const uploaded = await this.s3.uploadObject(key, audio, 'audio/mpeg');

      results.push({
        id: scene.id,
        voScript: script,
        voAudioSrc: uploaded.url,
      });
    }

    return { voiceId, scenes: results };
  }
}
