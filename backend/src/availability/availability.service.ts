import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PreferenceType } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async savePreferences(
    userId: number,
    roomId: number,
    preferences: Array<{ date: Date; preference: PreferenceType }>,
  ) {
    // 방 멤버십 검증
    await this.validateRoomMembership(userId, roomId);

    // 여러 날짜 선호도를 트랜잭션으로 일괄 저장
    const operations = preferences.map((pref) =>
      this.prisma.datePreference.upsert({
        where: {
          userId_roomId_date: {
            userId,
            roomId,
            date: pref.date,
          },
        },
        update: {
          preference: pref.preference,
          updatedAt: new Date(),
        },
        create: {
          userId,
          roomId,
          date: pref.date,
          preference: pref.preference,
        },
      }),
    );

    const results = await this.prisma.$transaction(operations);

    return {
      message: `${results.length}개의 날짜 선호도가 저장되었습니다.`,
      count: results.length,
      preferences: results,
    };
  }

  async getUserPreferences(userId: number, roomId: number) {
    // 방 멤버십 검증
    await this.validateRoomMembership(userId, roomId);

    const preferences = await this.prisma.datePreference.findMany({
      where: { userId, roomId },
      orderBy: { date: 'asc' },
    });

    return {
      userId,
      roomId,
      count: preferences.length,
      preferences,
    };
  }

  async getRoomAvailability(roomId: number) {
    // 방 존재 여부 확인
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('방을 찾을 수 없습니다.');
    }

    const preferences = await this.prisma.datePreference.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // 날짜별로 그룹화하여 통계 계산
    const dateMap = new Map();

    preferences.forEach((pref) => {
      const dateKey = pref.date.toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: pref.date,
          good: 0,
          neutral: 0,
          bad: 0,
          total: 0,
          users: [],
        });
      }

      const dateData = dateMap.get(dateKey);
      dateData[pref.preference.toLowerCase()]++;
      dateData.total++;
      dateData.users.push({
        ...pref.user,
        preference: pref.preference,
      });
    });

    const totalMembers = room._count.members;

    return Array.from(dateMap.values()).map((data) => ({
      ...data,
      score: this.calculateScore(data.good, data.neutral, data.bad),
      percentage: {
        good: this.calculatePercentage(data.good, totalMembers),
        neutral: this.calculatePercentage(data.neutral, totalMembers),
        bad: this.calculatePercentage(data.bad, totalMembers),
      },
      responseRate: this.calculatePercentage(data.total, totalMembers),
    }));
  }

  async getBestDates(roomId: number) {
    const availability = await this.getRoomAvailability(roomId);

    // 점수 기준으로 내림차순 정렬
    return availability
      .sort((a, b) => {
        // 1순위: score (높을수록 좋음)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // 2순위: good 개수 (많을수록 좋음)
        if (b.good !== a.good) {
          return b.good - a.good;
        }
        // 3순위: bad 개수 (적을수록 좋음)
        return a.bad - b.bad;
      })
      .slice(0, 10); // 상위 10개만 반환
  }

  async deleteUserPreferences(userId: number, roomId: number) {
    await this.validateRoomMembership(userId, roomId);

    await this.prisma.datePreference.deleteMany({
      where: { userId, roomId },
    });
  }

  async deleteSpecificPreference(
    userId: number,
    roomId: number,
    date: Date,
  ) {
    await this.validateRoomMembership(userId, roomId);

    await this.prisma.datePreference.delete({
      where: {
        userId_roomId_date: {
          userId,
          roomId,
          date,
        },
      },
    });
  }

  private async validateRoomMembership(userId: number, roomId: number) {
    const membership = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('방 멤버가 아닙니다.');
    }

    return membership;
  }

  private calculateScore(good: number, neutral: number, bad: number): number {
    // 점수 계산: GOOD(+1), NEUTRAL(0), BAD(-1)
    return good - bad;
  }

  private calculatePercentage(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100 * 10) / 10; // 소수점 첫째자리
  }
}
