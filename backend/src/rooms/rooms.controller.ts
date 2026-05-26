import {
  Body, Controller, Delete, Get, Param,
  ParseIntPipe, Patch, Post, HttpCode,
  HttpStatus, UseGuards, Req,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiParam, ApiBody, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: '방 생성' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: '생성 성공' })
  createRoom(@Req() req: Request, @Body() dto: CreateRoomDto) {
    const userId = (req.user as any).sub;
    return this.roomsService.createRoom(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '방 정보 조회' })
  @ApiParam({ name: 'id', description: '방 ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '방 정보 수정' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateRoomDto })
  updateRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '방 삭제' })
  @ApiParam({ name: 'id' })
  deleteRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.deleteRoom(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: '방 멤버 목록 조회' })
  @ApiParam({ name: 'id' })
  getRoomMembers(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.getRoomMembers(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: '방 참여 (초대코드)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: JoinRoomDto })
  joinRoom(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: JoinRoomDto,
  ) {
    const userId = (req.user as any).sub;
    return this.roomsService.joinRoom(id, userId, dto.inviteCode);
  }

  @Delete(':id/members')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '방 나가기' })
  @ApiParam({ name: 'id' })
  leaveRoom(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any).sub;
    return this.roomsService.removeMember(id, userId);
  }

  @Post(':id/regenerate-code')
  @ApiOperation({ summary: '초대코드 재생성' })
  @ApiParam({ name: 'id' })
  regenerateInviteCode(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.regenerateInviteCode(id);
  }
}
