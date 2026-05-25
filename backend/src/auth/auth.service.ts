import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Google OAuth Client 초기화
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async googleLogin(idToken: string) {
    try {
      // Google ID 토큰 검증
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 Google 토큰입니다.');
      }

      const { sub: providerId, email, name, picture } = payload;

      // 기존 사용자 확인
      let user = await this.usersService.findByProviderId('GOOGLE', providerId);
      let isNewUser = false;

      if (!user) {
        // 신규 사용자 생성
        user = await this.usersService.createUser({
          email: email!,
          name: name || 'Google User',
          provider: 'GOOGLE',
          providerId,
          profileImage: picture,
        });
        isNewUser = true;
      }

      // JWT 토큰 생성
      const accessToken = this.generateAccessToken(user);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          provider: user.provider,
        },
        isNewUser,
      };
    } catch (error) {
      throw new UnauthorizedException('Google 로그인에 실패했습니다.');
    }
  }

  async refreshToken(user: any) {
    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }
}
