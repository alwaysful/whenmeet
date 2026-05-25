import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google ID 토큰',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjNmZhNmY1OTUwYTdjZTQ2NWZjZjI0N2FhMGIwOTQ4MjhhYzk1MmMiLCJ0eXAiOiJKV1QifQ...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
