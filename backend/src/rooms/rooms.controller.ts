import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: '방 생성' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  createRoom(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '방 정보 조회' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '방 없음' })
  getRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '방 정보 수정' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 404, description: '방 없음' })
  updateRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '방 삭제' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '방 없음' })
  deleteRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.deleteRoom(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: '방 멤버 목록 조회' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '방 없음' })
  getRoomMembers(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.getRoomMembers(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: '방 참여 (초대코드 사용)' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiBody({ type: JoinRoomDto })
  @ApiResponse({ status: 201, description: '참여 성공' })
  @ApiResponse({ status: 400, description: '잘못된 초대코드' })
  @ApiResponse({ status: 409, description: '이미 참여 중' })
  joinRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: JoinRoomDto,
  ) {
    return this.roomsService.joinRoom(id, dto.userId, dto.inviteCode);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '방 멤버 제거 (나가기)' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 204, description: '제거 성공' })
  @ApiResponse({ status: 404, description: '방 또는 멤버 없음' })
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.roomsService.removeMember(id, userId);
  }

  @Post(':id/regenerate-code')
  @ApiOperation({ summary: '초대코드 재생성' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiResponse({ status: 200, description: '재생성 성공' })
  @ApiResponse({ status: 404, description: '방 없음' })
  regenerateInviteCode(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.regenerateInviteCode(id);
  }
}
