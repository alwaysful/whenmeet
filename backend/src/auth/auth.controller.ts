import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {

  // 구글 로그인 시작
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  // 구글 로그인 콜백
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: any) {
    return req.user;
  }
}