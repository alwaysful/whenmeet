import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoomDto {
  @ApiPropertyOptional({
    description: '방 이름',
    example: '2024년 1월 회의 (수정)',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: '방 설명',
    example: '1월 정기 회의 일정 조율 (수정)',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
