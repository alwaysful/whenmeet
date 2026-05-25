import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Google OAuth 로그인',
    description: 'Google ID 토큰으로 로그인 또는 회원가입',
  })
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          name: '홍길동',
          profileImage: 'https://...',
          provider: 'GOOGLE',
        },
        isNewUser: false,
      },
    },
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.idToken);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '현재 로그인한 사용자 정보 조회',
    description: 'JWT 토큰으로 인증된 사용자 정보 반환',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        name: '홍길동',
        profileImage: 'https://...',
        provider: 'GOOGLE',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Access Token 갱신',
    description: '기존 토큰으로 새로운 Access Token 발급',
  })
  @ApiResponse({
    status: 200,
    description: '갱신 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async refresh(@Req() req) {
    return this.authService.refreshToken(req.user);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '로그아웃',
    description: '클라이언트에서 토큰 삭제 (서버는 상태 없음)',
  })
  @ApiResponse({ status: 204, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async logout() {
    // JWT는 stateless이므로 서버에서 할 일 없음
    // 클라이언트에서 토큰 삭제
    return;
  }
}
