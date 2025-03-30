import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleDto } from './dtos/google.dto';
import { LoginDto } from './dtos';
import { RequestWithCookies } from './types/requestCookies';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthGuard } from '@app/security/jwt.guard';
import { User } from '@app/security';
import { JwtUser } from '@app/security/strategies/data/strategies.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('google')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  signInWithGoogle(@Body() googleDto: GoogleDto) {
    return this._authService.signInWithGoogle(googleDto);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerData: RegisterDto) {
    return this._authService.register(registerData);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto) {
    const user = await this._authService.validateUser(dto.email, dto.password);

    if (!user) throw new UnauthorizedException();

    return this._authService.login(user);
  }

  @Post('refresh')
  async refresh(@Req() request: RequestWithCookies) {
    const refreshToken = request.cookies.refreshToken;
    const userId = request.cookies.userId;

    return this._authService.refreshTokens(userId, refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: JwtUser) {
    return this._authService.profile(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user: JwtUser) {
    await this._authService.logout(user.id);

    return { ok: true };
  }
}
