import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  private readonly environment: string;
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {
    this.environment = this.configService.get<string>('NODE_ENV');
  }

  @Get('/google/login')
  connectGoogle() {
    return this.adminService.googleConnectLink();
  }

  @Get('/google/callback')
  @Redirect()
  async googleCalendarCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.adminService.handleGoogleCallback(code);

      const frontendUrl = this.configService.get<string>('APP_FRONTEND_URL');

      if (!frontendUrl) {
        throw new Error('APP_FRONTEND_URL is not defined');
      }

      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: this.environment === 'production',
        sameSite: this.environment === 'production' ? 'none' : 'lax',
      };

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      res.cookie('userId', result.user.id, cookieOptions);

      return {
        url: `${frontendUrl}/google/success?at=${result.accessToken}`,
      };
    } catch (e) {
      const frontendUrl = this.configService.get<string>('APP_FRONTEND_URL');
      if (!frontendUrl) {
        throw new Error('APP_FRONTEND_URL is not defined');
      }
      return {
        url: `${frontendUrl}/google/failure`,
      };
    }
  }
}
