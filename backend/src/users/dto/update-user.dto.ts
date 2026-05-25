import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
