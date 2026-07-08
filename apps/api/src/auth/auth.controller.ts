import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthContext } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import {
  CompleteOnboardingDto,
  ForgotPasswordDto,
  OAuthCompleteDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SetPasswordDto,
  VerifyMagicLinkDto,
} from './dto/auth-session.dto';
import { OAuthService } from './services/oauth.service';

function authContext(req: Request): AuthContext {
  return {
    ipAddress:
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() ?? req.ip,
    userAgent: req.headers['user-agent'],
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
  ) {}

  @Get('oauth/providers')
  listOAuthProviders() {
    return { providers: this.oauthService.getConfiguredProviders() };
  }

  @Get('oauth/:provider')
  startOAuth(
    @Param('provider') provider: string,
    @Query('ref') referralCode: string | undefined,
    @Res() res: Response,
  ) {
    this.oauthService.startOAuth(provider, res, referralCode);
  }

  @Get('oauth/:provider/callback')
  async oauthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.oauthService.handleCallback(
      provider,
      code,
      state,
      authContext(req),
    );
    res.redirect(redirectUrl);
  }

  @Post('oauth/complete')
  completeOAuth(@Body() dto: OAuthCompleteDto, @Req() req: Request) {
    return this.oauthService.completeOAuth(dto.token, authContext(req));
  }

  @Post('magic-link')
  requestMagicLink(@Body() dto: MagicLinkDto, @Req() req: Request) {
    return this.authService.requestMagicLink(dto, authContext(req));
  }

  @Post('magic-link/verify')
  verifyMagicLink(@Body() dto: VerifyMagicLinkDto, @Req() req: Request) {
    return this.authService.verifyMagicLink(dto.token, authContext(req));
  }

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, authContext(req));
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, authContext(req));
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(dto.refreshToken, authContext(req));
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.logout(dto.refreshToken, authContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(
    @Req() req: Request & { user: { id: string; sessionId?: string } },
  ) {
    return this.authService.logoutAll(
      req.user.id,
      req.user.sessionId,
      authContext(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  listSessions(
    @Req() req: Request & { user: { id: string; sessionId?: string } },
  ) {
    return this.authService.listSessions(req.user.id, req.user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  revokeSession(
    @Param('id') sessionId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.authService.revokeSession(
      req.user.id,
      sessionId,
      authContext(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('password/set')
  setPassword(
    @Body() dto: SetPasswordDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.authService.setPassword(req.user.id, dto, authContext(req));
  }

  @Post('password/forgot')
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.authService.requestPasswordReset(dto.email, authContext(req));
  }

  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(dto, authContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('onboarding')
  completeOnboarding(
    @Body() dto: CompleteOnboardingDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.authService.completeOnboarding(req.user.id, dto);
  }
}
