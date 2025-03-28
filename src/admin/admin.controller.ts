import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/google/calendar/connect')
  connectGoogleCalendar() {
    return this.adminService.googleConnectLinkGeneration();
  }

  @Get('/google/calendar/callback')
  @Redirect()
  async googleCalendarCallback(@Query('code') code: string) {
    const tokens = await this.adminService.handleGoogleCallback(code);

    if (!tokens.refresh_token) {
      throw new BadRequestException('Missing refresh_token');
    }

    // TODO: Save refresh_token to DB tied to doctorId
    console.log(tokens);

    const frontendUrl = this.configService.get<string>('APP_FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('APP_FRONTEND_URL is not defined');
    }

    return {
      url: `${frontendUrl}/google/calendar/success`,
    };
  }
}
