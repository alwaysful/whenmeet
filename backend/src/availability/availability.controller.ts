import {
  Body, Controller, Delete, Get, Param,
  ParseIntPipe, Post, HttpCode, HttpStatus,
  UseGuards, Req,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiParam, ApiBody, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@ApiTags('Availability')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @ApiOperation({ summary: '날짜 선호도 저장 (일괄)' })
  @ApiBody({ type: CreateAvailabilityDto })
  @ApiResponse({ status: 201 })
  createAvailability(@Req() req: Request, @Body() dto: CreateAvailabilityDto) {
    const userId = (req.user as any).sub;
    return this.availabilityService.savePreferences(userId, dto.roomId, dto.preferences);
  }

  @Get('rooms/:roomId/my')
  @ApiOperation({ summary: '내 날짜 선호도 조회' })
  @ApiParam({ name: 'roomId' })
  getMyPreferences(
    @Req() req: Request,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const userId = (req.user as any).sub;
    return this.availabilityService.getUserPreferences(userId, roomId);
  }

  @Get('rooms/:roomId')
  @ApiOperation({ summary: '방 전체 날짜 선호도 통계' })
  @ApiParam({ name: 'roomId' })
  getRoomAvailability(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.availabilityService.getRoomAvailability(roomId);
  }

  @Get('rooms/:roomId/best-dates')
  @ApiOperation({ summary: '최적 날짜 추천' })
  @ApiParam({ name: 'roomId' })
  getBestDates(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.availabilityService.getBestDates(roomId);
  }

  @Delete('rooms/:roomId/my')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '내 모든 날짜 선호도 삭제' })
  @ApiParam({ name: 'roomId' })
  deleteMyPreferences(
    @Req() req: Request,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const userId = (req.user as any).sub;
    return this.availabilityService.deleteUserPreferences(userId, roomId);
  }

  @Delete('rooms/:roomId/my/dates/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '특정 날짜 선호도 삭제' })
  @ApiParam({ name: 'roomId' })
  @ApiParam({ name: 'date', example: '2024-01-15' })
  deleteSpecificPreference(
    @Req() req: Request,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('date') date: string,
  ) {
    const userId = (req.user as any).sub;
    // 타임존 이슈 방지: UTC 정오로 파싱
    const parsedDate = new Date(`${date}T12:00:00.000Z`);
    return this.availabilityService.deleteSpecificPreference(userId, roomId, parsedDate);
  }
}
