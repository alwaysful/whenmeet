import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { RoomsService } from './rooms.service';

import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
  ) {}

  // 방 생성
  @Post()
  createRoom(
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.createRoom(
      1,
      dto,
    );
  }

  // 초대코드 입장
  @Post('join')
  joinRoom(
    @Body() dto: JoinRoomDto,
  ) {
    return this.roomsService.joinRoom(
      1,
      dto,
    );
  }

  // 방 조회
  @Get(':id')
  getRoom(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.roomsService.getRoom(id);
  }
}