import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 기존 데이터 삭제 (개발 환경에서만)
  await prisma.datePreference.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // ========================================
  // 1. 사용자 생성
  // ========================================
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'hong@example.com',
        name: '홍길동',
        provider: 'GOOGLE',
        providerId: 'google-hong-123',
        profileImage: 'https://i.pravatar.cc/150?img=1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'kim@example.com',
        name: '김철수',
        provider: 'GOOGLE',
        providerId: 'google-kim-456',
        profileImage: 'https://i.pravatar.cc/150?img=2',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lee@example.com',
        name: '이영희',
        provider: 'GOOGLE',
        providerId: 'google-lee-789',
        profileImage: 'https://i.pravatar.cc/150?img=3',
      },
    }),
    prisma.user.create({
      data: {
        email: 'park@example.com',
        name: '박민수',
        provider: 'GOOGLE',
        providerId: 'google-park-101',
        profileImage: 'https://i.pravatar.cc/150?img=4',
      },
    }),
    prisma.user.create({
      data: {
        email: 'choi@example.com',
        name: '최지우',
        provider: 'GOOGLE',
        providerId: 'google-choi-202',
        profileImage: 'https://i.pravatar.cc/150?img=5',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // ========================================
  // 2. 방 생성
  // ========================================
  const room1 = await prisma.room.create({
    data: {
      name: '2024년 1월 팀 회의',
      description: '1월 정기 팀 회의 일정을 조율합니다.',
      inviteCode: 'TEAM2024',
      members: {
        create: [
          { userId: users[0].id }, // 홍길동
          { userId: users[1].id }, // 김철수
          { userId: users[2].id }, // 이영희
        ],
      },
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: '프로젝트 킥오프 미팅',
      description: '새 프로젝트 시작을 위한 킥오프 미팅 일정',
      inviteCode: 'KICKOFF1',
      members: {
        create: [
          { userId: users[0].id }, // 홍길동
          { userId: users[1].id }, // 김철수
          { userId: users[3].id }, // 박민수
          { userId: users[4].id }, // 최지우
        ],
      },
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: '주말 스터디 모임',
      description: '주말 스터디 가능한 날짜를 정해봅시다',
      inviteCode: 'STUDY123',
      members: {
        create: [
          { userId: users[2].id }, // 이영희
          { userId: users[3].id }, // 박민수
          { userId: users[4].id }, // 최지우
        ],
      },
    },
  });

  console.log('Created 3 rooms');

  // ========================================
  // 3. 날짜 선호도 생성 - Room 1
  // ========================================
  const today = new Date();
  const getDate = (daysFromNow: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };

  // Room 1: 2024년 1월 팀 회의
  await prisma.datePreference.createMany({
    data: [
      // 홍길동의 선호도
      { userId: users[0].id, roomId: room1.id, date: getDate(1), preference: 'GOOD' },
      { userId: users[0].id, roomId: room1.id, date: getDate(2), preference: 'GOOD' },
      { userId: users[0].id, roomId: room1.id, date: getDate(3), preference: 'NEUTRAL' },
      { userId: users[0].id, roomId: room1.id, date: getDate(4), preference: 'BAD' },
      { userId: users[0].id, roomId: room1.id, date: getDate(5), preference: 'GOOD' },

      // 김철수의 선호도
      { userId: users[1].id, roomId: room1.id, date: getDate(1), preference: 'NEUTRAL' },
      { userId: users[1].id, roomId: room1.id, date: getDate(2), preference: 'GOOD' },
      { userId: users[1].id, roomId: room1.id, date: getDate(3), preference: 'GOOD' },
      { userId: users[1].id, roomId: room1.id, date: getDate(4), preference: 'GOOD' },
      { userId: users[1].id, roomId: room1.id, date: getDate(5), preference: 'BAD' },

      // 이영희의 선호도
      { userId: users[2].id, roomId: room1.id, date: getDate(1), preference: 'BAD' },
      { userId: users[2].id, roomId: room1.id, date: getDate(2), preference: 'GOOD' },
      { userId: users[2].id, roomId: room1.id, date: getDate(3), preference: 'GOOD' },
      { userId: users[2].id, roomId: room1.id, date: getDate(4), preference: 'NEUTRAL' },
      { userId: users[2].id, roomId: room1.id, date: getDate(5), preference: 'NEUTRAL' },
    ],
  });

  // Room 2: 프로젝트 킥오프 미팅
  await prisma.datePreference.createMany({
    data: [
      // 홍길동
      { userId: users[0].id, roomId: room2.id, date: getDate(7), preference: 'GOOD' },
      { userId: users[0].id, roomId: room2.id, date: getDate(8), preference: 'GOOD' },
      { userId: users[0].id, roomId: room2.id, date: getDate(9), preference: 'NEUTRAL' },
      { userId: users[0].id, roomId: room2.id, date: getDate(10), preference: 'BAD' },

      // 김철수
      { userId: users[1].id, roomId: room2.id, date: getDate(7), preference: 'GOOD' },
      { userId: users[1].id, roomId: room2.id, date: getDate(8), preference: 'NEUTRAL' },
      { userId: users[1].id, roomId: room2.id, date: getDate(9), preference: 'GOOD' },
      { userId: users[1].id, roomId: room2.id, date: getDate(10), preference: 'GOOD' },

      // 박민수
      { userId: users[3].id, roomId: room2.id, date: getDate(7), preference: 'GOOD' },
      { userId: users[3].id, roomId: room2.id, date: getDate(8), preference: 'GOOD' },
      { userId: users[3].id, roomId: room2.id, date: getDate(9), preference: 'BAD' },
      { userId: users[3].id, roomId: room2.id, date: getDate(10), preference: 'NEUTRAL' },

      // 최지우
      { userId: users[4].id, roomId: room2.id, date: getDate(7), preference: 'NEUTRAL' },
      { userId: users[4].id, roomId: room2.id, date: getDate(8), preference: 'GOOD' },
      { userId: users[4].id, roomId: room2.id, date: getDate(9), preference: 'GOOD' },
      { userId: users[4].id, roomId: room2.id, date: getDate(10), preference: 'BAD' },
    ],
  });

  // Room 3: 주말 스터디 모임
  await prisma.datePreference.createMany({
    data: [
      // 이영희
      { userId: users[2].id, roomId: room3.id, date: getDate(14), preference: 'GOOD' },
      { userId: users[2].id, roomId: room3.id, date: getDate(15), preference: 'GOOD' },
      { userId: users[2].id, roomId: room3.id, date: getDate(21), preference: 'NEUTRAL' },
      { userId: users[2].id, roomId: room3.id, date: getDate(22), preference: 'BAD' },

      // 박민수
      { userId: users[3].id, roomId: room3.id, date: getDate(14), preference: 'NEUTRAL' },
      { userId: users[3].id, roomId: room3.id, date: getDate(15), preference: 'GOOD' },
      { userId: users[3].id, roomId: room3.id, date: getDate(21), preference: 'GOOD' },
      { userId: users[3].id, roomId: room3.id, date: getDate(22), preference: 'GOOD' },

      // 최지우
      { userId: users[4].id, roomId: room3.id, date: getDate(14), preference: 'BAD' },
      { userId: users[4].id, roomId: room3.id, date: getDate(15), preference: 'GOOD' },
      { userId: users[4].id, roomId: room3.id, date: getDate(21), preference: 'GOOD' },
      { userId: users[4].id, roomId: room3.id, date: getDate(22), preference: 'NEUTRAL' },
    ],
  });

  console.log('Created date preferences for all rooms');

  // ========================================
  // 4. 결과 출력
  // ========================================
  console.log('\nSeed Summary:');
  console.log('================');
  console.log(`Users: ${users.length}`);
  console.log(`Rooms: 3`);
  console.log(`Room Members: ${await prisma.roomMember.count()}`);
  console.log(`Date Preferences: ${await prisma.datePreference.count()}`);
  console.log('\nSeed completed successfully!\n');

  // 생성된 데이터 상세 정보
  console.log('Created Users:');
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name} (${user.email})`);
  });

  console.log('\nCreated Rooms:');
  console.log(`  1. ${room1.name} - Code: ${room1.inviteCode}`);
  console.log(`  2. ${room2.name} - Code: ${room2.inviteCode}`);
  console.log(`  3. ${room3.name} - Code: ${room3.inviteCode}`);

  console.log('\nTest with these invite codes:');
  console.log(`  - TEAM2024 (팀 회의)`);
  console.log(`  - KICKOFF1 (킥오프 미팅)`);
  console.log(`  - STUDY123 (스터디 모임)`);
}

main()
  .catch((e) => {
    console.error('Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
