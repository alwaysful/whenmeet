import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: '방 이름', example: '2024년 1월 회의' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '방 설명', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
