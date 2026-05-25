import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: '방 이름',
    example: '2024년 1월 회의',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: '방 설명',
    example: '1월 정기 회의 일정 조율',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '방 생성자 ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  creatorId!: number;
}
