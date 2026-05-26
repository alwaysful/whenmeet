import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthProvider } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async googleLogin(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 Google 토큰입니다.');
      }

      const { sub: providerId, email, name, picture } = payload;

      let user = await this.usersService.findByProviderId(AuthProvider.GOOGLE, providerId);
      let isNewUser = false;

      if (!user) {
        user = await this.usersService.createUser({
          email: email!,
          name: name || 'Google User',
          provider: AuthProvider.GOOGLE,  // enum 사용
          providerId,
          profileImage: picture,
        });
        isNewUser = true;
      }

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
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Google 로그인에 실패했습니다.');
    }
  }

  async refreshToken(user: any) {
    return { accessToken: this.generateAccessToken(user) };
  }

  private generateAccessToken(user: any): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
  }

  async validateUser(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    return user;
  }
}
