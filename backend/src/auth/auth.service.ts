import { Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;

    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,

          nickname: profile.displayName,

          profileImage: profile.photos?.[0]?.value,

          provider: 'GOOGLE',

          providerId: profile.id,
        },
      });
    }

    const token = await this.generateToken(user.id);

    return {
      user,
      accessToken: token,
    };
  }

  async generateToken(userId: number) {
    return this.jwtService.sign({
      sub: userId,
    });
  }
}