import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/security/jwt.guard';
import { User } from '@app/security';
import { JwtUser } from '@app/security/strategies/data/strategies.interface';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthUtils } from '../auth.utils';
import { SocialDto, SignInResponseWithSocialDto } from '../dtos/social.dto';
import { LoginDto } from '../dtos/login.dto';
import { RequestWithCookies } from '../types/requestCookies';
import { ApiResponse } from '@nestjs/swagger';
import { RefreshTokenDto, RefreshTokensResponeseDto } from '../dtos';
import { HttpStatusCode } from 'axios';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _authUtils: AuthUtils,
  ) {}

  @Post('social')
  @ApiResponse({
    status: HttpStatusCode.Ok,
    description: 'Successful login',
    type: SignInResponseWithSocialDto,
  })
  signInWithSocial(
    @Body() soialDto: SocialDto,
  ): Promise<SignInResponseWithSocialDto> {
    return this._authService.signInWithSocial(soialDto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this._authService.validateUser(dto.email, dto.password);

    if (!user) throw new UnauthorizedException();

    return this._authService.login(user);
  }

  @Post('refresh')
  @ApiResponse({
    status: HttpStatusCode.Ok,
    description: 'Tokens refreshed',
    type: RefreshTokensResponeseDto,
  })
  async refresh(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
    @Body() data: RefreshTokenDto,
  ): Promise<RefreshTokensResponeseDto> {
    let refreshToken = request.cookies.refreshToken;
    let userId = request.cookies.userId;

    if (!refreshToken) {
      if (!data.refreshToken || !data.userId) {
        throw new UnauthorizedException();
      }
      refreshToken = data.refreshToken;
      userId = data.userId;
    }

    if (!refreshToken || !userId) {
      throw new UnauthorizedException();
    }
    const tokens = await this._authService.refreshTokens(userId, refreshToken);

    this._authUtils.setAuthCookies(res, tokens.refreshToken, userId);

    if (data.refreshToken) {
      return {
        accessToken: tokens.accessToken,
        deviceId: tokens.deviceId,
        refreshToken: tokens.refreshToken,
      };
    }

    return {
      accessToken: tokens.accessToken,
      deviceId: tokens.deviceId,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: JwtUser) {
    return this._authService.profile(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @User() user: JwtUser,
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
    @Body() data: RefreshTokenDto,
  ) {
    const refreshToken = request.cookies.refreshToken || data.refreshToken;

    if (!refreshToken && !data.refreshToken) {
      throw new UnauthorizedException();
    }

    this._authService.logout(user.id, refreshToken);

    this._authUtils.clearAuthCookies(response);

    return { ok: true };
  }
}
