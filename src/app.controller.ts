import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/auth/google')
  signInWithGoogle() {
    return 'This route will sign in with google';
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
