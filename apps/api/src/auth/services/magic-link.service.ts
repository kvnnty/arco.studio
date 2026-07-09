import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MAGIC_LINK_TTL_MS, MAGIC_LINK_PURPOSES } from '../auth.constants';
import {
  generateOpaqueToken,
  hashToken,
  normalizeEmail,
} from '../utils/crypto.util';
import type { AuthContext } from '../auth.constants';

@Injectable()
export class MagicLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async createToken(input: {
    email: string;
    purpose: string;
    userId?: string;
    ctx?: AuthContext;
  }): Promise<string> {
    const email = normalizeEmail(input.email);
    const token = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

    await this.prisma.magicLinkToken.create({
      data: {
        email,
        tokenHash: hashToken(token),
        purpose: input.purpose,
        expiresAt,
        userId: input.userId,
        ipAddress: input.ctx?.ipAddress,
      },
    });

    return token;
  }

  async consumeToken(
    token: string,
    expectedPurpose?: string,
  ): Promise<{
    email: string;
    purpose: string;
    userId: string | null;
  } | null> {
    const tokenHash = hashToken(token);
    const record = await this.prisma.magicLinkToken.findUnique({
      where: { tokenHash },
    });

    if (
      !record ||
      record.consumedAt ||
      record.expiresAt.getTime() <= Date.now()
    ) {
      return null;
    }

    if (expectedPurpose && record.purpose !== expectedPurpose) {
      return null;
    }

    await this.prisma.magicLinkToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    return {
      email: record.email,
      purpose: record.purpose,
      userId: record.userId,
    };
  }

  loginPurposeForUser(exists: boolean, emailVerified: boolean): string {
    if (!exists) return MAGIC_LINK_PURPOSES.SIGNUP;
    if (!emailVerified) return MAGIC_LINK_PURPOSES.EMAIL_VERIFY;
    return MAGIC_LINK_PURPOSES.LOGIN;
  }
}
