import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { AvailabilityModule } from './availability/availability.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 사용 가능
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    RoomsModule,
    AvailabilityModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
