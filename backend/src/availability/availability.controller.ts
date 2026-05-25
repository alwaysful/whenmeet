import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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

import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @ApiOperation({
    summary: '날짜 선호도 저장 (일괄)',
    description: '사용자의 여러 날짜 선호도를 한 번에 저장',
  })
  @ApiBody({ type: CreateAvailabilityDto })
  @ApiResponse({ status: 201, description: '저장 성공' })
  @ApiResponse({ status: 404, description: '방 또는 사용자 없음' })
  createAvailability(@Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.savePreferences(
      dto.userId,
      dto.roomId,
      dto.preferences,
    );
  }

  @Get('users/:userId/rooms/:roomId')
  @ApiOperation({
    summary: '특정 사용자의 날짜 선호도 조회',
    description: '특정 방에서 사용자가 설정한 모든 날짜 선호도 조회',
  })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiParam({ name: 'roomId', description: '방 ID' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '방 멤버가 아님' })
  getUserPreferences(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.availabilityService.getUserPreferences(userId, roomId);
  }

  @Get('rooms/:roomId')
  @ApiOperation({
    summary: '방의 전체 날짜 선호도 통계',
    description: '모든 멤버의 선호도를 날짜별로 집계하여 최적의 날짜 추천',
  })
  @ApiParam({ name: 'roomId', description: '방 ID' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: [
        {
          date: '2024-01-15',
          good: 5,
          neutral: 2,
          bad: 1,
          total: 8,
          score: 4,
          percentage: {
            good: 62.5,
            neutral: 25,
            bad: 12.5,
          },
          users: [
            {
              id: 1,
              name: '홍길동',
              profileImage: 'https://...',
              preference: 'GOOD',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '방 없음' })
  getRoomAvailability(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.availabilityService.getRoomAvailability(roomId);
  }

  @Get('rooms/:roomId/best-dates')
  @ApiOperation({
    summary: '최적의 날짜 추천',
    description: 'GOOD이 가장 많고 BAD가 가장 적은 날짜 순으로 정렬',
  })
  @ApiParam({ name: 'roomId', description: '방 ID' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  getBestDates(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.availabilityService.getBestDates(roomId);
  }

  @Delete('users/:userId/rooms/:roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '사용자의 모든 날짜 선호도 삭제',
    description: '특정 방에서 사용자가 설정한 모든 선호도 삭제',
  })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiParam({ name: 'roomId', description: '방 ID' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  deleteUserPreferences(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.availabilityService.deleteUserPreferences(userId, roomId);
  }

  @Delete('users/:userId/rooms/:roomId/dates/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '특정 날짜의 선호도 삭제',
    description: '사용자가 설정한 특정 날짜의 선호도만 삭제',
  })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiParam({ name: 'roomId', description: '방 ID' })
  @ApiParam({ name: 'date', description: '날짜 (YYYY-MM-DD)', example: '2024-01-15' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  deleteSpecificPreference(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('date') date: string,
  ) {
    return this.availabilityService.deleteSpecificPreference(
      userId,
      roomId,
      new Date(date),
    );
  }
}
