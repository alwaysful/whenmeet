import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    // deletedAt이 있으면 삭제된 사용자
    if (user.deletedAt) {
      throw new NotFoundException('삭제된 사용자입니다.');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByProviderId(provider: string, providerId: string) {
    return this.prisma.user.findFirst({
      where: {
        provider,
        providerId,
        deletedAt: null,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    // 이메일 중복 체크
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        provider: dto.provider,
        providerId: dto.providerId,
        profileImage: dto.profileImage,
      },
    });
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async updateProfileImage(id: number, imageUrl: string) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        profileImage: imageUrl,
        updatedAt: new Date(),
      },
    });
  }

  async deleteUser(id: number) {
    await this.findById(id);

    // 소프트 삭제
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getUserRooms(userId: number) {
    await this.findById(userId);

    const memberships = await this.prisma.roomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      id: m.room.id,
      name: m.room.name,
      description: m.room.description,
      inviteCode: m.room.inviteCode,
      createdAt: m.room.createdAt,
      memberCount: m.room._count.members,
      joinedAt: m.joinedAt,
    }));
  }

  async joinRoomByInviteCode(userId: number, inviteCode: string) {
    await this.findById(userId);

    const room = await this.prisma.room.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('유효하지 않은 초대코드입니다.');
    }

    const isAlreadyMember = room.members.some((m) => m.userId === userId);
    if (isAlreadyMember) {
      throw new ConflictException('이미 참여 중인 방입니다.');
    }

    return this.prisma.roomMember.create({
      data: {
        userId,
        roomId: room.id,
      },
      include: {
        room: true,
      },
    });
  }
}
