import { UsersRepository } from '@app/database';
import { MFAService } from '@app/security/services/mfa.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AuthMFAService {
  constructor(
    private readonly _MFAService: MFAService,
    private readonly _usersRepository: UsersRepository,
  ) {}

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
