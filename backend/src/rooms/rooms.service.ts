import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(dto: CreateRoomDto) {
    // 초대코드 생성
    const inviteCode = this.generateInviteCode();

    // 방 생성 및 생성자를 멤버로 추가
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        description: dto.description,
        inviteCode,
        members: {
          create: {
            userId: dto.creatorId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return room;
  }

  async findById(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('방을 찾을 수 없습니다.');
    }

    return room;
  }

  async findByInviteCode(inviteCode: string) {
    const room = await this.prisma.room.findUnique({
      where: { inviteCode },
      include: {
        members: true,
      },
    });

    if (!room) {
      throw new NotFoundException('유효하지 않은 초대코드입니다.');
    }

    return room;
  }

  async updateRoom(id: number, dto: UpdateRoomDto) {
    await this.findById(id);

    return this.prisma.room.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteRoom(id: number) {
    await this.findById(id);

    // 방 삭제 시 관련 데이터도 함께 삭제 (Cascade)
    return this.prisma.room.delete({
      where: { id },
    });
  }

  async getRoomMembers(id: number) {
    await this.findById(id);

    const members = await this.prisma.roomMember.findMany({
      where: { roomId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      ...m.user,
      joinedAt: m.joinedAt,
    }));
  }

  async joinRoom(roomId: number, userId: number, inviteCode: string) {
    const room = await this.findById(roomId);

    // 초대코드 검증
    if (room.inviteCode !== inviteCode) {
      throw new BadRequestException('잘못된 초대코드입니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('이미 참여 중인 방입니다.');
    }

    // 멤버 추가
    return this.prisma.roomMember.create({
      data: {
        userId,
        roomId,
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async removeMember(roomId: number, userId: number) {
    await this.findById(roomId);

    const member = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('방 멤버를 찾을 수 없습니다.');
    }

    // 멤버 제거
    await this.prisma.roomMember.delete({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    // 멤버가 0명이 되면 방 삭제
    const remainingMembers = await this.prisma.roomMember.count({
      where: { roomId },
    });

    if (remainingMembers === 0) {
      await this.deleteRoom(roomId);
    }
  }

  async regenerateInviteCode(id: number) {
    await this.findById(id);

    const newInviteCode = this.generateInviteCode();

    return this.prisma.room.update({
      where: { id },
      data: {
        inviteCode: newInviteCode,
        updatedAt: new Date(),
      },
    });
  }

  private generateInviteCode(): string {
    // 8자리 랜덤 영숫자 코드 생성
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}
