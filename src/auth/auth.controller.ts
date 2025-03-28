import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleDto } from './dtos/google.dto';
import { JwtAuthGuard } from '@security/jwt.guard';
import { JwtUser } from '@security/jwt.strategy';
import { LoginDto, RefreshDto } from './dtos';
import { User } from '@security/user/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('google')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  signInWithGoogle(@Body() googleDto: GoogleDto) {
    console.log('googleDto', googleDto);
    return this._authService.signInWithGoogle(googleDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto) {
    const user = await this._authService.validateUser(dto.email, dto.password);

    if (!user) throw new UnauthorizedException();

    return this._authService.login(user);
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async refresh(@Body() dto: RefreshDto) {
    return this._authService.refreshTokens(dto.userId, dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: JwtUser) {
    return user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user: JwtUser) {
    await this._authService.logout(user.id);

    return { message: 'Logged out' };
  }
}
