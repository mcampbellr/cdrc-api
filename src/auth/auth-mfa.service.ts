import { UsersRepository } from '@app/database';
import { MFAService } from '@app/security/services/mfa.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMFAService {
  constructor(
    private readonly _MFAService: MFAService,
    private readonly _usersRepository: UsersRepository,
    private readonly _authService: AuthService,
  ) {}

  async validateMFAForUser(userId: string, mfaToken: string) {
    const user = await this._usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('MFA not enabled');
    }

    const isValid = await this._MFAService.verifyMFACode(user, mfaToken);

    if (!isValid) {
      throw new BadRequestException('Invalid MFA token');
    }

    return this._authService.login(user);
  }

  async enableMFAForUser(userId: string, mfaToken: string) {
    const user = await this._usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('MFA already enabled');
    }

    const isValid = await this._MFAService.verifyMFACode(user, mfaToken);

    if (!isValid) {
      throw new BadRequestException('Invalid MFA token');
    }

    await this._usersRepository.enableMFAForUser(user.id);

    return { message: 'MFA enabled' };
  }

  async generateMFAForUser(userId: string) {
    const user = await this._usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('MFA already enabled');
    }

    const mfa = await this._MFAService.generateUserMFA(user);

    await this._usersRepository.addUserMfa(user.id, mfa.encryptSecret);

    return mfa;
  }
}
