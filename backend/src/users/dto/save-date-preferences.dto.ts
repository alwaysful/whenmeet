import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsDate, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum PreferenceType {
  GOOD = 'GOOD',
  NEUTRAL = 'NEUTRAL',
  BAD = 'BAD',
}

export class DatePreferenceItemDto {
  @ApiProperty({
    description: '날짜',
    example: '2024-01-15',
  })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description: '선호도 (GOOD: 좋음/초록, NEUTRAL: 보통/노랑, BAD: 나쁨/빨강)',
    enum: PreferenceType,
    example: 'GOOD',
  })
  @IsEnum(PreferenceType)
  preference: PreferenceType;
}

export class SaveDatePreferencesDto {
  @ApiProperty({
    description: '방 ID',
    example: 1,
  })
  @IsInt()
  roomId: number;

  @ApiProperty({
    description: '날짜 선호도 목록 (1개 이상)',
    type: [DatePreferenceItemDto],
    example: [
      { date: '2024-01-15', preference: 'GOOD' },
      { date: '2024-01-16', preference: 'NEUTRAL' },
      { date: '2024-01-17', preference: 'BAD' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DatePreferenceItemDto)
  preferences: DatePreferenceItemDto[];
}
