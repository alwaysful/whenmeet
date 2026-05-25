import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum AuthProvider {
  GOOGLE = 'GOOGLE',
}

export class CreateUserDto {
  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'OAuth 제공자',
    enum: AuthProvider,
    example: 'GOOGLE',
  })
  @IsEnum(AuthProvider)
  @IsNotEmpty()
  provider: AuthProvider;

  @ApiProperty({
    description: 'OAuth 제공자의 사용자 ID',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
