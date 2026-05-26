import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({ description: '초대코드 (8자리)', example: 'ABC12345' })
  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}
