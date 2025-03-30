import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthMFAService } from './auth-mfa.service';
import { JwtStrictAuthGuard, User } from '@app/security';
import { JwtUser } from '@app/security/strategies/data/strategies.interface';

@Controller('auth/mfa')
export class AuthMFAController {
  constructor(private readonly _authMFAService: AuthMFAService) {}

  @Post('generate')
  @UseGuards(JwtStrictAuthGuard)
  async generateMFA(@User() user: JwtUser) {
    const mfa = await this._authMFAService.generateMFAForUser(user.id);

    return {
      mfaSecret: mfa.secret,
      mfaQrCode: mfa.qrCode,
      mfaOtpauthUrl: mfa.otpauthUrl,
    };
  }
}
