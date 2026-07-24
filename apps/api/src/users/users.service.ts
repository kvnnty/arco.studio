import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  name: true,
  onboardingCompleted: true,
  onboardingStep: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClerkUserId(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
      select: userSelect,
    });
  }

  async resolveClerkIdentity(input: {
    clerkUserId: string;
    email: string;
    name: string | null;
  }) {
    const byClerkId = await this.findByClerkUserId(input.clerkUserId);
    if (byClerkId) return byClerkId;

    const byEmail = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (byEmail?.clerkUserId && byEmail.clerkUserId !== input.clerkUserId) {
      throw new ConflictException(
        'This email is already linked to a different identity.',
      );
    }

    if (byEmail) {
      const claimed = await this.prisma.user.updateMany({
        where: { id: byEmail.id, clerkUserId: null },
        data: {
          clerkUserId: input.clerkUserId,
          ...(byEmail.name ? {} : { name: input.name }),
        },
      });

      if (claimed.count === 1) {
        return this.prisma.user.findUniqueOrThrow({
          where: { clerkUserId: input.clerkUserId },
          select: userSelect,
        });
      }

      const winner = await this.findByClerkUserId(input.clerkUserId);
      if (winner) return winner;
      throw new ConflictException(
        'This email is already linked to a different identity.',
      );
    }

    try {
      return await this.prisma.user.create({
        data: {
          clerkUserId: input.clerkUserId,
          email: input.email,
          name: input.name,
          exportAllowance: Number(process.env.EXPORT_ALLOWANCE_PRO ?? 15),
        },
        select: userSelect,
      });
    } catch {
      const winner = await this.findByClerkUserId(input.clerkUserId);
      if (winner) return winner;
      throw new ConflictException('Could not link this identity safely.');
    }
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(userId: string, input: { name?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined
          ? { name: input.name.trim() || null }
          : {}),
      },
      select: userSelect,
    });
  }

  async updateOnboarding(
    userId: string,
    input: { name?: string; step?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined
          ? { name: input.name.trim() || null }
          : {}),
        ...(input.step === 'completed'
          ? { onboardingCompleted: true, onboardingStep: 'completed' }
          : input.step
            ? { onboardingStep: input.step }
            : {}),
      },
      select: userSelect,
    });
  }
}
