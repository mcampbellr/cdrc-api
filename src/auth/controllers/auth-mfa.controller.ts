import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthMFAService } from './auth-mfa.service';
import { JwtPreAuthGuard, JwtStrictAuthGuard, User } from '@app/security';
import { JwtUser } from '@app/security/strategies/data/strategies.interface';
import { MFABodyDto } from './dtos/mfa.dto';
import { Response } from 'express';
import { AuthUtils } from './auth.utils';

@Controller('auth/mfa')
export class AuthMFAController {
  constructor(
    private readonly _authMFAService: AuthMFAService,
    private readonly _authUtils: AuthUtils,
  ) {}

  @Get('setup')
  @UseGuards(JwtStrictAuthGuard)
  async getMFASetup(@User() user: JwtUser) {
    const mfa = await this._authMFAService.generateMFAForUser(user.id);

    return {
      mfaSecret: mfa.secret,
      mfaOtpauthUrl: mfa.otpauthUrl,
    };
  }

  @Post('enable')
  @UseGuards(JwtStrictAuthGuard)
  async enableMFAForUser(@User() user: JwtUser, @Body() data: MFABodyDto) {
    return this._authMFAService.enableMFAForUser(user.id, data.mfaToken);
  }

  @Post('validate')
  @UseGuards(JwtPreAuthGuard)
  async validateMFAForUser(
    @User() user: JwtUser,
    @Body() data: MFABodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this._authMFAService.validateMFAForUser(
      user.id,
      data.mfaToken,
    );

    this._authUtils.setAuthCookies(res, tokens.refreshToken, user.id);

    return {
      accessToken: tokens.accessToken,
      deviceId: tokens.deviceId,
    };
  }
}
