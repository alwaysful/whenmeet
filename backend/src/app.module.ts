// src/app.module.ts

import { Module } from '@nestjs/common';

import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    RoomsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}