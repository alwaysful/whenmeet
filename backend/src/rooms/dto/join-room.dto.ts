import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @ApiProperty({
    description: '초대코드 (8자리)',
    example: 'ABC12345',
  })
  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}
