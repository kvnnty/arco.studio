import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export type AuthEmailJob =
  | {
      type: 'magic_link';
      to: string;
      url: string;
      purpose: 'login' | 'signup' | 'verify' | 'password_reset';
    }
  | {
      type: 'security_alert';
      to: string;
      message: string;
    };

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from =
      this.config.get<string>('EMAIL_FROM') ?? 'Arco <hello@arco.app>';
    this.appUrl =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
  }

  enqueue(job: AuthEmailJob): void {
    setImmediate(() => {
      void this.process(job).catch((error) => {
        this.logger.error(`Failed to send ${job.type} email`, error);
      });
    });
  }

  private async process(job: AuthEmailJob): Promise<void> {
    if (job.type === 'magic_link') {
      await this.sendMagicLink(job);
      return;
    }

    await this.sendSecurityAlert(job);
  }

  private async sendMagicLink(
    job: Extract<AuthEmailJob, { type: 'magic_link' }>,
  ): Promise<void> {
    const subject = this.magicLinkSubject(job.purpose);
    const html = this.magicLinkHtml(job.url, job.purpose);

    if (!this.resend) {
      this.logger.warn(
        `[dev] RESEND_API_KEY not set. Magic link for ${job.to}: ${job.url}`,
      );
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to: job.to,
      subject,
      html,
    });
  }

  private async sendSecurityAlert(
    job: Extract<AuthEmailJob, { type: 'security_alert' }>,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[dev] Security alert for ${job.to}: ${job.message}`);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to: job.to,
      subject: 'Security alert for your Arco account',
      html: `<p>${job.message}</p><p>If this wasn't you, revoke all sessions from Settings.</p>`,
    });
  }

  private magicLinkSubject(
    purpose: Extract<AuthEmailJob, { type: 'magic_link' }>['purpose'],
  ): string {
    switch (purpose) {
      case 'signup':
        return 'Verify your email and join Arco';
      case 'verify':
        return 'Verify your Arco email address';
      case 'password_reset':
        return 'Reset your Arco password';
      default:
        return 'Sign in to Arco';
    }
  }

  private magicLinkHtml(url: string, purpose: string): string {
    const action =
      purpose === 'password_reset'
        ? 'Reset password'
        : purpose === 'signup' || purpose === 'verify'
          ? 'Verify email'
          : 'Sign in';

    return `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;margin-bottom:12px">Arco</h1>
        <p style="color:#444;line-height:1.5">
          Click the button below to ${action.toLowerCase()}. This link expires in 15 minutes and can only be used once.
        </p>
        <p style="margin:24px 0">
          <a href="${url}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${action}</a>
        </p>
        <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px;word-break:break-all">${url}</p>
      </div>
    `;
  }

  buildMagicLinkUrl(token: string, path = '/auth/verify'): string {
    return `${this.appUrl}${path}?token=${encodeURIComponent(token)}`;
  }
}
