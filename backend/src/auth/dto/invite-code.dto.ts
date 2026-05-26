import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class InviteCodeDto {
  @ApiProperty({
    description: '초대코드 (8자리)',
    example: 'ABC12345',
    minLength: 8,
    maxLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: '초대코드는 8자리여야 합니다.' })
  inviteCode!: string;
}
