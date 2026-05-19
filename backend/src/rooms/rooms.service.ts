import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // 초대코드 생성
  private generateInviteCode(length = 6): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(
        Math.floor(Math.random() * chars.length),
      );
    }

    return result;
  }

  // 방 생성
  async createRoom(
    userId: number,
    dto: CreateRoomDto,
  ) {
    let inviteCode = this.generateInviteCode();

    // 중복 방지
    while (
      await this.prisma.room.findUnique({
        where: { inviteCode },
      })
    ) {
      inviteCode = this.generateInviteCode();
    }

    const room = await this.prisma.room.create({
      data: {
        title: dto.title,
        inviteCode,
        createdById: userId,

        members: {
          create: {
            userId,
          },
        },
      },

      include: {
        members: true,
      },
    });

    return room;
  }

  // 초대코드 입장
  async joinRoom(
    userId: number,
    dto: JoinRoomDto,
  ) {
    const room = await this.prisma.room.findUnique({
      where: {
        inviteCode: dto.inviteCode,
      },
    });

    if (!room) {
      throw new NotFoundException(
        '방을 찾을 수 없습니다.',
      );
    }

    const alreadyJoined =
      await this.prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: room.id,
            userId,
          },
        },
      });

    if (alreadyJoined) {
      throw new BadRequestException(
        '이미 참가한 방입니다.',
      );
    }

    await this.prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId,
      },
    });

    return {
      message: '방 참가 완료',
      roomId: room.id,
    };
  }

  // 방 조회
  async getRoom(roomId: number) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },

      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(
        '방을 찾을 수 없습니다.',
      );
    }

    return room;
  }
}